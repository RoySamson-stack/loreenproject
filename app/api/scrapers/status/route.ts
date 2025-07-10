import { NextResponse } from "next/server"

// Mock scraper status data
const mockScraperStatus = [
  {
    id: "crypto-scraper-1",
    name: "CoinGecko Price Scraper",
    type: "crypto" as const,
    status: "running" as const,
    last_run: new Date(Date.now() - 30000).toISOString(),
    next_run: new Date(Date.now() + 30000).toISOString(),
    records_scraped: 15420,
  },
  {
    id: "banking-scraper-1",
    name: "Bank Rate Monitor",
    type: "banking" as const,
    status: "running" as const,
    last_run: new Date(Date.now() - 60000).toISOString(),
    next_run: new Date(Date.now() + 240000).toISOString(),
    records_scraped: 8750,
  },
  {
    id: "transaction-scraper-1",
    name: "Blockchain Transaction Monitor",
    type: "transactions" as const,
    status: "error" as const,
    last_run: new Date(Date.now() - 300000).toISOString(),
    next_run: new Date(Date.now() + 60000).toISOString(),
    records_scraped: 45230,
    error_message: "API rate limit exceeded",
  },
  {
    id: "crypto-scraper-2",
    name: "Binance API Scraper",
    type: "crypto" as const,
    status: "stopped" as const,
    last_run: new Date(Date.now() - 1800000).toISOString(),
    next_run: new Date(Date.now() + 120000).toISOString(),
    records_scraped: 12890,
  },
]

export async function GET() {
  try {
    return NextResponse.json(mockScraperStatus)
  } catch (error) {
    console.error("Error fetching scraper status:", error)
    return NextResponse.json({ error: "Failed to fetch scraper status" }, { status: 500 })
  }
}
