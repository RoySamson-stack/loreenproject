"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"

interface Transaction {
  id: string
  hash: string
  type: "buy" | "sell" | "transfer"
  amount: number
  currency: string
  price_usd: number
  timestamp: string
  status: "confirmed" | "pending" | "failed"
  from_address?: string
  to_address?: string
}

export default function TransactionMonitor() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/transactions/recent")
      const data = await response.json()
      setTransactions(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
    const interval = setInterval(fetchTransactions, 15000) // Update every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toFixed(6)} ${currency.toUpperCase()}`
  }

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-600"
      case "pending":
        return "bg-yellow-600"
      case "failed":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />
      case "sell":
        return <ArrowUpRight className="h-4 w-4 text-red-400" />
      default:
        return <ArrowUpRight className="h-4 w-4 text-blue-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Transactions</h2>
          <p className="text-slate-400">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
        <Button onClick={fetchTransactions} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <Card key={tx.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(tx.type)}
                    <div>
                      <p className="text-white font-medium">{formatAmount(tx.amount, tx.currency)}</p>
                      <p className="text-slate-400 text-sm">{formatUSD(tx.price_usd)}</p>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-slate-300 text-sm font-mono">{truncateHash(tx.hash)}</p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(tx.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={`${getStatusColor(tx.status)} text-white`}>{tx.status}</Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 capitalize">
                    {tx.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
