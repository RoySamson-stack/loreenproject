import { NextResponse } from "next/server"

// Mock transaction data - replace with actual blockchain API calls
const generateMockTransactions = () => {
  const currencies = ["BTC", "ETH", "BNB", "SOL", "ADA", "AVAX"]
  const types = ["buy", "sell", "transfer"] as const
  const statuses = ["confirmed", "pending", "failed"] as const

  return Array.from({ length: 15 }, (_, i) => {
    const currency = currencies[Math.floor(Math.random() * currencies.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const amount = Math.random() * 10 + 0.001
    const priceUSD = amount * (Math.random() * 50000 + 1000)

    return {
      id: `tx_${Date.now()}_${i}`,
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      type,
      amount,
      currency,
      price_usd: priceUSD,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      status,
      from_address: `0x${Math.random().toString(16).substr(2, 40)}`,
      to_address: `0x${Math.random().toString(16).substr(2, 40)}`,
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function GET() {
  try {
    const transactions = generateMockTransactions()
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
