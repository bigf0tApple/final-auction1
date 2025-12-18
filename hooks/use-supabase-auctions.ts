"use client"

import { useState, useEffect } from 'react'
import {
    getLiveAuction,
    getUpcomingAuctions,
    getRecentAuctions,
    checkSupabaseConnection,
    type Auction
} from '@/lib/supabase'

export function useSupabaseAuctions() {
    const [liveAuction, setLiveAuction] = useState<Auction | null>(null)
    const [upcomingAuctions, setUpcomingAuctions] = useState<Auction[]>([])
    const [recentAuctions, setRecentAuctions] = useState<Auction[]>([])
    const [loading, setLoading] = useState(true)
    const [isConnected, setIsConnected] = useState(false)

    const fetchAuctions = async () => {
        setLoading(true)
        const connected = await checkSupabaseConnection()
        setIsConnected(connected)

        if (connected) {
            try {
                const [live, upcoming, recent] = await Promise.all([
                    getLiveAuction(),
                    getUpcomingAuctions(),
                    getRecentAuctions()
                ])
                setLiveAuction(live)
                setUpcomingAuctions(upcoming)
                setRecentAuctions(recent)
            } catch (e) {
                console.error("Failed to fetch Supabase auctions:", e)
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchAuctions()
    }, [])

    return {
        liveAuction,
        upcomingAuctions,
        recentAuctions,
        loading,
        isConnected,
        refresh: fetchAuctions
    }
}
