"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabaseProfile } from "./use-supabase-profile"
import { searchUsers } from "@/lib/supabase"

export interface UserProfile {
    wallet: string
    username: string | null
    avatar: string | null
    bio?: string
    twitter?: string
    instagram?: string
    createdAt: string
    updatedAt: string
}

export function useUserProfile(connectedWallet: string) {
    // 1. Supabase Hook
    const sb = useSupabaseProfile(connectedWallet)

    // 2. Local Storage State (Fallback)
    const [localProfile, setLocalProfile] = useState<UserProfile | null>(null)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [isFirstTime, setIsFirstTime] = useState(false)
    const [isLoadingLocal, setIsLoadingLocal] = useState(true)

    // Load Local Storage
    useEffect(() => {
        if (!connectedWallet) {
            setLocalProfile(null)
            setIsLoadingLocal(false)
            return
        }

        if (sb.isConnected) {
            // If connected to Supabase, we rely on sb.profile
            // We can skip local loading, but maybe keep it as cache/backup?
            // For now, if connected, just stop loading local.
            setIsLoadingLocal(false)
            // We should still check "isFirstTime" logic if profile is null?
            if (!sb.isLoading && !sb.profile) {
                setIsFirstTime(true)
                setShowProfileModal(true)
            } else if (!sb.isLoading && sb.profile) {
                setIsFirstTime(false)
            }
            return
        }

        // If NOT connected, load from LocalStorage
        setIsLoadingLocal(true)
        try {
            const existingUsers = JSON.parse(localStorage.getItem("arpo_users") || "{}")
            const userProfile = existingUsers[connectedWallet.toLowerCase()]

            if (userProfile) {
                setLocalProfile(userProfile)
                setIsFirstTime(false)
            } else {
                setLocalProfile(null)
                setIsFirstTime(true)
                setShowProfileModal(true)
            }
        } catch (e) {
            console.error("Error loading local profile", e)
        }
        setIsLoadingLocal(false)
    }, [connectedWallet, sb.isConnected, sb.isLoading, sb.profile])

    // Derived Profile Object (Supabase > Local)
    const profile: UserProfile | null = sb.isConnected && sb.profile ? {
        wallet: sb.profile.wallet_address,
        username: sb.profile.username,
        avatar: sb.profile.profile_pic_url,
        bio: sb.profile.bio || undefined,
        twitter: sb.profile.twitter || undefined,
        instagram: sb.profile.instagram || undefined,
        createdAt: sb.profile.created_at,
        updatedAt: sb.profile.updated_at
    } : localProfile

    const isLoading = sb.isConnected ? sb.isLoading : isLoadingLocal

    // Save Profile (Hybrid)
    const saveProfile = useCallback(async (username: string, avatar: string | null, bio?: string, twitter?: string, instagram?: string) => {
        if (!connectedWallet) return

        if (sb.isConnected) {
            await sb.saveProfile({
                username,
                profilePicUrl: avatar || undefined,
                bio,
                twitter,
                instagram
            })
            // Also save to local for cache/offline?
        }

        // Always save to local as backup/fallback
        const existingUsers = JSON.parse(localStorage.getItem("arpo_users") || "{}")
        const now = new Date().toISOString()
        const newProfile: UserProfile = {
            wallet: connectedWallet.toLowerCase(),
            username,
            avatar,
            bio,
            twitter,
            instagram,
            createdAt: existingUsers[connectedWallet.toLowerCase()]?.createdAt || now,
            updatedAt: now,
        }
        existingUsers[connectedWallet.toLowerCase()] = newProfile
        localStorage.setItem("arpo_users", JSON.stringify(existingUsers))

        setLocalProfile(newProfile)
        setShowProfileModal(false)
        setIsFirstTime(false)
    }, [connectedWallet, sb.isConnected, sb.saveProfile])

    // Get Display Name
    const getDisplayName = useCallback((walletAddress?: string): string => {
        const wallet = walletAddress || connectedWallet
        if (!wallet) return "Unknown"

        // 1. Check current profile if it matches
        if (profile?.wallet.toLowerCase() === wallet.toLowerCase() && profile.username) {
            return profile.username
        }

        // 2. Check local storage for others (localStorage used for sync access)
        // Note: For async/Supabase fetch, use getDisplayNameAsync if implemented
        const existingUsers = JSON.parse(localStorage.getItem("arpo_users") || "{}")
        const userProfile = existingUsers[wallet.toLowerCase()]
        if (userProfile?.username) return userProfile.username

        return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
    }, [connectedWallet, profile])

    // Get Avatar
    const getAvatar = useCallback((walletAddress?: string): string | null => {
        const wallet = walletAddress || connectedWallet
        if (!wallet) return null

        if (profile?.wallet.toLowerCase() === wallet.toLowerCase()) {
            return profile.avatar
        }

        const existingUsers = JSON.parse(localStorage.getItem("arpo_users") || "{}")
        const userProfile = existingUsers[wallet.toLowerCase()]
        return userProfile?.avatar || null
    }, [connectedWallet, profile])

    // Get Profile By Wallet (Sync - Local Only for now)
    const getProfileByWallet = useCallback((walletAddress: string): UserProfile | null => {
        if (profile?.wallet.toLowerCase() === walletAddress.toLowerCase()) {
            return profile
        }
        const existingUsers = JSON.parse(localStorage.getItem("arpo_users") || "{}")
        return existingUsers[walletAddress.toLowerCase()] || null
    }, [profile])

    // Search Profiles (Hybrid)
    // Note: SearchModal expects this to return UserProfile[] synchronously? 
    // Wait, SearchModal calls "performSearch" which is internal.
    // The HOOK export "searchProfiles" is used?
    // Let's check if export is used. If not, I can change it to async or remove it.

    // I will implementation it as async internal, but export as Promise-based?
    // Original was sync. I'll keep it sync (local only) for now to avoid breaking changes, 
    // OR create a new "searchProfilesAsync".
    const searchProfiles = useCallback((query: string): UserProfile[] => {
        if (!query || query.length < 2) return []
        const existingUsers = JSON.parse(localStorage.getItem("arpo_users") || "{}")
        const lowerQuery = query.toLowerCase()
        return (Object.values(existingUsers) as UserProfile[]).filter((user: UserProfile) =>
            user.username?.toLowerCase().includes(lowerQuery) ||
            user.wallet.toLowerCase().includes(lowerQuery)
        )
    }, [])

    return {
        profile,
        isLoading,
        showProfileModal,
        setShowProfileModal,
        isFirstTime,
        saveProfile,
        getDisplayName,
        getAvatar,
        getProfileByWallet,
        searchProfiles,
    }
}
