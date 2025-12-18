"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { upcomingAuctions, type AuctionEvent } from "../lib/auction-data"
import { useSupabaseAuctions } from "./use-supabase-auctions"
import { type Auction as SupabaseAuction } from "../lib/supabase"
import { DEFAULT_ACCEPTED_TOKEN } from "../types/accepted-token"

const STORAGE_KEY = "arpo:mintedAuctions:v1"

type StoredAuctionEvent = Omit<AuctionEvent, "startTime" | "endTime"> & {
  startTime: string
  endTime: string
}

function fromStored(event: StoredAuctionEvent): AuctionEvent {
  return {
    ...event,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime),
  }
}

function toStored(event: AuctionEvent): StoredAuctionEvent {
  return {
    ...event,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
  }
}

function loadStoredAuctions(): AuctionEvent[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredAuctionEvent[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(fromStored)
  } catch {
    return []
  }
}

function persistStoredAuctions(events: AuctionEvent[]) {
  if (typeof window === "undefined") return
  const stored = events.map(toStored)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

// Mapper to transform Supabase Auction to UI AuctionEvent
function mapSupabaseToEvent(sbAuction: SupabaseAuction): AuctionEvent {
  return {
    id: sbAuction.id,
    title: sbAuction.title,
    artist: sbAuction.artist_name || "Unknown Artist",
    startTime: new Date(sbAuction.start_time),
    endTime: new Date(sbAuction.end_time),
    startingBid: `${sbAuction.starting_price.toFixed(2)} ${sbAuction.accepted_token}`,
    status: sbAuction.status === "scheduled" ? "upcoming" : sbAuction.status === "ended" || sbAuction.status === "settled" ? "ended" : "live",
    acceptedToken: { kind: "NATIVE", symbol: sbAuction.accepted_token, decimals: 18 }, // Simplified mapping
    description: sbAuction.description || undefined,
    teaserImage: sbAuction.teaser_ipfs_cid ? `https://ipfs.io/ipfs/${sbAuction.teaser_ipfs_cid}` : undefined,
    mainImage: sbAuction.image_ipfs_cid ? `https://ipfs.io/ipfs/${sbAuction.image_ipfs_cid}` : undefined,
    // Add other fields as needed, falling back to defaults
    category: "Digital Art",
    royaltyPercent: 5,
  }
}

export function useClientAuctions() {
  const [mintedAuctions, setMintedAuctions] = useState<AuctionEvent[]>([])

  // Integrate Supabase hooks
  const {
    upcomingAuctions: sbUpcoming,
    liveAuction: sbLive,
    isConnected: sbConnected,
    loading: sbLoading
  } = useSupabaseAuctions()

  useEffect(() => {
    // Only load local "minted" auctions if NOT connected to Supabase
    // Or maybe we want to keep them as "local overrides"? For now, disable if Supabase is active to avoid confusion.
    if (!sbConnected) {
      setMintedAuctions(loadStoredAuctions())
    }
  }, [sbConnected])

  const allAuctions = useMemo(() => {
    // Prioritize Supabase data if available
    if (sbConnected && !sbLoading) {
      const events: AuctionEvent[] = []

      if (sbLive) {
        events.push(mapSupabaseToEvent(sbLive))
      }

      if (sbUpcoming && sbUpcoming.length > 0) {
        events.push(...sbUpcoming.map(mapSupabaseToEvent))
      }

      // If Supabase returned nothing, maybe fallback? 
      // User might have an empty DB.
      // But let's assume if connected, we show DB state. 
      // If DB is empty, empty is correct.

      // Sort by start time
      events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      return events
    }

    // Fallback: Use Local Mock Data
    const combined = [...upcomingAuctions, ...mintedAuctions]
    combined.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    return combined
  }, [mintedAuctions, sbConnected, sbLoading, sbLive, sbUpcoming])

  const addAuction = useCallback((auction: AuctionEvent) => {
    if (sbConnected) {
      console.warn("Cannot 'mint' local auction while connected to Supabase. Use Admin Panel.")
      return
    }
    setMintedAuctions((prev) => {
      const next = [...prev, auction]
      persistStoredAuctions(next)
      return next
    })
  }, [sbConnected])

  return {
    baseAuctions: upcomingAuctions,
    mintedAuctions,
    allAuctions,
    addAuction,
    isSupabase: sbConnected
  }
}
