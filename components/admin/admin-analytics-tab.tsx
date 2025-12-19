"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import AdminAnalyticsCards, { type AnalyticsData } from "./admin-analytics-cards"
import { AdminChartsGrid } from "./admin-charts"

interface TimeFrame {
    key: string
    label: string
}

interface AdminAnalyticsTabProps {
    isDark: boolean
    analytics: AnalyticsData
    selectedTimeFrame: string
    setSelectedTimeFrame: (frame: string) => void
    timeFrames: TimeFrame[]
    onOpenDetailedChart: (chartType: string) => void
}

export default function AdminAnalyticsTab({
    analytics,
    selectedTimeFrame,
    setSelectedTimeFrame,
    timeFrames,
    onOpenDetailedChart,
    isDark,
}: AdminAnalyticsTabProps) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-black dark:text-white">Site Analytics</h2>

                {/* Time Frame Selector */}
                <div className="flex space-x-2">
                    {timeFrames.map((frame) => (
                        <Button
                            key={frame.key}
                            onClick={() => setSelectedTimeFrame(frame.key)}
                            className={`${selectedTimeFrame === frame.key
                                ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000]"
                                : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white"
                                } rounded-lg text-sm px-3 py-1`}
                        >
                            {frame.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Analytics Cards */}
            <AdminAnalyticsCards
                analytics={analytics}
                isDark={isDark}
                onOpenDetailedChart={onOpenDetailedChart}
            />

            {/* Detailed Charts Section */}
            <AdminChartsGrid
                isDark={isDark}
                selectedTimeFrame={selectedTimeFrame}
                analytics={analytics}
            />
        </div>
    )
}
