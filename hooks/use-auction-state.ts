"use client"

import { useState, useCallback } from "react"

export interface Bid {
  id: string
  bidder: string
  amount: number
  timestamp: Date
  isMaxPain?: boolean
}

export interface UserPool {
  bidder: string
  totalAmount: number
  bidCount: number
  lastBidTime: Date
  isActive: boolean
}

export interface MaxPainSettings {
  isActive: boolean
  maxAmount: number
  bidder: string
}

export interface AuctionState {
  currentBid: number
  highestBidder: string
  bids: Bid[]
  userPools: Map<string, UserPool>
  maxPainSettings: MaxPainSettings | null
  isEnded: boolean
  winner: string | null
  endTime: Date | null
}

export function useAuctionState() {
  const [auctionState, setAuctionState] = useState<AuctionState>({
    currentBid: 1.1,
    highestBidder: "",
    bids: [],
    userPools: new Map(),
    maxPainSettings: null,
    isEnded: false,
    winner: null,
    endTime: null,
  })

  const [bidHistory, setBidHistory] = useState<Bid[]>([])

  // Auto-bid with Max Pain
  const handleMaxPainBid = useCallback(
    (newBid: number, newBidder: string) => {
      if (!auctionState.maxPainSettings?.isActive) return

      const { maxAmount, bidder: maxPainBidder } = auctionState.maxPainSettings

      // Don't auto-bid if the new bidder is the Max Pain user
      if (newBidder === maxPainBidder) return

      // Don't auto-bid if max pain bidder is currently the leader
      if (auctionState.highestBidder === maxPainBidder) return

      // Don't auto-bid if we've reached the max amount
      if (newBid >= maxAmount) return

      // Calculate next bid (1% higher)
      const nextBid = Math.round(newBid * 1.01 * 100) / 100

      // Don't exceed max amount
      if (nextBid > maxAmount) return

      // Place auto-bid after a short delay
      setTimeout(() => {
        const autoBid: Bid = {
          id: Date.now().toString(),
          bidder: maxPainBidder,
          amount: nextBid,
          timestamp: new Date(),
          isMaxPain: true,
        }

        setAuctionState((prev) => {
          if (prev.isEnded) return prev
          if (prev.highestBidder === maxPainBidder) return prev

          const newUserPools = new Map(prev.userPools)
          const existingPool = newUserPools.get(maxPainBidder)
          if (existingPool && !existingPool.isActive) return prev

          const previousCommitted = existingPool?.totalAmount ?? 0
          if (nextBid <= previousCommitted) return prev

          newUserPools.set(maxPainBidder, {
            bidder: maxPainBidder,
            totalAmount: nextBid,
            bidCount: (existingPool?.bidCount ?? 0) + 1,
            lastBidTime: new Date(),
            isActive: true,
          })

          return {
            ...prev,
            currentBid: nextBid,
            highestBidder: maxPainBidder,
            bids: [...prev.bids, autoBid],
            userPools: newUserPools,
          }
        })

        setBidHistory((prev) => [...prev, autoBid])
      }, 1000) // 1 second delay for auto-bid
    },
    [auctionState.maxPainSettings],
  )

  const placeBid = useCallback(
    (amount: number, bidder: string) => {
      // Note: With individual pools, we don't reject based on current price
      // The bid goes to the user's personal pool regardless of price movement

      // Allow highest bidder to continue bidding to increase their lead
      // This is common in auction systems to maintain competitive bidding

      const newBid: Bid = {
        id: Date.now().toString(),
        bidder,
        amount,
        timestamp: new Date(),
        isMaxPain: false,
      }

      setAuctionState((prev) => {
        if (prev.isEnded) {
          throw new Error("Auction has ended")
        }

        // Users can't bid on themselves (cannot bid while leading)
        if (prev.highestBidder && prev.highestBidder === bidder) {
          throw new Error("You cannot bid while you are the highest bidder")
        }

        const newUserPools = new Map(prev.userPools)

        // Update or create user pool
        const existingPool = newUserPools.get(bidder)
        if (existingPool) {
          if (!existingPool.isActive) {
            throw new Error("You have withdrawn and cannot bid again in this auction")
          }

          const previousCommitted = existingPool.totalAmount
          if (amount <= previousCommitted) {
            throw new Error("Your new bid must be higher than your current committed bid")
          }

          // Add to existing pool
          newUserPools.set(bidder, {
            ...existingPool,
            // IMPORTANT: `totalAmount` now represents the user's committed bid total,
            // not the sum of all historical increments.
            totalAmount: amount,
            bidCount: existingPool.bidCount + 1,
            lastBidTime: new Date(),
          })
        } else {
          // Create new pool
          newUserPools.set(bidder, {
            bidder,
            totalAmount: amount,
            bidCount: 1,
            lastBidTime: new Date(),
            isActive: true,
          })
        }

        // Only update current bid if this is higher than current
        const newCurrentBid = amount > prev.currentBid ? amount : prev.currentBid
        const newHighestBidder = amount > prev.currentBid ? bidder : prev.highestBidder

        return {
          ...prev,
          currentBid: newCurrentBid,
          highestBidder: newHighestBidder,
          bids: [...prev.bids, newBid],
          userPools: newUserPools,
        }
      })

      setBidHistory((prev) => [...prev, newBid])

      // Trigger Max Pain auto-bid if applicable
      handleMaxPainBid(amount, bidder)

      return newBid
    },
    [auctionState.highestBidder, handleMaxPainBid],
  )

  const setMaxPain = useCallback((maxAmount: number, bidder: string) => {
    setAuctionState((prev) => ({
      ...prev,
      maxPainSettings: {
        isActive: true,
        maxAmount,
        bidder,
      },
    }))
  }, [])

  const cancelMaxPain = useCallback(() => {
    setAuctionState((prev) => ({
      ...prev,
      maxPainSettings: null,
    }))
  }, [])

  const getMinBid = useCallback(() => {
    return Math.round(auctionState.currentBid * 1.01 * 100) / 100
  }, [auctionState.currentBid])

  const getMaxBid = useCallback(() => {
    return Math.round(auctionState.currentBid * 1.1 * 100) / 100
  }, [auctionState.currentBid])

  const getUserPool = useCallback((bidder: string): UserPool | null => {
    return auctionState.userPools.get(bidder) || null
  }, [auctionState.userPools])

  const withdrawFromPool = useCallback((bidder: string) => {
    if (auctionState.highestBidder === bidder && !auctionState.isEnded) {
      throw new Error("Cannot withdraw: you are the highest bidder")
    }

    const userPool = auctionState.userPools.get(bidder)
    if (!userPool || !userPool.isActive) {
      throw new Error("No active pool found for this user")
    }

    setAuctionState((prev) => {
      const newUserPools = new Map(prev.userPools)
      newUserPools.set(bidder, {
        ...userPool,
        isActive: false,
      })

      return {
        ...prev,
        userPools: newUserPools,
      }
    })

    return userPool.totalAmount
  }, [auctionState.highestBidder, auctionState.userPools, auctionState.isEnded])

  // New auction completion logic
  const completeAuction = useCallback(() => {
    if (auctionState.isEnded) return Promise.resolve()

    const winner = auctionState.highestBidder
    const winningBid = auctionState.currentBid

    setAuctionState((prev) => ({
      ...prev,
      isEnded: true,
      winner,
      endTime: new Date(),
    }))

    // Process refunds for all non-winning bidders
    const refundPromises: Promise<void>[] = []

    auctionState.userPools.forEach((pool, bidder) => {
      if (bidder !== winner && pool.isActive && pool.totalAmount > 0) {
        // Simulate refund processing
        refundPromises.push(
          new Promise((resolve) => {
            setTimeout(() => {
              // Production: Log refund to analytics/monitoring service
              // Amount: ${pool.totalAmount.toFixed(4)} ETH to ${bidder}
              resolve()
            }, 1000)
          })
        )
      }
    })

    // Process Max Pain refund if winner had Max Pain active
    if (auctionState.maxPainSettings?.isActive && auctionState.maxPainSettings.bidder === winner) {
      const maxPainRefund = auctionState.maxPainSettings.maxAmount - winningBid
      if (maxPainRefund > 0) {
        refundPromises.push(
          new Promise((resolve) => {
            setTimeout(() => {
              // Production: Log Max Pain refund to analytics service
              // Amount: ${maxPainRefund.toFixed(4)} ETH to winner ${winner}
              resolve()
            }, 1500)
          })
        )
      }
    }

    return Promise.all(refundPromises).then(() => { })
  }, [auctionState])

  return {
    auctionState,
    bidHistory,
    placeBid,
    setMaxPain,
    cancelMaxPain,
    getMinBid,
    getMaxBid,
    getUserPool,
    withdrawFromPool,
    completeAuction, // Export the new completion function
  }
}
