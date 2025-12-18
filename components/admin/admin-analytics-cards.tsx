"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Gavel, TrendingUp, Activity, UserPlus, Eye } from "lucide-react"

interface AnalyticsData {
    totalSales: string
    totalBids: number
    totalVolume: string
    activeUsers: number
    joinedUsers: number
    liveUsers: number
    growth: {
        sales: string
        bids: string
        volume: string
        active: string
        joined: string
        live: string
    }
}

interface AdminAnalyticsCardsProps {
    analytics: AnalyticsData
    isDark: boolean
    onOpenDetailedChart: (chartType: string) => void
}

/**
 * Reusable analytics stat card component
 */
function StatCard({
    title,
    value,
    growth,
    icon: Icon,
    isDark,
    onClick,
}: {
    title: string
    value: string | number
    growth: string
    icon: React.ElementType
    isDark: boolean
    onClick: () => void
}) {
    return (
        <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black dark:text-white">{title}</CardTitle>
                <Icon
                    className="h-4 w-4 text-black dark:text-white cursor-pointer hover:scale-110 transition-transform"
                    onClick={onClick}
                />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">{value}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{growth}</p>
            </CardContent>
        </Card>
    )
}

/**
 * Admin Analytics Cards Grid
 * Displays 6 key metrics with clickable icons for detailed charts
 */
export default function AdminAnalyticsCards({
    analytics,
    isDark,
    onOpenDetailedChart,
}: AdminAnalyticsCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
                title="Total Sales"
                value={analytics.totalSales}
                growth={analytics.growth.sales}
                icon={DollarSign}
                isDark={isDark}
                onClick={() => onOpenDetailedChart("sales")}
            />
            <StatCard
                title="Total Bids"
                value={analytics.totalBids}
                growth={analytics.growth.bids}
                icon={Gavel}
                isDark={isDark}
                onClick={() => onOpenDetailedChart("bids")}
            />
            <StatCard
                title="Total Volume"
                value={analytics.totalVolume}
                growth={analytics.growth.volume}
                icon={TrendingUp}
                isDark={isDark}
                onClick={() => onOpenDetailedChart("volume")}
            />
            <StatCard
                title="Active Users"
                value={analytics.activeUsers}
                growth={analytics.growth.active}
                icon={Activity}
                isDark={isDark}
                onClick={() => onOpenDetailedChart("users")}
            />
            <StatCard
                title="Joined Users"
                value={analytics.joinedUsers}
                growth={analytics.growth.joined}
                icon={UserPlus}
                isDark={isDark}
                onClick={() => onOpenDetailedChart("joined")}
            />
            <StatCard
                title="Live Users"
                value={analytics.liveUsers}
                growth={analytics.growth.live}
                icon={Eye}
                isDark={isDark}
                onClick={() => onOpenDetailedChart("live")}
            />
        </div>
    )
}

export type { AnalyticsData, AdminAnalyticsCardsProps }
