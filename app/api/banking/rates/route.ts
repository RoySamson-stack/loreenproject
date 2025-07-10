import { NextResponse } from "next/server"

// Mock banking data - replace with actual bank API calls
const mockBankRates = [
  {
    id: "chase-usd-eur",
    bank_name: "JPMorgan Chase",
    currency_pair: "USD/EUR",
    buy_rate: 0.9245,
    sell_rate: 0.9185,
    spread: 0.006,
    last_updated: new Date().toISOString(),
  },
  {
    id: "bofa-usd-gbp",
    bank_name: "Bank of America",
    currency_pair: "USD/GBP",
    buy_rate: 0.7892,
    sell_rate: 0.7845,
    spread: 0.0047,
    last_updated: new Date().toISOString(),
  },
  {
    id: "wells-usd-jpy",
    bank_name: "Wells Fargo",
    currency_pair: "USD/JPY",
    buy_rate: 149.85,
    sell_rate: 148.92,
    spread: 0.93,
    last_updated: new Date().toISOString(),
  },
  {
    id: "citi-usd-cad",
    bank_name: "Citibank",
    currency_pair: "USD/CAD",
    buy_rate: 1.3542,
    sell_rate: 1.3485,
    spread: 0.0057,
    last_updated: new Date().toISOString(),
  },
  {
    id: "hsbc-usd-aud",
    bank_name: "HSBC",
    currency_pair: "USD/AUD",
    buy_rate: 1.4785,
    sell_rate: 1.4725,
    spread: 0.006,
    last_updated: new Date().toISOString(),
  },
  {
    id: "td-usd-chf",
    bank_name: "TD Bank",
    currency_pair: "USD/CHF",
    buy_rate: 0.8745,
    sell_rate: 0.8695,
    spread: 0.005,
    last_updated: new Date().toISOString(),
  },
]

export async function GET() {
  try {
    // Add some randomness to simulate live rates
    const liveRates = mockBankRates.map((rate) => {
      const variation = (Math.random() - 0.5) * 0.001
      const newBuyRate = rate.buy_rate + variation
      const newSellRate = rate.sell_rate + variation

      return {
        ...rate,
        buy_rate: newBuyRate,
        sell_rate: newSellRate,
        spread: Math.abs(newBuyRate - newSellRate),
        last_updated: new Date().toISOString(),
      }
    })

    return NextResponse.json(liveRates)
  } catch (error) {
    console.error("Error fetching bank rates:", error)
    return NextResponse.json({ error: "Failed to fetch bank rates" }, { status: 500 })
  }
}
