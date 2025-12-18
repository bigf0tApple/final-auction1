"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,

  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Generate dynamic data based on time frame
const generateSalesData = (timeFrame: string) => {
  const baseData = {
    "7d": [
      { name: "Mon", sales: 12.5 },
      { name: "Tue", sales: 19.2 },
      { name: "Wed", sales: 8.7 },
      { name: "Thu", sales: 25.1 },
      { name: "Fri", sales: 31.4 },
      { name: "Sat", sales: 22.8 },
      { name: "Sun", sales: 18.6 },
    ],
    "1m": [
      { name: "Week 1", sales: 145.2 },
      { name: "Week 2", sales: 189.7 },
      { name: "Week 3", sales: 156.3 },
      { name: "Week 4", sales: 203.8 },
    ],
    "3m": [
      { name: "Month 1", sales: 1247.8 },
      { name: "Month 2", sales: 1456.3 },
      { name: "Month 3", sales: 1689.2 },
    ],
    "6m": [
      { name: "Jan", sales: 1247.8 },
      { name: "Feb", sales: 1456.3 },
      { name: "Mar", sales: 1689.2 },
      { name: "Apr", sales: 1834.7 },
      { name: "May", sales: 1923.5 },
      { name: "Jun", sales: 2156.8 },
    ],
    "1y": [
      { name: "Q1", sales: 4393.3 },
      { name: "Q2", sales: 5915.0 },
      { name: "Q3", sales: 6234.7 },
      { name: "Q4", sales: 7456.2 },
    ],
    all: [
      { name: "2022", sales: 8456.2 },
      { name: "2023", sales: 15234.7 },
      { name: "2024", sales: 23999.2 },
    ],
  }
  return baseData[timeFrame as keyof typeof baseData] || baseData["7d"]
}

const generateBidData = (timeFrame: string) => {
  const baseData = {
    "7d": [
      { name: "Mon", bids: 45 },
      { name: "Tue", bids: 67 },
      { name: "Wed", bids: 32 },
      { name: "Thu", bids: 89 },
      { name: "Fri", bids: 124 },
      { name: "Sat", bids: 98 },
      { name: "Sun", bids: 76 },
    ],
    "1m": [
      { name: "Week 1", bids: 531 },
      { name: "Week 2", bids: 687 },
      { name: "Week 3", bids: 456 },
      { name: "Week 4", bids: 789 },
    ],
    "3m": [
      { name: "Month 1", bids: 2463 },
      { name: "Month 2", bids: 3156 },
      { name: "Month 3", bids: 3789 },
    ],
    "6m": [
      { name: "Jan", bids: 2463 },
      { name: "Feb", bids: 3156 },
      { name: "Mar", bids: 3789 },
      { name: "Apr", bids: 4234 },
      { name: "May", bids: 4567 },
      { name: "Jun", bids: 5123 },
    ],
    "1y": [
      { name: "Q1", bids: 9408 },
      { name: "Q2", bids: 13924 },
      { name: "Q3", bids: 15678 },
      { name: "Q4", bids: 18234 },
    ],
    all: [
      { name: "2022", bids: 25678 },
      { name: "2023", bids: 57244 },
      { name: "2024", bids: 85432 },
    ],
  }
  return baseData[timeFrame as keyof typeof baseData] || baseData["7d"]
}

const generateUserGrowthData = (timeFrame: string) => {
  const baseData = {
    "7d": [
      { name: "Mon", users: 220 },
      { name: "Tue", users: 225 },
      { name: "Wed", users: 228 },
      { name: "Thu", users: 230 },
      { name: "Fri", users: 234 },
      { name: "Sat", users: 236 },
      { name: "Sun", users: 234 },
    ],
    "1m": [
      { name: "Week 1", users: 1120 },
      { name: "Week 2", users: 1145 },
      { name: "Week 3", users: 1178 },
      { name: "Week 4", users: 1234 },
    ],
    "3m": [
      { name: "Month 1", users: 1834 },
      { name: "Month 2", users: 2156 },
      { name: "Month 3", users: 2234 },
    ],
    "6m": [
      { name: "Jan", users: 1834 },
      { name: "Feb", users: 2156 },
      { name: "Mar", users: 2234 },
      { name: "Apr", users: 2567 },
      { name: "May", users: 2890 },
      { name: "Jun", users: 3234 },
    ],
    "1y": [
      { name: "Q1", users: 6224 },
      { name: "Q2", users: 8691 },
      { name: "Q3", users: 12456 },
      { name: "Q4", users: 15234 },
    ],
    all: [
      { name: "2022", users: 5678 },
      { name: "2023", users: 12456 },
      { name: "2024", users: 23456 },
    ],
  }
  return baseData[timeFrame as keyof typeof baseData] || baseData["7d"]
}

