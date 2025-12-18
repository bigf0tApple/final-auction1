"use client"

import { createClient, SupabaseClient } from "@supabase/supabase-js"

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create Supabase client only if URL is provided (prevents build errors)
export const supabase: SupabaseClient = supabaseUrl
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient("https://placeholder.supabase.co", "placeholder-key")

// Flag to check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Types based on schema
export interface User {
    id: string
    wallet_address: string
    username: string | null
    profile_pic_url: string | null
    ens_name: string | null
    bio: string | null
    twitter: string | null
    instagram: string | null
    created_at: string
    updated_at: string
}

export interface Auction {
    id: number
    title: string
    description: string | null
    artist_name: string | null
    image_ipfs_cid: string
    teaser_ipfs_cid: string | null
    accepted_token: string
    starting_price: number
    current_bid: number | null
    highest_bidder: string | null
    start_time: string
    end_time: string
    duration_minutes: number
    status: "scheduled" | "live" | "ended" | "settled"
    winner_wallet: string | null
    nft_contract: string | null
    nft_token_id: string | null
    tx_hash: string | null
    created_at: string
}

export interface Bid {
    id: number
    auction_id: number
    bidder_wallet: string
    amount: number
    tx_hash: string | null
    confirmed: boolean
    created_at: string
}

export interface ChatMessage {
    id: number
    auction_id: number
    user_wallet: string
    display_name: string
    message: string
    created_at: string
}

export interface UserStats {
    wallet_address: string
    total_bids: number
    auctions_won: number
    messages_sent: number
    updated_at: string
}

// ============ User Functions ============

export async function getUser(walletAddress: string): Promise<User | null> {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress.toLowerCase())
        .single()

    if (error) {
        console.error("Error fetching user:", error)
        return null
    }
    return data
}

export async function createOrUpdateUser(
    walletAddress: string,
    updates: Partial<Pick<User, "username" | "profile_pic_url" | "ens_name" | "bio" | "twitter" | "instagram">>
): Promise<User | null> {
    const { data, error } = await supabase
        .from("users")
        .upsert({
            wallet_address: walletAddress.toLowerCase(),
            ...updates,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: "wallet_address",
        })
        .select()
        .single()

    if (error) {
        console.error("Error upserting user:", error)
        return null
    }
    return data
}

export async function getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single()

    if (error) {
        console.error("Error fetching user by username:", error)
        return null
    }
    return data
}

export async function searchUsers(query: string, limit = 10): Promise<User[]> {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`username.ilike.%${query}%,wallet_address.ilike.%${query}%`)
        .limit(limit)

    if (error) {
        console.error("Error searching users:", error)
        return []
    }
    return data || []
}

export async function searchAuctions(query: string, limit = 10): Promise<Auction[]> {
    const { data, error } = await supabase
        .from("auctions")
        .select("*")
        .or(`title.ilike.%${query}%,artist_name.ilike.%${query}%`)
        .limit(limit)

    if (error) {
        console.error("Error searching auctions:", error)
        return []
    }
    return data || []
}

// ============ Auction Functions ============

export async function getAuction(auctionId: number): Promise<Auction | null> {
    const { data, error } = await supabase
        .from("auctions")
        .select("*")
        .eq("id", auctionId)
        .single()

    if (error) {
        console.error("Error fetching auction:", error)
        return null
    }
    return data
}

export async function getLiveAuction(): Promise<Auction | null> {
    const { data, error } = await supabase
        .from("auctions")
        .select("*")
        .eq("status", "live")
        .order("start_time", { ascending: false })
        .limit(1)
        .single()

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching live auction:", error)
        return null
    }
    return data
}

export async function getUpcomingAuctions(limit = 5): Promise<Auction[]> {
    const { data, error } = await supabase
        .from("auctions")
        .select("*")
        .eq("status", "scheduled")
        .order("start_time", { ascending: true })
        .limit(limit)

    if (error) {
        console.error("Error fetching upcoming auctions:", error)
        return []
    }
    return data || []
}

export async function getRecentAuctions(limit = 10): Promise<Auction[]> {
    const { data, error } = await supabase
        .from("auctions")
        .select("*")
        .in("status", ["ended", "settled"])
        .order("end_time", { ascending: false })
        .limit(limit)

    if (error) {
        console.error("Error fetching recent auctions:", error)
        return []
    }
    return data || []
}

export async function updateAuctionBid(
    auctionId: number,
    currentBid: number,
    highestBidder: string
): Promise<boolean> {
    const { error } = await supabase
        .from("auctions")
        .update({
            current_bid: currentBid,
            highest_bidder: highestBidder.toLowerCase(),
        })
        .eq("id", auctionId)

    if (error) {
        console.error("Error updating auction bid:", error)
        return false
    }
    return true
}

export async function updateAuctionStatus(
    auctionId: number,
    status: Auction["status"]
): Promise<boolean> {
    const { error } = await supabase
        .from("auctions")
        .update({ status })
        .eq("id", auctionId)

    if (error) {
        console.error("Error updating auction status:", error)
        return false
    }
    return true
}

