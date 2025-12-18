"use client"

/**
 * Mock Analytics Data for Admin Panel
 * This can be replaced with real Supabase queries later
 */

export interface AnalyticsTimeFrameData {
    totalSales: string
    totalBids: string
    totalVolume: string
    activeUsers: string
    joinedUsers: string
    liveUsers: string
    growth: {
        sales: string
        bids: string
        volume: string
        active: string
        joined: string
        live: string
    }
}

type TimeFrameKey = "7d" | "24h" | "30d" | "90d" | "1m" | "3m" | "6m" | "1y" | "all"

const analyticsData: Record<TimeFrameKey, AnalyticsTimeFrameData> = {
    "24h": {
        totalSales: "18.2 ETH",
        totalBids: "221",
        totalVolume: "41.3 ETH",
        activeUsers: "89",
        joinedUsers: "23",
        liveUsers: "42",
        growth: {
            sales: "+3.1%",
            bids: "+5.2%",
            volume: "+4.7%",
            active: "+2.3%",
            joined: "+8.5%",
            live: "Current",
        },
    },
    "7d": {
        totalSales: "127.8 ETH",
        totalBids: "1,543",
        totalVolume: "289.2 ETH",
        activeUsers: "234",
        joinedUsers: "156",
        liveUsers: "89",
        growth: {
            sales: "+8.2%",
            bids: "+12.5%",
            volume: "+15.3%",
            active: "+5.7%",
            joined: "+23.1%",
            live: "Current",
        },
    },
    "30d": {
        totalSales: "512.4 ETH",
        totalBids: "6,187",
        totalVolume: "1,156.8 ETH",
        activeUsers: "578",
        joinedUsers: "312",
        liveUsers: "89",
        growth: {
            sales: "+15.7%",
            bids: "+18.3%",
            volume: "+21.2%",
            active: "+9.4%",
            joined: "+28.6%",
            live: "Current",
        },
    },
    "90d": {
        totalSales: "1,537.2 ETH",
        totalBids: "18,561",
        totalVolume: "3,470.4 ETH",
        activeUsers: "1,234",
        joinedUsers: "789",
        liveUsers: "89",
        growth: {
            sales: "+22.3%",
            bids: "+25.1%",
            volume: "+28.9%",
            active: "+14.8%",
            joined: "+35.2%",
            live: "Current",
        },
    },
    "1m": {
        totalSales: "1,247.8 ETH",
        totalBids: "15,432",
        totalVolume: "2,891.2 ETH",
        activeUsers: "1,234",
        joinedUsers: "567",
        liveUsers: "89",
        growth: {
            sales: "+12.5%",
            bids: "+8.2%",
            volume: "+15.3%",
            active: "+5.7%",
            joined: "+23.1%",
            live: "Current",
        },
    },
    "3m": {
        totalSales: "3,247.8 ETH",
        totalBids: "45,432",
        totalVolume: "7,891.2 ETH",
        activeUsers: "2,234",
        joinedUsers: "1,567",
        liveUsers: "89",
        growth: {
            sales: "+18.5%",
            bids: "+14.2%",
            volume: "+22.3%",
            active: "+8.7%",
            joined: "+31.1%",
            live: "Current",
        },
    },
    "6m": {
        totalSales: "6,247.8 ETH",
        totalBids: "85,432",
        totalVolume: "14,891.2 ETH",
        activeUsers: "3,234",
        joinedUsers: "2,567",
        liveUsers: "89",
        growth: {
            sales: "+25.5%",
            bids: "+19.2%",
            volume: "+28.3%",
            active: "+12.7%",
            joined: "+38.1%",
            live: "Current",
        },
    },
    "1y": {
        totalSales: "12,247.8 ETH",
        totalBids: "185,432",
        totalVolume: "28,891.2 ETH",
        activeUsers: "5,234",
        joinedUsers: "4,567",
        liveUsers: "89",
        growth: {
            sales: "+45.5%",
            bids: "+32.2%",
            volume: "+52.3%",
            active: "+28.7%",
            joined: "+67.1%",
            live: "Current",
        },
    },
    all: {
        totalSales: "25,247.8 ETH",
        totalBids: "385,432",
        totalVolume: "58,891.2 ETH",
        activeUsers: "8,234",
        joinedUsers: "8,567",
        liveUsers: "89",
        growth: {
            sales: "Since launch",
            bids: "Since launch",
            volume: "Since launch",
            active: "Since launch",
            joined: "Since launch",
            live: "Current",
        },
    },
}

/**
 * Get analytics data for a given time frame
 * @param timeFrame The time frame key (24h, 7d, 30d, etc.)
 * @returns Analytics data for the time frame
 */
export function getAnalyticsData(timeFrame: string): AnalyticsTimeFrameData {
    return analyticsData[timeFrame as TimeFrameKey] || analyticsData["7d"]
}

// Mock users data for user management
export interface MockUser {
    address: string
    totalBids: number
    auctionsWon: number
    totalSpent: string
    joinDate: string
    lastActive: string
    status: "active" | "warning" | "blacklisted"
    reputation?: number
}

export const mockUsers: MockUser[] = [
    {
        address: "0x1234...5678",
        totalBids: 45,
        auctionsWon: 12,
        totalSpent: "23.4 ETH",
        joinDate: "2024-01-15",
        lastActive: "2 hours ago",
        status: "active",
    },
    {
        address: "0x8765...4321",
        totalBids: 78,
        auctionsWon: 5,
        totalSpent: "8.7 ETH",
        joinDate: "2024-02-20",
        lastActive: "1 day ago",
        status: "active",
    },
    {
        address: "0xabcd...efgh",
        totalBids: 12,
        auctionsWon: 0,
        totalSpent: "0 ETH",
        joinDate: "2024-03-10",
        lastActive: "5 days ago",
        status: "warning",
    },
    {
        address: "0x9999...1111",
        totalBids: 156,
        auctionsWon: 23,
        totalSpent: "45.2 ETH",
        joinDate: "2023-12-01",
        lastActive: "Just now",
        status: "active",
    },
]

// Mock blacklisted users
export const mockBlacklistedUsers = [
    { address: "0xBAD1...2345", reason: "Spam bidding", date: "2024-02-15" },
    { address: "0xBAD2...6789", reason: "Fraudulent activity", date: "2024-03-01" },
]

// Mock chat history data
export interface ChatHistoryDay {
    date: string
    dayName: string
    messageCount: number
}

export const mockChatHistory: ChatHistoryDay[] = [
    { date: "2024-03-15", dayName: "Friday", messageCount: 234 },
    { date: "2024-03-14", dayName: "Thursday", messageCount: 189 },
    { date: "2024-03-13", dayName: "Wednesday", messageCount: 312 },
    { date: "2024-03-12", dayName: "Tuesday", messageCount: 156 },
    { date: "2024-03-11", dayName: "Monday", messageCount: 278 },
]

// Default blocked words
export const defaultBlockedWords = ["spam", "scam", "fake", "rug", "phishing"]