const generateVolumeData = (timeFrame: string) => {
  const baseData = {
    "7d": [
      { name: "NFT Art", value: 45, color: "#000000" },
      { name: "Digital Collectibles", value: 30, color: "#666666" },
      { name: "Photography", value: 15, color: "#999999" },
      { name: "Music", value: 10, color: "#CCCCCC" },
    ],
    "1m": [
      { name: "NFT Art", value: 42, color: "#000000" },
      { name: "Digital Collectibles", value: 28, color: "#666666" },
      { name: "Photography", value: 18, color: "#999999" },
      { name: "Music", value: 12, color: "#CCCCCC" },
    ],
    "3m": [
      { name: "NFT Art", value: 38, color: "#000000" },
      { name: "Digital Collectibles", value: 32, color: "#666666" },
      { name: "Photography", value: 20, color: "#999999" },
      { name: "Music", value: 10, color: "#CCCCCC" },
    ],
    "6m": [
      { name: "NFT Art", value: 35, color: "#000000" },
      { name: "Digital Collectibles", value: 35, color: "#666666" },
      { name: "Photography", value: 20, color: "#999999" },
      { name: "Music", value: 10, color: "#CCCCCC" },
    ],
    "1y": [
      { name: "NFT Art", value: 40, color: "#000000" },
      { name: "Digital Collectibles", value: 30, color: "#666666" },
      { name: "Photography", value: 20, color: "#999999" },
      { name: "Music", value: 10, color: "#CCCCCC" },
    ],
    all: [
      { name: "NFT Art", value: 45, color: "#000000" },
      { name: "Digital Collectibles", value: 30, color: "#666666" },
      { name: "Photography", value: 15, color: "#999999" },
      { name: "Music", value: 10, color: "#CCCCCC" },
    ],
  }
  return baseData[timeFrame as keyof typeof baseData] || baseData["7d"]
}

interface DemoChartsProps {
  isDark: boolean
  timeFrame: string
}

export function SalesTrendChart({ isDark, timeFrame }: DemoChartsProps) {
  const salesData = generateSalesData(timeFrame)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={salesData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
        <XAxis dataKey="name" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
        <YAxis stroke={isDark ? "#9CA3AF" : "#6B7280"} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#000000" : "#FFFFFF",
            border: `1px solid ${isDark ? "#FFFFFF" : "#000000"}`,
            borderRadius: "8px",
            color: isDark ? "#FFFFFF" : "#000000",
          }}
        />
        <Line
          type="monotone"
          dataKey="sales"
          stroke={isDark ? "#FFFFFF" : "#000000"}
          strokeWidth={2}
          dot={{ fill: isDark ? "#FFFFFF" : "#000000" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function BidActivityChart({ isDark, timeFrame }: DemoChartsProps) {
  const bidData = generateBidData(timeFrame)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={bidData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
        <XAxis dataKey="name" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
        <YAxis stroke={isDark ? "#9CA3AF" : "#6B7280"} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#000000" : "#FFFFFF",
            border: `1px solid ${isDark ? "#FFFFFF" : "#000000"}`,
            borderRadius: "8px",
            color: isDark ? "#FFFFFF" : "#000000",
          }}
        />
        <Bar dataKey="bids" fill={isDark ? "#FFFFFF" : "#000000"} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function UserGrowthChart({ isDark, timeFrame }: DemoChartsProps) {
  const userGrowthData = generateUserGrowthData(timeFrame)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={userGrowthData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
        <XAxis dataKey="name" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
        <YAxis stroke={isDark ? "#9CA3AF" : "#6B7280"} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#000000" : "#FFFFFF",
            border: `1px solid ${isDark ? "#FFFFFF" : "#000000"}`,
            borderRadius: "8px",
            color: isDark ? "#FFFFFF" : "#000000",
          }}
        />
        <Line
          type="monotone"
          dataKey="users"
          stroke={isDark ? "#FFFFFF" : "#000000"}
          strokeWidth={2}
          dot={{ fill: isDark ? "#FFFFFF" : "#000000" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}