export async function createAuction(
    auctionData: Omit<Auction, "id" | "current_bid" | "highest_bidder" | "status" | "winner_wallet" | "tx_hash" | "created_at">
): Promise<Auction | null> {
    const { data, error } = await supabase
        .from("auctions")
        .insert({
            ...auctionData,
            status: "scheduled",
            current_bid: null,
            highest_bidder: null,
            winner_wallet: null,
            tx_hash: null,
        })
        .select()
        .single()

    if (error) {
        console.error("Error creating auction:", error)
        return null
    }
    return data
}

// ============ Bid Functions ============

export async function recordBid(
    auctionId: number,
    bidderWallet: string,
    amount: number,
    txHash?: string
): Promise<Bid | null> {
    const { data, error } = await supabase
        .from("bids")
        .insert({
            auction_id: auctionId,
            bidder_wallet: bidderWallet.toLowerCase(),
            amount,
            tx_hash: txHash || null,
            confirmed: false,
        })
        .select()
        .single()

    if (error) {
        console.error("Error recording bid:", error)
        return null
    }
    return data
}

export async function confirmBid(bidId: number): Promise<boolean> {
    const { error } = await supabase
        .from("bids")
        .update({ confirmed: true })
        .eq("id", bidId)

    if (error) {
        console.error("Error confirming bid:", error)
        return false
    }
    return true
}

export async function getAuctionBids(auctionId: number): Promise<Bid[]> {
    const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("auction_id", auctionId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching auction bids:", error)
        return []
    }
    return data || []
}

export async function getUserBids(walletAddress: string): Promise<Bid[]> {
    const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("bidder_wallet", walletAddress.toLowerCase())
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching user bids:", error)
        return []
    }
    return data || []
}

// ============ Chat Functions ============

export async function sendChatMessage(
    auctionId: number,
    userWallet: string,
    displayName: string,
    message: string
): Promise<ChatMessage | null> {
    const { data, error } = await supabase
        .from("chat_messages")
        .insert({
            auction_id: auctionId,
            user_wallet: userWallet.toLowerCase(),
            display_name: displayName,
            message,
        })
        .select()
        .single()

    if (error) {
        console.error("Error sending chat message:", error)
        return null
    }
    return data
}

export async function getAuctionChat(
    auctionId: number,
    limit = 100
): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("auction_id", auctionId)
        .order("created_at", { ascending: true })
        .limit(limit)

    if (error) {
        console.error("Error fetching chat messages:", error)
        return []
    }
    return data || []
}

// Subscribe to real-time chat messages
export function subscribeToChatMessages(
    auctionId: number,
    callback: (message: ChatMessage) => void
) {
    return supabase
        .channel(`chat:${auctionId}`)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "chat_messages",
                filter: `auction_id=eq.${auctionId}`,
            },
            (payload) => {
                callback(payload.new as ChatMessage)
            }
        )
        .subscribe()
}

// ============ User Stats Functions ============

export async function getUserStats(walletAddress: string): Promise<UserStats | null> {
    const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("wallet_address", walletAddress.toLowerCase())
        .single()

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching user stats:", error)
        return null
    }
    return data
}

export async function incrementUserStat(
    walletAddress: string,
    stat: "total_bids" | "auctions_won" | "messages_sent"
): Promise<boolean> {
    const wallet = walletAddress.toLowerCase()

    // First try to get existing stats
    const existing = await getUserStats(wallet)

    if (existing) {
        const { error } = await supabase
            .from("user_stats")
            .update({
                [stat]: existing[stat] + 1,
                updated_at: new Date().toISOString(),
            })
            .eq("wallet_address", wallet)

        if (error) {
            console.error("Error incrementing stat:", error)
            return false
        }
    } else {
        // Create new stats record
        const { error } = await supabase
            .from("user_stats")
            .insert({
                wallet_address: wallet,
                [stat]: 1,
            })

        if (error) {
            console.error("Error creating stats:", error)
            return false
        }
    }
    return true
}

// ============ Real-time Auction Updates ============

export function subscribeToAuctionUpdates(
    auctionId: number,
    callback: (auction: Auction) => void
) {
    return supabase
        .channel(`auction:${auctionId}`)
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "auctions",
                filter: `id=eq.${auctionId}`,
            },
            (payload) => {
                callback(payload.new as Auction)
            }
        )
        .subscribe()
}

// ============ Check Supabase Connection ============

export async function checkSupabaseConnection(): Promise<boolean> {
    if (!isSupabaseConfigured) {
        console.warn("Supabase not configured - using local storage fallback")
        return false
    }

    try {
        const { error } = await supabase.from("users").select("count").limit(1)
        if (error) {
            console.error("Supabase connection error:", error)
            return false
        }
        return true
    } catch (e) {
        console.error("Supabase connection failed:", e)
        return false
    }
}
