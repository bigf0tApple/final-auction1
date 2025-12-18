"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useAuctionState, type AuctionState, type Bid, type UserPool } from "../hooks/use-auction-state"

interface AuctionContextType {
  auctionState: AuctionState
  bidHistory: Bid[]
  placeBid: (amount: number, bidder: string) => Bid
  setMaxPain: (maxAmount: number, bidder: string) => void
  cancelMaxPain: () => void
  getMinBid: () => number
  getMaxBid: () => number
  getUserPool: (bidder: string) => UserPool | null
  withdrawFromPool: (bidder: string) => number
  completeAuction: () => Promise<void>
}

const AuctionContext = createContext<AuctionContextType | null>(null)

export function AuctionProvider({ children }: { children: React.ReactNode }) {
  const auctionHook = useAuctionState()

  return <AuctionContext.Provider value={auctionHook}>{children}</AuctionContext.Provider>
}

export function useAuction() {
  const context = useContext(AuctionContext)
  if (!context) {
    throw new Error("useAuction must be used within an AuctionProvider")
  }
  return context
}
