// Node.js script for integrating with external APIs and managing data flow

import fetch from "node-fetch"
import sqlite3 from "sqlite3"
import { promisify } from "util"

class APIIntegration {
  constructor() {
    this.db = new sqlite3.Database("./crypto_banking.db")
    this.dbRun = promisify(this.db.run.bind(this.db))
    this.dbGet = promisify(this.db.get.bind(this.db))
    this.dbAll = promisify(this.db.all.bind(this.db))

    // API endpoints
    this.coinGeckoAPI = "https://api.coingecko.com/api/v3"
    this.exchangeRateAPI = "https://api.exchangerate-api.com/v4/latest"
    this.blockchainAPIs = {
      bitcoin: "https://blockstream.info/api",
      ethereum: "https://api.etherscan.io/api",
    }
  }

  async initializeDatabase() {
    console.log("Initializing database...")

    const tables = [
      `CREATE TABLE IF NOT EXISTS api_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                endpoint TEXT NOT NULL,
                data TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
      `CREATE TABLE IF NOT EXISTS api_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                api_name TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                status_code INTEGER,
                response_time INTEGER,
                error_message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
    ]

    for (const table of tables) {
      await this.dbRun(table)
    }

    console.log("Database initialized successfully")
  }

  async fetchWithCache(endpoint, cacheKey, cacheDuration = 300) {
    // Check cache first
    const cached = await this.dbGet(
      'SELECT data, expires_at FROM api_cache WHERE endpoint = ? AND expires_at > datetime("now")',
      [cacheKey],
    )

    if (cached) {
      console.log(`Cache hit for ${cacheKey}`)
      return JSON.parse(cached.data)
    }

    // Fetch from API
    const startTime = Date.now()
    try {
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "CryptoBankingPlatform/1.0",
        },
        timeout: 30000,
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Cache the response
      const expiresAt = new Date(Date.now() + cacheDuration * 1000).toISOString()
      await this.dbRun("INSERT OR REPLACE INTO api_cache (endpoint, data, expires_at) VALUES (?, ?, ?)", [
        cacheKey,
        JSON.stringify(data),
        expiresAt,
      ])

      // Log successful request
      await this.logAPICall(endpoint, cacheKey, response.status, responseTime)

      return data
    } catch (error) {
      const responseTime = Date.now() - startTime
      await this.logAPICall(endpoint, cacheKey, 0, responseTime, error.message)
      throw error
    }
  }

  async logAPICall(apiName, endpoint, statusCode, responseTime, errorMessage = null) {
    await this.dbRun(
      "INSERT INTO api_logs (api_name, endpoint, status_code, response_time, error_message) VALUES (?, ?, ?, ?, ?)",
      [apiName, endpoint, statusCode, responseTime, errorMessage],
    )
  }

  async fetchCryptoPrices() {
    console.log("Fetching cryptocurrency prices...")

    const endpoint = `${this.coinGeckoAPI}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1`
    const cacheKey = "crypto_prices"

    try {
      const data = await this.fetchWithCache(endpoint, cacheKey, 60) // Cache for 1 minute

      // Process and store data
      for (const coin of data) {
        await this.dbRun(
          `
                    INSERT OR REPLACE INTO crypto_prices 
                    (coin_id, symbol, name, current_price, market_cap, volume_24h, price_change_percentage_24h, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
          [
            coin.id,
            coin.symbol,
            coin.name,
            coin.current_price,
            coin.market_cap,
            coin.total_volume,
            coin.price_change_percentage_24h,
            new Date().toISOString(),
          ],
        )
      }

      console.log(`Updated ${data.length} cryptocurrency prices`)
      return data
    } catch (error) {
      console.error("Error fetching crypto prices:", error.message)
      return null
    }
  }

  async fetchExchangeRates() {
    console.log("Fetching exchange rates...")

    const endpoint = `${this.exchangeRateAPI}/USD`
    const cacheKey = "exchange_rates"

    try {
      const data = await this.fetchWithCache(endpoint, cacheKey, 300) // Cache for 5 minutes

      // Generate bank rates with spreads
      const bankNames = ["JPMorgan Chase", "Bank of America", "Wells Fargo", "Citibank", "HSBC"]
      const currencyPairs = ["EUR", "GBP", "JPY", "CAD", "AUD", "CHF"]

      for (const bank of bankNames) {
        for (const currency of currencyPairs) {
          if (data.rates[currency]) {
            const baseRate = data.rates[currency]
            const spread = baseRate * (Math.random() * 0.02 + 0.01) // 1-3% spread

            const buyRate = baseRate + spread / 2
            const sellRate = baseRate - spread / 2

            await this.dbRun(
              `
                            INSERT OR REPLACE INTO bank_rates 
                            (bank_name, currency_pair, buy_rate, sell_rate, spread, last_updated)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `,
              [bank, `USD/${currency}`, buyRate, sellRate, spread, new Date().toISOString()],
            )
          }
        }
      }

      console.log("Updated bank exchange rates")
      return data
    } catch (error) {
      console.error("Error fetching exchange rates:", error.message)
      return null
    }
  }

  async monitorBitcoinTransactions() {
    console.log("Monitoring Bitcoin transactions...")

    const endpoint = `${this.blockchainAPIs.bitcoin}/blocks`
    const cacheKey = "bitcoin_blocks"

    try {
      const blocks = await this.fetchWithCache(endpoint, cacheKey, 30) // Cache for 30 seconds

      if (blocks && blocks.length > 0) {
        const latestBlock = blocks[0]
        const txEndpoint = `${this.blockchainAPIs.bitcoin}/block/${latestBlock.id}/txs`
        const txCacheKey = `bitcoin_txs_${latestBlock.id}`

        const transactions = await this.fetchWithCache(txEndpoint, txCacheKey, 300)

        // Process transactions
        for (const tx of transactions.slice(0, 10)) {
          // Limit to 10 transactions
          const totalOutput = tx.vout.reduce((sum, output) => sum + output.value, 0)
          const amountBTC = totalOutput / 100000000 // Convert satoshis to BTC

          await this.dbRun(
            `
                        INSERT OR IGNORE INTO transactions 
                        (tx_hash, blockchain, tx_type, amount, currency, price_usd, block_height, confirmations, status, timestamp)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `,
            [
              tx.txid,
              "bitcoin",
              "transfer",
              amountBTC,
              "BTC",
              amountBTC * 43000, // Mock BTC price
              latestBlock.height,
              1,
              "confirmed",
              new Date().toISOString(),
            ],
          )
        }

        console.log(`Processed ${Math.min(transactions.length, 10)} Bitcoin transactions`)
      }
    } catch (error) {
      console.error("Error monitoring Bitcoin transactions:", error.message)
    }
  }

  async runDataCollection() {
    console.log("Starting comprehensive data collection...")

    const tasks = [this.fetchCryptoPrices(), this.fetchExchangeRates(), this.monitorBitcoinTransactions()]

    try {
      await Promise.allSettled(tasks)
      console.log("Data collection completed")
    } catch (error) {
      console.error("Error in data collection:", error.message)
    }
  }

  async startScheduledCollection(interval = 60000) {
    // Default 1 minute
    console.log(`Starting scheduled data collection every ${interval / 1000} seconds...`)

    // Run immediately
    await this.runDataCollection()

    // Schedule recurring collection
    setInterval(async () => {
      await this.runDataCollection()
    }, interval)
  }

  async getAPIStats() {
    const stats = await this.dbAll(`
            SELECT 
                api_name,
                COUNT(*) as total_calls,
                AVG(response_time) as avg_response_time,
                COUNT(CASE WHEN error_message IS NOT NULL THEN 1 END) as error_count,
                MAX(timestamp) as last_call
            FROM api_logs 
            WHERE timestamp > datetime('now', '-24 hours')
            GROUP BY api_name
        `)

    return stats
  }

  async cleanup() {
    // Clean old cache entries
    await this.dbRun('DELETE FROM api_cache WHERE expires_at < datetime("now")')

    // Clean old logs (keep last 7 days)
    await this.dbRun('DELETE FROM api_logs WHERE timestamp < datetime("now", "-7 days")')

    console.log("Cleanup completed")
  }
}

// Main execution
async function main() {
  const integration = new APIIntegration()

  try {
    await integration.initializeDatabase()

    // Run single collection for testing
    await integration.runDataCollection()

    // Show API statistics
    const stats = await integration.getAPIStats()
    console.log("\nAPI Statistics:")
    console.table(stats)

    // Cleanup old data
    await integration.cleanup()

    // Uncomment to start scheduled collection
    // await integration.startScheduledCollection(60000); // Every minute
  } catch (error) {
    console.error("Error in main execution:", error)
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export default APIIntegration
