"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Zap, TrendingUp, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface BiddingEngineProps {
  currentPrice: number
  auctionEndTime: Date
  isActive: boolean
  userAddress?: string
  onBid: (amount: number, type: '1%' | '10%') => Promise<boolean>
  onTimerReset: () => void
  isHighestBidder: boolean
  hasMaxPainActive: boolean
}

interface PendingBid {
  id: string
  amount: number
  type: '1%' | '10%'
  timestamp: number
  confirmed: boolean
  userId: string
}

export default function BiddingEngine({
  currentPrice,
  auctionEndTime,
  isActive,
  userAddress,
  onBid,
  onTimerReset,
  isHighestBidder,
  hasMaxPainActive
}: BiddingEngineProps) {
  const [displayPrice, setDisplayPrice] = useState(currentPrice)
  const [timeLeft, setTimeLeft] = useState(0)
  const [pendingBids, setPendingBids] = useState<PendingBid[]>([])
  const [isProcessing, setIsProcessing] = useState({ onePercent: false, tenPercent: false })
  const [lastConfirmedPrice, setLastConfirmedPrice] = useState(currentPrice)
  const [bidCooldown, setBidCooldown] = useState(0)
  const [bidCount, setBidCount] = useState(0)
  const [cooldownActive, setCooldownActive] = useState(false)

  // Timer logic with 10-second reset
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = auctionEndTime.getTime()
      const remaining = Math.max(0, end - now)
      
      setTimeLeft(Math.floor(remaining / 1000))
      
      if (remaining <= 0) {
        setTimeLeft(0)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [auctionEndTime])

  // Cooldown timer
  useEffect(() => {
    if (bidCooldown > 0) {
      const timer = setTimeout(() => {
        setBidCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (cooldownActive && bidCooldown === 0) {
      setCooldownActive(false)
      setBidCount(0)
    }
  }, [bidCooldown, cooldownActive])

  // Reset timer when bid is placed and under 10 seconds
  const resetTimerIfNeeded = useCallback(() => {
    if (timeLeft <= 10 && timeLeft > 0) {
      onTimerReset()
      toast.info('Timer extended to 10 seconds!')
    }
  }, [timeLeft, onTimerReset])

  // Rate limiting logic
  const checkRateLimit = useCallback(() => {
    const newBidCount = bidCount + 1
    setBidCount(newBidCount)

    // Progressive delays: bids 1-3 instant, bid 4+ gets 3sec delay
    if (newBidCount >= 4 && !cooldownActive) {
      setCooldownActive(true)
      setBidCooldown(3)
      return false
    }
    return true
  }, [bidCount, cooldownActive])

  // Calculate bid amounts
  const onePercentBid = Math.round(displayPrice * 1.01 * 100) / 100
  const tenPercentBid = Math.round(displayPrice * 1.10 * 100) / 100

  // Handle 1% bid (optimistic update)
  const handleOnePercentBid = async () => {
    if (!userAddress || isProcessing.onePercent || isHighestBidder || cooldownActive) return

    if (!checkRateLimit()) {
      toast.error('Rate limited! Please wait 3 seconds.')
      return
    }

    setIsProcessing(prev => ({ ...prev, onePercent: true }))
    
    // Optimistic update - show immediately
    const newPrice = onePercentBid
    setDisplayPrice(newPrice)
    resetTimerIfNeeded()

    // Create pending bid
    const pendingBid: PendingBid = {
      id: `${Date.now()}-${Math.random()}`,
      amount: newPrice,
      type: '1%',
      timestamp: Date.now(),
      confirmed: false,
      userId: userAddress
    }

    setPendingBids(prev => [...prev, pendingBid])
    toast.info(`Bid placed at ${newPrice.toFixed(4)} ETH`)

    try {
      // Send transaction in background
      const success = await onBid(newPrice, '1%')
      
      if (success) {
        // Confirm the bid
        setPendingBids(prev => 
          prev.map(bid => 
            bid.id === pendingBid.id 
              ? { ...bid, confirmed: true }
              : bid
          )
        )
        setLastConfirmedPrice(newPrice)
        toast.success(`1% bid confirmed: ${newPrice.toFixed(4)} ETH`)
      } else {
        // Rollback optimistic update only if no newer bids
        const newerBids = pendingBids.filter(bid => bid.timestamp > pendingBid.timestamp)
        if (newerBids.length === 0) {
          setDisplayPrice(lastConfirmedPrice)
          toast.error('1% bid failed - price rolled back')
        }
        setPendingBids(prev => prev.filter(bid => bid.id !== pendingBid.id))
      }
    } catch {
      // Rollback on error (same logic as failure)
      const newerBids = pendingBids.filter(bid => bid.timestamp > pendingBid.timestamp)
      if (newerBids.length === 0) {
        setDisplayPrice(lastConfirmedPrice)
      }
      setPendingBids(prev => prev.filter(bid => bid.id !== pendingBid.id))
      toast.error('Transaction failed')
    } finally {
      setIsProcessing(prev => ({ ...prev, onePercent: false }))
    }
  }

  // Handle 10% bid (wait for confirmation)
  const handleTenPercentBid = async () => {
    if (!userAddress || isProcessing.tenPercent || isHighestBidder) return

    setIsProcessing(prev => ({ ...prev, tenPercent: true }))
    
    const newPrice = tenPercentBid
    toast.info(`Confirming 10% bid: ${newPrice.toFixed(4)} ETH...`)

    try {
      const success = await onBid(newPrice, '10%')
      
      if (success) {
        // Update display price only after confirmation
        setDisplayPrice(newPrice)
        setLastConfirmedPrice(newPrice)
        resetTimerIfNeeded()
        
        toast.success(`10% bid confirmed: ${newPrice.toFixed(4)} ETH`)
      } else {
        toast.error('10% bid failed')
      }
    } catch {
      toast.error('Transaction failed')
    } finally {
      setIsProcessing(prev => ({ ...prev, tenPercent: false }))
    }
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const isEndingSoon = timeLeft <= 60
  const isCritical = timeLeft <= 10

  // Update display price when current price changes (from external source)
  useEffect(() => {
    setDisplayPrice(currentPrice)
    setLastConfirmedPrice(currentPrice)
  }, [currentPrice])

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      {/* Current Price Display */}
      <div className="text-center space-y-2">
        <div className="text-sm text-muted-foreground">Current Price</div>
        <div className="text-3xl font-bold animate-price-update">
          {displayPrice.toFixed(4)} ETH
        </div>
        
        {/* Pending indicators */}
        <div className="flex justify-center gap-2">
          {pendingBids.some(bid => !bid.confirmed) && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              {pendingBids.filter(bid => !bid.confirmed).length} pending
            </Badge>
          )}
          {hasMaxPainActive && (
            <Badge variant="destructive" className="text-xs">
              MAX PAIN ACTIVE
            </Badge>
          )}
        </div>
      </div>

      {/* Timer */}
      <div className="text-center">
        <div className={`text-2xl font-mono ${
          isCritical ? 'text-red-500 animate-timer-critical' : 
          isEndingSoon ? 'text-yellow-500' : 'text-foreground'
        }`}>
          <Clock className="w-5 h-5 inline mr-2" />
          {formatTime(timeLeft)}
        </div>
        {isCritical && (
          <div className="text-xs text-red-500 mt-1">
            Timer resets to 10s with each bid!
          </div>
        )}
      </div>

      {/* Rate Limit Warning */}
      {cooldownActive && (
        <div className="flex items-center justify-center gap-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            Cooldown: {bidCooldown}s ({bidCount} rapid bids)
          </span>
        </div>
      )}

      {/* Bidding Buttons */}
      {isActive && timeLeft > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {/* 1% Bid Button */}
          <Button
            onClick={handleOnePercentBid}
            disabled={
              isProcessing.onePercent || 
              !userAddress || 
              isHighestBidder || 
              cooldownActive
            }
            className="h-16 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <div className="text-lg font-bold">+1%</div>
            <div className="text-xs opacity-90">
              {onePercentBid.toFixed(4)} ETH
            </div>
            {isProcessing.onePercent && (
              <div className="text-xs">Instant...</div>
            )}
            {cooldownActive && (
              <div className="text-xs">Wait {bidCooldown}s</div>
            )}
          </Button>

          {/* 10% Bid Button */}
          <Button
            onClick={handleTenPercentBid}
            disabled={
              isProcessing.tenPercent || 
              !userAddress || 
              isHighestBidder
            }
            className="h-16 flex flex-col items-center justify-center bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
          >
            <div className="text-lg font-bold">+10%</div>
            <div className="text-xs opacity-90">
              {tenPercentBid.toFixed(4)} ETH
            </div>
            {isProcessing.tenPercent && (
              <div className="text-xs">Confirming...</div>
            )}
          </Button>
        </div>
      )}

      {/* User Status Messages */}
      {isHighestBidder && (
        <div className="text-center p-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <span className="text-sm text-green-800 dark:text-green-200 font-medium">
            🏆 You are currently the highest bidder
          </span>
        </div>
      )}

      {/* Bidding Strategy Info */}
      <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-blue-500" />
          <span>1% bids update instantly (optimistic)</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-orange-500" />
          <span>10% bids wait for blockchain confirmation</span>
        </div>
        {isCritical && (
          <div className="flex items-center gap-2 text-red-500">
            <Clock className="w-3 h-3" />
            <span>Any bid extends timer to 10 seconds!</span>
          </div>
        )}
      </div>
    </div>
  )
}
