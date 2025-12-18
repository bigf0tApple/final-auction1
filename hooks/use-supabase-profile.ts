"use client"

import { useState, useEffect, useCallback } from "react"
import {
    supabase,
    getUser,
    createOrUpdateUser,
    getUserStats,
    incrementUserStat,
    checkSupabaseConnection,
    type User,
    type UserStats,
} from "@/lib/supabase"

interface UseSupabaseProfileResult {
    // Profile data
    profile: User | null
    stats: UserStats | null
    isLoading: boolean
    isConnected: boolean

    // Actions
    saveProfile: (updates: { username?: string; profilePicUrl?: string; bio?: string; twitter?: string; instagram?: string }) => Promise<boolean>
    refreshProfile: () => Promise<void>
    incrementBidCount: () => Promise<void>
    incrementWinCount: () => Promise<void>
    incrementMessageCount: () => Promise<void>
}

export function useSupabaseProfile(walletAddress: string | null): UseSupabaseProfileResult {
    const [profile, setProfile] = useState<User | null>(null)
    const [stats, setStats] = useState<UserStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isConnected, setIsConnected] = useState(false)

    // Check connection and load profile
    useEffect(() => {
        async function init() {
            const connected = await checkSupabaseConnection()
            setIsConnected(connected)

            if (connected && walletAddress) {
                await loadProfile(walletAddress)
            } else {
                setIsLoading(false)
            }
        }
        init()
    }, [walletAddress])

    const loadProfile = async (wallet: string) => {
        setIsLoading(true)
        try {
            const [userProfile, userStats] = await Promise.all([
                getUser(wallet),
                getUserStats(wallet),
            ])
            setProfile(userProfile)
            setStats(userStats)
        } catch (error) {
            console.error("Error loading profile:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const refreshProfile = useCallback(async () => {
        if (walletAddress && isConnected) {
            await loadProfile(walletAddress)
        }
    }, [walletAddress, isConnected])

    const saveProfile = useCallback(
        async (updates: { username?: string; profilePicUrl?: string; bio?: string; twitter?: string; instagram?: string }): Promise<boolean> => {
            if (!walletAddress || !isConnected) {
                console.warn("Cannot save profile: not connected")
                return false
            }

            try {
                const updatedUser = await createOrUpdateUser(walletAddress, {
                    username: updates.username,
                    profile_pic_url: updates.profilePicUrl,
                    bio: updates.bio,
                    twitter: updates.twitter,
                    instagram: updates.instagram,
                })

                if (updatedUser) {
                    setProfile(updatedUser)
                    return true
                }
                return false
            } catch (error) {
                console.error("Error saving profile:", error)
                return false
            }
        },
        [walletAddress, isConnected]
    )

    const incrementBidCount = useCallback(async () => {
        if (!walletAddress || !isConnected) return
        await incrementUserStat(walletAddress, "total_bids")
        await refreshProfile()
    }, [walletAddress, isConnected, refreshProfile])

    const incrementWinCount = useCallback(async () => {
        if (!walletAddress || !isConnected) return
        await incrementUserStat(walletAddress, "auctions_won")
        await refreshProfile()
    }, [walletAddress, isConnected, refreshProfile])

    const incrementMessageCount = useCallback(async () => {
        if (!walletAddress || !isConnected) return
        await incrementUserStat(walletAddress, "messages_sent")
        // Don't refresh full profile for messages - too frequent
    }, [walletAddress, isConnected])

    return {
        profile,
        stats,
        isLoading,
        isConnected,
        saveProfile,
        refreshProfile,
        incrementBidCount,
        incrementWinCount,
        incrementMessageCount,
    }
}
