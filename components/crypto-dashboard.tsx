"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react"

interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  volume_24h: number
  last_updated: string
}

export default function CryptoDashboard() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchCryptoData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/crypto/prices")
      const data = await response.json()
      setCryptoData(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching crypto data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price)
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    return `$${marketCap.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Cryptocurrency Prices</h2>
          <p className="text-slate-400">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
        <Button onClick={fetchCryptoData} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cryptoData.map((crypto) => (
          <Card key={crypto.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{crypto.name}</CardTitle>
                  <CardDescription className="text-slate-400 uppercase">{crypto.symbol}</CardDescription>
                </div>
                <Badge
                  variant={crypto.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                  className={crypto.price_change_percentage_24h >= 0 ? "bg-green-600" : "bg-red-600"}
                >
                  {crypto.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-white">{formatPrice(crypto.current_price)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Market Cap</p>
                  <p className="text-white font-medium">{formatMarketCap(crypto.market_cap)}</p>
                </div>
                <div>
                  <p className="text-slate-400">24h Volume</p>
                  <p className="text-white font-medium">{formatMarketCap(crypto.volume_24h)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
