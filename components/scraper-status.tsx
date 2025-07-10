"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Play, Square, AlertCircle, CheckCircle } from "lucide-react"

interface ScraperStatus {
  id: string
  name: string
  type: "crypto" | "banking" | "transactions"
  status: "running" | "stopped" | "error"
  last_run: string
  next_run: string
  records_scraped: number
  error_message?: string
}

export default function ScraperStatus() {
  const [scrapers, setScrapers] = useState<ScraperStatus[]>([])
  const [loading, setLoading] = useState(true)

  const fetchScraperStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/scrapers/status")
      const data = await response.json()
      setScrapers(data)
    } catch (error) {
      console.error("Error fetching scraper status:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleScraper = async (scraperId: string, action: "start" | "stop") => {
    try {
      await fetch(`/api/scrapers/${scraperId}/${action}`, { method: "POST" })
      fetchScraperStatus()
    } catch (error) {
      console.error(`Error ${action}ing scraper:`, error)
    }
  }

  useEffect(() => {
    fetchScraperStatus()
    const interval = setInterval(fetchScraperStatus, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "stopped":
        return <Square className="h-4 w-4 text-gray-400" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-600"
      case "stopped":
        return "bg-gray-600"
      case "error":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "crypto":
        return "border-blue-500 text-blue-400"
      case "banking":
        return "border-green-500 text-green-400"
      case "transactions":
        return "border-purple-500 text-purple-400"
      default:
        return "border-gray-500 text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Scraper Management</h2>
          <p className="text-slate-400">Monitor and control data collection scrapers</p>
        </div>
        <Button onClick={fetchScraperStatus} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scrapers.map((scraper) => (
          <Card key={scraper.id} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg flex items-center space-x-2">
                    {getStatusIcon(scraper.status)}
                    <span>{scraper.name}</span>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    <Badge variant="outline" className={getTypeColor(scraper.type)}>
                      {scraper.type}
                    </Badge>
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(scraper.status)} text-white`}>{scraper.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Records Scraped</p>
                  <p className="text-white font-bold text-lg">{scraper.records_scraped.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Last Run</p>
                  <p className="text-white">{new Date(scraper.last_run).toLocaleTimeString()}</p>
                </div>
              </div>

              {scraper.error_message && (
                <div className="p-2 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
                  {scraper.error_message}
                </div>
              )}

              <div className="flex space-x-2">
                {scraper.status === "running" ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => toggleScraper(scraper.id, "stop")}
                    className="flex-1"
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => toggleScraper(scraper.id, "start")}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
