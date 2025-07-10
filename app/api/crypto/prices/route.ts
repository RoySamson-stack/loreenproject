import { NextResponse } from "next/server"

// Mock data - replace with actual API calls
const mockCryptoData = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    current_price: 43250.75,
    price_change_percentage_24h: 2.45,
    market_cap: 847500000000,
    volume_24h: 28500000000,
    last_updated: new Date().toISOString(),
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    current_price: 2650.3,
    price_change_percentage_24h: -1.23,
    market_cap: 318700000000,
    volume_24h: 15200000000,
    last_updated: new Date().toISOString(),
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    current_price: 315.45,
    price_change_percentage_24h: 0.87,
    market_cap: 47200000000,
    volume_24h: 1800000000,
    last_updated: new Date().toISOString(),
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    current_price: 98.75,
    price_change_percentage_24h: 4.12,
    market_cap: 43800000000,
    volume_24h: 2100000000,
    last_updated: new Date().toISOString(),
  },
  {
    id: "cardano",
    symbol: "ada",
    name: "Cardano",
    current_price: 0.485,
    price_change_percentage_24h: -2.15,
    market_cap: 17200000000,
    volume_24h: 420000000,
    last_updated: new Date().toISOString(),
  },
  {
    id: "avalanche-2",
    symbol: "avax",
    name: "Avalanche",
    current_price: 36.82,
    price_change_percentage_24h: 1.95,
    market_cap: 14500000000,
    volume_24h: 680000000,
    last_updated: new Date().toISOString(),
  },
]

export async function GET() {
  try {
    // In production, replace with actual CoinGecko API call:
    // const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1')
    // const data = await response.json()

    // Add some randomness to simulate live data
    const liveData = mockCryptoData.map((coin) => ({
      ...coin,
      current_price: coin.current_price * (1 + (Math.random() - 0.5) * 0.02),
      price_change_percentage_24h: coin.price_change_percentage_24h + (Math.random() - 0.5) * 2,
      last_updated: new Date().toISOString(),
    }))

    return NextResponse.json(liveData)
  } catch (error) {
    console.error("Error fetching crypto data:", error)
    return NextResponse.json({ error: "Failed to fetch crypto data" }, { status: 500 })
  }
}
