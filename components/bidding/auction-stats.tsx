"use client"

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Users, Clock, Zap, AlertTriangle } from 'lucide-react'

interface NetworkStats {
  latency: number
  gasPrice: number
  blockTime: number
  congestionLevel: 'low' | 'medium' | 'high'
  transactionsPending: number
}

interface AuctionStatsProps {
  currentPrice: number
  totalBids: number
  activeBidders: number
  timeRemaining: number
  priceChange24h: number
  networkHealth: NetworkStats
  highestBidder?: string
}

export default function AuctionStats({
  currentPrice,
  totalBids,
  activeBidders,
  timeRemaining,
  priceChange24h,
  networkHealth,
  highestBidder
}: AuctionStatsProps) {
  const [realtimePrice, setRealtimePrice] = useState(currentPrice)
  const [priceChangeAnimation, setPriceChangeAnimation] = useState(false)

  // Animate price changes
  useEffect(() => {
    if (currentPrice !== realtimePrice) {
      setPriceChangeAnimation(true)
      setRealtimePrice(currentPrice)
      const timer = setTimeout(() => setPriceChangeAnimation(false), 500)
      return () => clearTimeout(timer)
    }
  }, [currentPrice, realtimePrice])

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const getNetworkHealthColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getNetworkHealthBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700'
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700'
      case 'high': return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700'
      default: return 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700'
    }
  }

  return (
    <div className="space-y-4">
      {/* Network Health Indicator */}
      <Card className={`border ${getNetworkHealthBg(networkHealth.congestionLevel)}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                networkHealth.congestionLevel === 'low' ? 'bg-green-500 animate-pulse' :
                networkHealth.congestionLevel === 'medium' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500 animate-pulse'
              }`} />
              <span className="text-sm font-medium">Network Health</span>
            </div>
            <Badge variant="outline" className={`text-xs ${getNetworkHealthColor(networkHealth.congestionLevel)}`}>
              {networkHealth.congestionLevel.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
            <div className="text-center">
              <div className="font-medium">{networkHealth.latency}ms</div>
              <div className="text-muted-foreground">Latency</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{networkHealth.gasPrice} gwei</div>
              <div className="text-muted-foreground">Gas Price</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{networkHealth.blockTime}s</div>
              <div className="text-muted-foreground">Block Time</div>
            </div>
          </div>
          {networkHealth.transactionsPending > 10 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3" />
              <span>{networkHealth.transactionsPending} transactions pending</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auction Statistics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Price */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${priceChangeAnimation ? 'animate-price-update' : ''}`}>
              {realtimePrice.toFixed(4)} ETH
            </div>
            <div className="text-sm text-muted-foreground">Current Price</div>
            {priceChange24h !== 0 && (
              <div className={`text-xs mt-1 ${priceChange24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange24h > 0 ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Remaining */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${timeRemaining <= 60 ? 'text-red-500 animate-pulse' : ''}`}>
              <Clock className="w-5 h-5 inline mr-1" />
              {formatTimeRemaining(timeRemaining)}
            </div>
            <div className="text-sm text-muted-foreground">Time Left</div>
            {timeRemaining <= 60 && (
              <div className="text-xs mt-1 text-red-500">
                Critical: Timer resets with bids!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Bids */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              {totalBids}
            </div>
            <div className="text-sm text-muted-foreground">Total Bids</div>
          </CardContent>
        </Card>

        {/* Active Bidders */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold">
              <Users className="w-4 h-4 inline mr-1" />
              {activeBidders}
            </div>
            <div className="text-sm text-muted-foreground">Active Bidders</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Leader */}
      {highestBidder && (
        <Card className="border-green-500 border-2">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Current Leader</span>
              </div>
              <Badge className="bg-green-500 text-white">
                🏆 Leading
              </Badge>
            </div>
            <div className="mt-2 font-mono text-sm">
              {highestBidder.slice(0, 6)}...{highestBidder.slice(-4)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bidding Tips */}
      <Card className="border-blue-500 border-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Live Bidding Tips</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>1% bids update instantly for fast moves</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>10% bids wait for confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>MAX PAIN auto-bids to your limit</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Network Health Monitor Component
export function NetworkHealthMonitor() {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    latency: 0,
    gasPrice: 0,
    blockTime: 0,
    congestionLevel: 'low',
    transactionsPending: 0
  })

  const updateNetworkStats = useCallback(async () => {
    try {
      // Simulate network health check
      const latency = Math.random() * 100 + 50 // 50-150ms
      const gasPrice = Math.random() * 20 + 10 // 10-30 gwei
      const blockTime = Math.random() * 5 + 10 // 10-15s
      const pending = Math.floor(Math.random() * 50)
      
      let congestionLevel: 'low' | 'medium' | 'high' = 'low'
      if (gasPrice > 20 || latency > 100) congestionLevel = 'medium'
      if (gasPrice > 25 || latency > 120) congestionLevel = 'high'

      setNetworkStats({
        latency: Math.round(latency),
        gasPrice: Math.round(gasPrice),
        blockTime: Math.round(blockTime),
        congestionLevel,
        transactionsPending: pending
      })
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error('Failed to update network stats:', error)
      }
    }
  }, [])

  useEffect(() => {
    updateNetworkStats()
    const interval = setInterval(updateNetworkStats, 10000) // Update every 10s
    return () => clearInterval(interval)
  }, [updateNetworkStats])

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className={`w-3 h-3 rounded-full ${
        networkStats.congestionLevel === 'low' ? 'bg-green-500' :
        networkStats.congestionLevel === 'medium' ? 'bg-yellow-500' :
        'bg-red-500'
      } animate-pulse cursor-help`} 
      title={`Network: ${networkStats.congestionLevel} | ${networkStats.latency}ms | ${networkStats.gasPrice} gwei`}
      />
    </div>
  )
}
