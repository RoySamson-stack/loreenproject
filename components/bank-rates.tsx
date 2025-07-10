"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Building2 } from "lucide-react"

interface BankRate {
  id: string
  bank_name: string
  currency_pair: string
  buy_rate: number
  sell_rate: number
  spread: number
  last_updated: string
}

export default function BankRates() {
  const [bankRates, setBankRates] = useState<BankRate[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchBankRates = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/banking/rates")
      const data = await response.json()
      setBankRates(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching bank rates:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBankRates()
    const interval = setInterval(fetchBankRates, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const formatRate = (rate: number) => {
    return rate.toFixed(4)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Bank Exchange Rates</h2>
          <p className="text-slate-400">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
        <Button onClick={fetchBankRates} disabled={loading} className="bg-green-600 hover:bg-green-700">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bankRates.map((rate) => (
          <Card key={rate.id} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                <div>
                  <CardTitle className="text-white text-lg">{rate.bank_name}</CardTitle>
                  <CardDescription className="text-slate-400">{rate.currency_pair}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-800">
                  <p className="text-green-400 text-sm font-medium">Buy Rate</p>
                  <p className="text-white text-xl font-bold">{formatRate(rate.buy_rate)}</p>
                </div>
                <div className="text-center p-3 bg-red-900/20 rounded-lg border border-red-800">
                  <p className="text-red-400 text-sm font-medium">Sell Rate</p>
                  <p className="text-white text-xl font-bold">{formatRate(rate.sell_rate)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Spread:</span>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {formatRate(rate.spread)}
                </Badge>
              </div>
              <div className="text-xs text-slate-500">Updated: {new Date(rate.last_updated).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
