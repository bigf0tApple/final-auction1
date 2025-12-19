"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, LineChart, BarChart3, TrendingUp, Activity } from "lucide-react"
import { SalesTrendChart, BidActivityChart, UserGrowthChart } from "../demo-charts"

interface TimeFrame {
    key: string
    label: string
}

const timeFrames: TimeFrame[] = [
    { key: "24h", label: "24 Hours" },
    { key: "7d", label: "7 Days" },
    { key: "30d", label: "30 Days" },
    { key: "90d", label: "90 Days" },
    { key: "1y", label: "1 Year" },
    { key: "all", label: "All Time" },
]

interface AdminChartModalProps {
    chartType: string
    isDark: boolean
    onClose: () => void
    getAnalyticsData: (timeFrame: string) => { totalSales: string }
}

/**
 * Detailed Chart Modal
 * Shows larger chart with time frame selector
 */
export function AdminChartModal({
    chartType,
    isDark,
    onClose,
    getAnalyticsData,
}: AdminChartModalProps) {
    const [modalTimeFrame, setModalTimeFrame] = useState("7d")

    const getChartTitle = (type: string) => {
        const titles: Record<string, string> = {
            sales: "Sales Analytics",
            bids: "Bidding Activity",
            volume: "Trading Volume",
            users: "User Activity",
            joined: "User Growth",
            live: "Live Users",
        }
        return titles[type] || "Analytics"
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#000000] border border-black dark:border-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-black dark:text-white">{getChartTitle(chartType)}</h3>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white hover:border-white dark:hover:bg-white dark:hover:text-black dark:hover:border-black rounded-lg"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Time Frame Selector */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {timeFrames.map((frame) => (
                        <button
                            key={frame.key}
                            onClick={() => setModalTimeFrame(frame.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all duration-200 ${modalTimeFrame === frame.key
                                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                                    : "bg-white dark:bg-black text-black dark:text-white border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900"
                                }`}
                        >
                            {frame.label}
                        </button>
                    ))}
                </div>

                {/* Dynamic Chart */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 mb-4">
                    {(chartType === "sales" || chartType === "volume") && (
                        <SalesTrendChart isDark={isDark} timeFrame={modalTimeFrame} />
                    )}
                    {chartType === "bids" && <BidActivityChart isDark={isDark} timeFrame={modalTimeFrame} />}
                    {(chartType === "users" || chartType === "joined" || chartType === "live" || chartType === "active") && (
                        <UserGrowthChart isDark={isDark} timeFrame={modalTimeFrame} />
                    )}
                </div>

                {/* Chart Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-lg font-bold text-black dark:text-white">
                            {getAnalyticsData(modalTimeFrame).totalSales}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Peak Value</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-lg font-bold text-black dark:text-white">+{Math.floor(Math.random() * 30)}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Growth</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-lg font-bold text-black dark:text-white">{Math.floor(Math.random() * 100)}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Trend</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-lg font-bold text-black dark:text-white">{Math.floor(Math.random() * 50)}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Volatility</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface AdminChartsGridProps {
    isDark: boolean
    selectedTimeFrame: string
    analytics: { liveUsers: string | number; activeUsers: string | number }
}

/**
 * Admin Charts Grid
 * Displays detailed analytics charts in a grid layout
 */
export function AdminChartsGrid({
    isDark,
    selectedTimeFrame,
    analytics,
}: AdminChartsGridProps) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-black dark:text-white">Detailed Analytics</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-black dark:text-white flex items-center">
                            <LineChart className="h-5 w-5 mr-2" />
                            Sales Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SalesTrendChart isDark={isDark} timeFrame={selectedTimeFrame} />
                    </CardContent>
                </Card>

                {/* Bid Activity Chart */}
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-black dark:text-white flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2" />
                            Bid Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BidActivityChart isDark={isDark} timeFrame={selectedTimeFrame} />
                    </CardContent>
                </Card>

                {/* Active Bidders Chart */}
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-black dark:text-white flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            Active Bidders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UserGrowthChart isDark={isDark} timeFrame={selectedTimeFrame} />
                    </CardContent>
                </Card>

                {/* Platform Health */}
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-black dark:text-white flex items-center">
                            <Activity className="h-5 w-5 mr-2" />
                            Platform Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>Uptime</span>
                                <span className={`font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>99.9%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>Avg Response</span>
                                <span className={`font-bold ${isDark ? "text-white" : "text-black"}`}>142ms</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>Active Sessions</span>
                                <span className={`font-bold ${isDark ? "text-white" : "text-black"}`}>{analytics.liveUsers}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>Chat Messages</span>
                                <span className={`font-bold ${isDark ? "text-white" : "text-black"}`}>1,247</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>Wallet Connects</span>
                                <span className={`font-bold ${isDark ? "text-white" : "text-black"}`}>{analytics.activeUsers}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export { timeFrames }
export type { TimeFrame }
