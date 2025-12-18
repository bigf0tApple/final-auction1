"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Search,
  TrendingUp,
  DollarSign,
  Activity,
  UserPlus,
  Eye,
  Ban,
  Award,
  Gavel,
  Moon,
  Sun,
  X,
  BarChart3,
  LineChart,
  PieChart,
  Upload,
  Calendar,
  Clock,
} from "lucide-react"

import { SalesTrendChart, BidActivityChart, UserGrowthChart } from "../components/demo-charts"
import ChatButton from "../components/chat-button"
import MintFlowModal from "../components/mint-flow-modal"
import { useClientAuctions } from "../hooks/use-client-auctions"
import { useChatPinned } from "../hooks/use-chat-pinned"
import type { AcceptedToken } from "../types/accepted-token"
import { createAuction, checkSupabaseConnection } from "../lib/supabase"

// Simplified image upload simulation for IPFS
const mockUploadToIPFS = async (file: File) => {
  // In a real app, this would upload to IPFS (e.g., Pinata)
  // For now, we'll return a placeholder CID
  await new Promise(resolve => setTimeout(resolve, 1000))
  return "QmPlaceholderCID" + Date.now()
}


interface AdminPanelProps {
  onClose: () => void
  isDark: boolean
  toggleTheme: () => void
  connectedWallet?: string
}

const ChatDayModal = ({
  date,
  dayName,
  onClose,
}: { date: string; dayName: string; onClose: () => void; isDark: boolean }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#000000] border border-black dark:border-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-black dark:text-white">
            Chat History for {date} ({dayName})
          </h3>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Mock Chat Data */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-black dark:text-white">0x1234...5678</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">14:30:15</div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">Great artwork!</p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-black dark:text-white">artlover.eth</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">14:32:20</div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">When does bidding end?</p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-black dark:text-white">0x9876...4321</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">09:15:30</div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">This is spam content</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminPanel({ onClose, isDark, toggleTheme, connectedWallet }: AdminPanelProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState("analytics")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("7d")
  const [showDetailedChart, setShowDetailedChart] = useState<string | null>(null)

  // Chat pinning for layout compensation
  const { isChatPinnedLeft, isChatPinnedRight } = useChatPinned()
  const contentShiftClass = isChatPinnedLeft ? "content-with-chat-left" : isChatPinnedRight ? "content-with-chat-right" : ""

  const [newBlockedWord, setNewBlockedWord] = useState("")
  const [blockedWords, setBlockedWords] = useState<string[]>([])

  // Initialize blocked words after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedWords = localStorage.getItem("blockedWords")
        if (storedWords) {
          setBlockedWords(JSON.parse(storedWords))
        } else {
          setBlockedWords(["spam", "scam", "hack", "private key", "phishing"])
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn('Failed to load blocked words:', error)
        }
        setBlockedWords(["spam", "scam", "hack", "private key", "phishing"])
      }
    }
  }, [])
  const [selectedHistoryDays, setSelectedHistoryDays] = useState<string[]>([])
  const [selectedChatDay, setSelectedChatDay] = useState<{ date: string; dayName: string } | null>(null)
  const [showMintFlow, setShowMintFlow] = useState(false)

  // Mint form state
  const [mintForm, setMintForm] = useState({
    title: "",
    description: "",
    artistName: "",
    startingPrice: "",
    royaltyPercent: "",
    auctionDate: "",
    auctionTime: "",
    duration: "24h",
    customDuration: {
      days: "",
      hours: "",
      minutes: "",
    },
    durationMode: "quick" as "quick" | "custom",
    uploadedImage: null as File | null,
    teaserImage: null as File | null,

    auctionContractAddress: "",

    acceptedTokenMode: "ETH" as "ETH" | "USDC" | "CUSTOM",
    customTokenAddress: "",
    customTokenSymbol: "",
    customTokenDecimals: "18",
  })

  const [showMintConfirmation, setShowMintConfirmation] = useState(false)

  const { allAuctions, addAuction } = useClientAuctions()

  // Default to Circle's published Base Sepolia USDC address, but allow override via env.
  const BASE_SEPOLIA_USDC_ADDRESS = (
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_USDC_ADDRESS ?? "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  ).trim()

  const resolveAcceptedToken = (): AcceptedToken => {
    if (mintForm.acceptedTokenMode === "ETH") {
      return { kind: "NATIVE", symbol: "ETH", decimals: 18 }
    }

    if (mintForm.acceptedTokenMode === "USDC") {
      return { kind: "ERC20", symbol: "USDC", address: BASE_SEPOLIA_USDC_ADDRESS, decimals: 6 }
    }

    return {
      kind: "ERC20",
      symbol: mintForm.customTokenSymbol.trim() || "ERC-20",
      address: mintForm.customTokenAddress.trim(),
      decimals: Number.parseInt(mintForm.customTokenDecimals || "18", 10),
    }
  }

  const formatTokenLabel = (): string => {
    if (mintForm.acceptedTokenMode === "ETH") return "ETH"
    if (mintForm.acceptedTokenMode === "USDC") return "USDC"
    return mintForm.customTokenSymbol.trim() || "ERC-20"
  }

  const isHexAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value.trim())
  const AUCTION_BUFFER_MS = 10 * 60 * 1000

  // Mock chat history data
  const chatHistory = [
    { date: "2024-01-15", dayName: "Today", messageCount: 156, activeUsers: 23, warnings: 2 },
    { date: "2024-01-14", dayName: "Yesterday", messageCount: 203, activeUsers: 31, warnings: 1 },
    { date: "2024-01-13", dayName: "2 days ago", messageCount: 178, activeUsers: 28, warnings: 0 },
    { date: "2024-01-12", dayName: "3 days ago", messageCount: 145, activeUsers: 19, warnings: 3 },
    { date: "2024-01-11", dayName: "4 days ago", messageCount: 167, activeUsers: 25, warnings: 1 },
    { date: "2024-01-10", dayName: "5 days ago", messageCount: 134, activeUsers: 22, warnings: 0 },
    { date: "2024-01-09", dayName: "6 days ago", messageCount: 189, activeUsers: 29, warnings: 2 },
  ]

  // Mock moderation history
  const moderationHistory = [
    {
      id: 1,
      userAddress: "0x1234...5678",
      action: "warned",
      reason: "Inappropriate language",
      date: "2024-01-15 14:30",
      status: "active",
    },
    {
      id: 2,
      userAddress: "0x9876...4321",
      action: "restricted",
      reason: "Spam content",
      date: "2024-01-14 09:15",
      status: "blacklisted",
    },
    {
      id: 3,
      userAddress: "0xABCD...EFGH",
      action: "warned",
      reason: "Rate limit exceeded",
      date: "2024-01-13 16:45",
      status: "active",
    },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      setMintForm({ ...mintForm, uploadedImage: file })
    }
  }

  const handleTeaserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      setMintForm({ ...mintForm, teaserImage: file })
    }
  }

  const handleMintSubmit = () => {
    // Validate form
    if (
      !mintForm.title ||
      !mintForm.description ||
      !mintForm.artistName ||
      !mintForm.startingPrice ||
      !mintForm.royaltyPercent ||
      !mintForm.auctionDate ||
      !mintForm.auctionTime ||
      !mintForm.uploadedImage ||
      !mintForm.teaserImage
    ) {
      alert("Please fill in all fields and upload both the main NFT image and teaser image")
      return
    }

    if (mintForm.acceptedTokenMode === "CUSTOM") {
      if (!mintForm.customTokenAddress.trim() || !isHexAddress(mintForm.customTokenAddress)) {
        alert("Please enter a valid ERC-20 contract address")
        return
      }
      if (!mintForm.customTokenSymbol.trim()) {
        alert("Please enter a token symbol")
        return
      }
      const decimals = Number.parseInt(mintForm.customTokenDecimals || "", 10)
      if (!Number.isFinite(decimals) || decimals < 0 || decimals > 18) {
        alert("Token decimals must be between 0 and 18")
        return
      }
    }

    if (mintForm.acceptedTokenMode === "USDC") {
      if (!BASE_SEPOLIA_USDC_ADDRESS || !isHexAddress(BASE_SEPOLIA_USDC_ADDRESS)) {
        alert(
          "USDC preset is not configured for Base Sepolia.\n\nSet NEXT_PUBLIC_BASE_SEPOLIA_USDC_ADDRESS in your environment, or choose CUSTOM and paste the token address.",
        )
        return
      }
    }

    if (!mintForm.auctionContractAddress.trim() || !isHexAddress(mintForm.auctionContractAddress)) {
      alert("Please enter a valid auction contract/recipient address")
      return
    }

    // Validate auction date/time is in the future
    const auctionDateTime = new Date(`${mintForm.auctionDate}T${mintForm.auctionTime}`)
    const now = new Date()

    if (auctionDateTime <= now) {
      alert("Auction start time must be in the future")
      return
    }

    // Check for double-booking/conflicts with existing auctions
    const proposedStart = auctionDateTime
    const proposedEnd = new Date(proposedStart)

    if (mintForm.durationMode === "quick") {
      const hours = parseInt(mintForm.duration.replace('h', ''))
      proposedEnd.setHours(proposedEnd.getHours() + hours)
    } else {
      const { days, hours, minutes } = mintForm.customDuration
      const totalMinutes = (parseInt(days || "0") * 24 * 60) + (parseInt(hours || "0") * 60) + parseInt(minutes || "0")
      proposedEnd.setMinutes(proposedEnd.getMinutes() + totalMinutes)
    }

    // Only one auction can exist at a time. Enforce a 10-minute buffer after any auction ends.
    const conflicts = allAuctions.filter((auction) => {
      const auctionStartMs = auction.startTime.getTime()
      const auctionEndMs = auction.endTime.getTime()
      const proposedStartMs = proposedStart.getTime()
      const proposedEndMs = proposedEnd.getTime()

      const separatedByBuffer =
        proposedStartMs >= auctionEndMs + AUCTION_BUFFER_MS || auctionStartMs >= proposedEndMs + AUCTION_BUFFER_MS

      return !separatedByBuffer
    })

    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(auction =>
        `"${auction.title}" (${auction.startTime.toLocaleDateString()} ${auction.startTime.toLocaleTimeString()} - ${auction.endTime.toLocaleTimeString()})`
      ).join('\n')

      alert(
        `⚠️ Auction time conflict detected!\n\nOnly 1 auction can run at a time, and a 10-minute buffer is required after each auction ends.\n\nConflicts with:\n${conflictDetails}\n\nPlease choose a different time slot.`,
      )
      return
    }

    // Validate duration
    if (mintForm.durationMode === "custom") {
      const { days, hours, minutes } = mintForm.customDuration
      const totalMinutes = (parseInt(days || "0") * 24 * 60) + (parseInt(hours || "0") * 60) + parseInt(minutes || "0")

      if (totalMinutes < 1) {
        alert("Custom duration must be at least 1 minute")
        return
      }

      if (totalMinutes > (3 * 24 * 60)) {
        alert("Custom duration cannot exceed 3 days")
        return
      }
    }

    setShowMintConfirmation(true)
  }

  const confirmMint = async () => {
    // Create new auction event
    const startDateTime = new Date(`${mintForm.auctionDate}T${mintForm.auctionTime}`)

    // Calculate end time based on duration
    const endDateTime = new Date(startDateTime)
    if (mintForm.durationMode === "quick") {
      const hours = parseInt(mintForm.duration.replace('h', ''))
      endDateTime.setHours(endDateTime.getHours() + hours)
    } else {
      const { days, hours, minutes } = mintForm.customDuration
      const totalMinutes = (parseInt(days || "0") * 24 * 60) + (parseInt(hours || "0") * 60) + parseInt(minutes || "0")
      endDateTime.setMinutes(endDateTime.getMinutes() + totalMinutes)
    }

    const token = resolveAcceptedToken()
    const tokenLabel = token.kind === "NATIVE" ? token.symbol : token.symbol

    // Check Supabase connection
    const isSupabaseConnected = await checkSupabaseConnection()

    if (isSupabaseConnected) {
      if (!mintForm.uploadedImage || !mintForm.teaserImage) return // Should be validated already

      // Upload mock images
      // const mainCid = await mockUploadToIPFS(mintForm.uploadedImage)
      // const teaserCid = await mockUploadToIPFS(mintForm.teaserImage)

      // Since we don't have real IPFS, we'll use placeholder CIDs from our DB logic or just empty strings
      // Ideally we should upload to Supabase Storage if configured, but let's stick to the schema requirement
      // Schema says text NOT NULL for image_ipfs_cid

      const mainCid = "QmTest" + Date.now()
      const teaserCid = "QmTeaser" + Date.now()

      const result = await createAuction({
        title: mintForm.title,
        description: mintForm.description,
        artist_name: mintForm.artistName,
        image_ipfs_cid: mainCid,
        teaser_ipfs_cid: teaserCid,
        accepted_token: tokenLabel,
        starting_price: parseFloat(mintForm.startingPrice),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        duration_minutes: (endDateTime.getTime() - startDateTime.getTime()) / 60000,
        nft_contract: mintForm.auctionContractAddress,
        nft_token_id: "1", // Mock token ID
      })

      if (result) {
        alert(`Supabase Auction created successfully! "${mintForm.title}"`)
      } else {
        alert("Failed to create auction in Supabase. Check console.")
      }
    } else {
      // Fallback to local storage logic
      const nextId = Math.max(0, ...allAuctions.map((a) => a.id)) + 1

      addAuction({
        id: nextId,
        title: mintForm.title,
        artist: mintForm.artistName,
        startTime: startDateTime,
        endTime: endDateTime,
        startingBid: `${mintForm.startingPrice} ${tokenLabel}`,
        status: "upcoming",
        acceptedToken: token,
        auctionContractAddress: mintForm.auctionContractAddress.trim(),
        description: mintForm.description,
        royaltyPercent: Number.parseFloat(mintForm.royaltyPercent),
        teaserImage: mintForm.teaserImage ? URL.createObjectURL(mintForm.teaserImage) : "/placeholder.jpg",
        mainImage: mintForm.uploadedImage ? URL.createObjectURL(mintForm.uploadedImage) : "/placeholder.jpg",
        category: "Minted",
      })

      alert(`Local Auction minted successfully! "${mintForm.title}" scheduled for ${startDateTime.toLocaleString()} (${tokenLabel})`)
    }

    setShowMintConfirmation(false)
    // Reset form
    setMintForm({
      title: "",
      description: "",
      artistName: "",
      startingPrice: "",
      royaltyPercent: "",
      auctionDate: "",
      auctionTime: "",
      duration: "24h",
      customDuration: {
        days: "",
        hours: "",
        minutes: "",
      },
      durationMode: "quick" as "quick" | "custom",
      uploadedImage: null as File | null,
      teaserImage: null as File | null,

      auctionContractAddress: "",

      acceptedTokenMode: "ETH" as "ETH" | "USDC" | "CUSTOM",
      customTokenAddress: "",
      customTokenSymbol: "",
      customTokenDecimals: "18",
    })
  }

  const addBlockedWord = () => {
    const word = newBlockedWord.trim().toLowerCase()
    if (word && !blockedWords.includes(word)) {
      const updatedWords = [...blockedWords, word]
      setBlockedWords(updatedWords)
      localStorage.setItem("blockedWords", JSON.stringify(updatedWords))
      setNewBlockedWord("")

      // Show confirmation
      alert(`Added "${word}" to blocked words list. This word will now trigger warnings/bans in chat.`)
    } else if (blockedWords.includes(word)) {
      alert(`"${word}" is already in the blocked words list.`)
    } else {
      alert("Please enter a valid word to block.")
    }
  }

  const removeBlockedWord = (word: string) => {
    if (confirm(`Remove "${word}" from blocked words list? Users will no longer be warned for this word.`)) {
      const updatedWords = blockedWords.filter((w: string) => w !== word)
      setBlockedWords(updatedWords)
      localStorage.setItem("blockedWords", JSON.stringify(updatedWords))
      alert(`Removed "${word}" from blocked words list.`)
    }
  }

  const toggleHistorySelection = (date: string) => {
    setSelectedHistoryDays((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]))
  }

  const deleteSelectedHistory = () => {
    if (confirm(`Delete chat history for ${selectedHistoryDays.length} selected days?`)) {
      alert(`Deleted chat history for ${selectedHistoryDays.length} days`)
      setSelectedHistoryDays([])
    }
  }

  const viewDayHistory = (date: string, dayName: string) => {
    setSelectedChatDay({ date, dayName })
  }

  const exportSelectedHistory = () => {
    if (selectedHistoryDays.length === 0) {
      alert("Please select days to export")
      return
    }

    // Generate comprehensive CSV data for selected days
    const csvHeaders = [
      "Date",
      "Day_Name",
      "User_Address",
      "Username",
      "Message",
      "Timestamp",
      "User_Badge",
      "Message_Type",
      "Warning_Level",
      "Action_Taken",
      "IP_Address",
      "Session_ID"
    ]

    const csvRows = selectedHistoryDays.flatMap((date) => {
      // Find the day data
      const dayData = chatHistory.find(day => day.date === date)
      if (!dayData) return []

      // Generate sample messages for the selected day
      const messages = [
        {
          date,
          dayName: dayData.dayName,
          userAddress: "0x1234...5678",
          username: "CryptoArt_Fan",
          message: "This artwork is absolutely stunning! Love the neon aesthetic.",
          timestamp: "08:15:30",
          userBadge: "Eager Bidder",
          messageType: "normal",
          warningLevel: "0",
          actionTaken: "none",
          ipAddress: "192.168.1.100",
          sessionId: "sess_abc123"
        },
        {
          date,
          dayName: dayData.dayName,
          userAddress: "artlover.eth",
          username: "Digital_Dreams",
          message: "When does the bidding end? Want to place my final bid.",
          timestamp: "10:22:45",
          userBadge: "Pro Bidder",
          messageType: "normal",
          warningLevel: "0",
          actionTaken: "none",
          ipAddress: "10.0.0.25",
          sessionId: "sess_def456"
        },
        {
          date,
          dayName: dayData.dayName,
          userAddress: "0x9876...4321",
          username: "Spam_User",
          message: "Check out my private key sharing site!",
          timestamp: "14:10:15",
          userBadge: "New Bidder",
          messageType: "flagged",
          warningLevel: "3",
          actionTaken: "banned_24h",
          ipAddress: "203.45.67.89",
          sessionId: "sess_ghi789"
        },
        {
          date,
          dayName: dayData.dayName,
          userAddress: "0x5555...9999",
          username: "Whale_Collector",
          message: "Placing MAX PAIN - going all in on this one!",
          timestamp: "16:35:20",
          userBadge: "Legendary Bidder",
          messageType: "max_pain",
          warningLevel: "0",
          actionTaken: "none",
          ipAddress: "172.16.0.10",
          sessionId: "sess_jkl012"
        },
        {
          date,
          dayName: dayData.dayName,
          userAddress: "0x7777...3333",
          username: "Profanity_User",
          message: "This is fucking amazing art!",
          timestamp: "18:45:10",
          userBadge: "Active Bidder",
          messageType: "warning",
          warningLevel: "1",
          actionTaken: "warned",
          ipAddress: "192.168.50.75",
          sessionId: "sess_mno345"
        }
      ]

      return messages.map(msg => [
        msg.date,
        msg.dayName,
        msg.userAddress,
        msg.username,
        `"${msg.message.replace(/"/g, '""')}"`, // Escape quotes in CSV
        msg.timestamp,
        msg.userBadge,
        msg.messageType,
        msg.warningLevel,
        msg.actionTaken,
        msg.ipAddress,
        msg.sessionId
      ].join(","))
    })

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ARPO_Chat_Export_${selectedHistoryDays.length}_Days_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    // Show success message
    alert(`Successfully exported chat history for ${selectedHistoryDays.length} selected days to CSV file.`)
  }

  const unblacklistUser = (userAddress: string) => {
    if (confirm(`Unblacklist user ${userAddress}?`)) {
      alert(`User ${userAddress} has been unblacklisted`)
    }
  }

  const timeFrames = [
    { key: "7d", label: "7 Days" },
    { key: "1m", label: "1 Month" },
    { key: "3m", label: "3 Months" },
    { key: "6m", label: "6 Months" },
    { key: "1y", label: "1 Year" },
    { key: "all", label: "All Time" },
  ]

  // Mock data for different time frames
  const getAnalyticsData = (timeFrame: string) => {
    const data = {
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
    return data[timeFrame as keyof typeof data] || data["7d"]
  }

  const analytics = getAnalyticsData(selectedTimeFrame)

  const mockUsers = [
    {
      address: "0x1234...5678",
      totalBids: 45,
      auctionsWon: 12,
      totalSpent: "23.4 ETH",
      joinDate: "2024-01-15",
      lastActive: "2 hours ago",
      status: "active",
      reputation: 95,
    },
    {
      address: "0x9876...4321",
      totalBids: 23,
      auctionsWon: 5,
      totalSpent: "8.7 ETH",
      joinDate: "2024-02-20",
      lastActive: "1 day ago",
      status: "active",
      reputation: 87,
    },
    {
      address: "0xABCD...EFGH",
      totalBids: 78,
      auctionsWon: 25,
      totalSpent: "156.2 ETH",
      joinDate: "2023-11-08",
      lastActive: "5 minutes ago",
      status: "blacklisted",
      reputation: 45,
    },
  ]

  const filteredUsers = mockUsers.filter((user) => user.address.toLowerCase().includes(searchTerm.toLowerCase()))

  const toggleUserStatus = (address: string) => {
    // TODO: Implement actual user status toggling functionality
    // In production, this would update user status in the database
    void address
  }

  const openDetailedChart = (chartType: string) => {
    setShowDetailedChart(chartType)
  }

  const ChartModal = ({ chartType, onClose }: { chartType: string; onClose: () => void }) => {
    const [modalTimeFrame, setModalTimeFrame] = useState("7d")

    const getChartTitle = (type: string) => {
      const titles = {
        sales: "Sales Analytics",
        bids: "Bidding Activity",
        volume: "Trading Volume",
        users: "User Activity",
        joined: "User Growth",
        live: "Live Users",
      }
      return titles[type as keyof typeof titles] || "Analytics"
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
              <Button
                key={frame.key}
                onClick={() => setModalTimeFrame(frame.key)}
                className={`${modalTimeFrame === frame.key
                  ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000]"
                  : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white"
                  } rounded-lg text-sm px-3 py-1`}
              >
                {frame.label}
              </Button>
            ))}
          </div>

          {/* Dynamic Chart based on type and timeframe */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 mb-4">
            {(chartType === "sales" || chartType === "volume") && <SalesTrendChart isDark={isDark} timeFrame={modalTimeFrame} />}
            {chartType === "bids" && <BidActivityChart isDark={isDark} timeFrame={modalTimeFrame} />}
            {(chartType === "users" || chartType === "joined" || chartType === "live" || chartType === "active") && <UserGrowthChart isDark={isDark} timeFrame={modalTimeFrame} />}
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

  const MintConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#000000] border border-black dark:border-white rounded-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-black dark:text-white mb-4">Confirm Mint</h3>
        <div className="space-y-3 mb-6">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Title:</span>
            <p className="font-semibold text-black dark:text-white">{mintForm.title}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Artist:</span>
            <p className="font-semibold text-black dark:text-white">{mintForm.artistName}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Starting Price:</span>
            <p className="font-semibold text-black dark:text-white">{mintForm.startingPrice} {formatTokenLabel()}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Accepted Token:</span>
            <p className="font-semibold text-black dark:text-white">
              {formatTokenLabel()}
              {mintForm.acceptedTokenMode === "CUSTOM" && mintForm.customTokenAddress.trim() ? (
                <span className="block font-mono text-xs text-gray-600 dark:text-gray-400">{mintForm.customTokenAddress.trim()}</span>
              ) : null}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Royalty:</span>
            <p className="font-semibold text-black dark:text-white">{mintForm.royaltyPercent}%</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Auction Start:</span>
            <p className="font-semibold text-black dark:text-white">
              {mintForm.auctionDate} at {mintForm.auctionTime}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">On-chain Recipient:</span>
            <p className="font-semibold text-black dark:text-white font-mono text-xs break-all">{mintForm.auctionContractAddress || "-"}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowMintConfirmation(false)}
            variant="outline"
            className="flex-1 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmMint}
            className="flex-1 bg-[#000000] dark:bg-white text-white dark:text-[#000000] border-2 border-white dark:border-black hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white rounded-lg"
          >
            Confirm Mint
          </Button>
        </div>
      </div>
    </div>
  )

  // Add this useEffect to inject custom CSS
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
    /* Remove blue colors from date/time inputs */
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
      filter: invert(1);
    }
    
    input[type="date"]:focus,
    input[type="time"]:focus {
      outline: 2px solid ${isDark ? "#ffffff" : "#000000"};
      outline-offset: 2px;
    }
    
    /* Custom date/time picker styling */
    input[type="date"]::-webkit-datetime-edit-fields-wrapper,
    input[type="time"]::-webkit-datetime-edit-fields-wrapper {
      background: transparent;
    }
    
    input[type="date"]::-webkit-datetime-edit,
    input[type="time"]::-webkit-datetime-edit {
      color: ${isDark ? "#ffffff" : "#000000"};
    }
  `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [isDark])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "dark bg-[#000000]" : "bg-white"} ${contentShiftClass}`}>
      {/* Header */}
      <header className="border-b border-gray-300 dark:border-white bg-white dark:bg-[#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Auction
              </Button>
              <h1 className="text-xl font-bold text-black dark:text-white">Admin Panel</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="p-2 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white hover:border-white dark:hover:bg-white dark:hover:text-black dark:hover:border-black rounded-lg"
            >
              {isDark ? <Sun className={`h-4 w-4 ${isDark ? "text-white" : "text-black"}`} /> : <Moon className={`h-4 w-4 ${isDark ? "text-white" : "text-black"}`} />}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <Button
            onClick={() => setActiveTab("analytics")}
            className={`${activeTab === "analytics"
              ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000]"
              : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white"
              } rounded-lg`}
          >
            Analytics
          </Button>
          <Button
            onClick={() => setActiveTab("users")}
            className={`${activeTab === "users"
              ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000]"
              : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white"
              } rounded-lg`}
          >
            User Management
          </Button>
          <Button
            onClick={() => setActiveTab("chat")}
            className={`${activeTab === "chat"
              ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000]"
              : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white"
              } rounded-lg`}
          >
            Chat Management
          </Button>
          <Button
            onClick={() => setActiveTab("mint")}
            className={`${activeTab === "mint"
              ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000]"
              : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white"
              } rounded-lg`}
          >
            Mint NFT
          </Button>
        </div>

        {/* Mint Tab */}
        {activeTab === "mint" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black dark:text-white">Mint New NFT</h2>
            </div>



            <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Create New Auction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Art */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Main NFT Image */}
                  <div>
                    <label className="block text-lg font-medium text-black dark:text-white mb-3">
                      Main NFT Image
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                        (Revealed after auction starts)
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center relative min-h-[200px] flex flex-col justify-center">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {mintForm.uploadedImage ? mintForm.uploadedImage.name : "Upload main NFT image"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {mintForm.uploadedImage && (
                        <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <p className="text-xs text-green-800 dark:text-green-200">✓ Main image uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Teaser Image */}
                  <div>
                    <label className="block text-lg font-medium text-black dark:text-white mb-3">
                      Teaser Image
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                        (Shown before auction starts)
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-6 text-center relative min-h-[200px] flex flex-col justify-center bg-blue-50/30 dark:bg-blue-900/20">
                      <Upload className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                      <div className="space-y-2">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {mintForm.teaserImage ? mintForm.teaserImage.name : "Upload teaser image"}
                        </p>
                        <p className="text-xs text-blue-500 dark:text-blue-500">
                          Blurred preview or artistic teaser
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTeaserImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {mintForm.teaserImage && (
                        <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <p className="text-xs text-blue-800 dark:text-blue-200">✓ Teaser image uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Upload Explanation */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-semibold text-black dark:text-white mb-2">💡 How Image Reveal Works:</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• <strong>Teaser Image:</strong> Displayed publicly before and during initial auction phases</li>
                    <li>• <strong>Main NFT Image:</strong> Revealed automatically when the auction goes live</li>
                    <li>• <strong>Tip:</strong> Make your teaser intriguing but not fully revealing to build anticipation</li>
                  </ul>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-lg font-medium text-black dark:text-white mb-2">Title</label>
                  <Input
                    value={mintForm.title}
                    onChange={(e) => setMintForm({ ...mintForm, title: e.target.value })}
                    placeholder="Enter artwork title"
                    className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg text-lg py-3"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-lg font-medium text-black dark:text-white mb-2">Description</label>
                  <textarea
                    value={mintForm.description}
                    onChange={(e) => setMintForm({ ...mintForm, description: e.target.value })}
                    placeholder="Describe your artwork"
                    rows={4}
                    className="w-full bg-white dark:bg-[#000000] border border-black dark:border-white text-black dark:text-white rounded-lg p-3 text-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                {/* Artist Name */}
                <div>
                  <label className="block text-lg font-medium text-black dark:text-white mb-2">Artist Name</label>
                  <Input
                    value={mintForm.artistName}
                    onChange={(e) => setMintForm({ ...mintForm, artistName: e.target.value })}
                    placeholder="Enter artist name"
                    className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg text-lg py-3"
                  />
                </div>

                {/* Accepted Token */}
                <div>
                  <label className="block text-lg font-medium text-black dark:text-white mb-4">Accepted Bid Token</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                      onClick={() =>
                        setMintForm({
                          ...mintForm,
                          acceptedTokenMode: "ETH",
                          customTokenAddress: "",
                          customTokenSymbol: "",
                          customTokenDecimals: "18",
                        })
                      }
                      className={`py-3 rounded-lg transition-all ${mintForm.acceptedTokenMode === "ETH"
                        ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000]"
                        : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white"
                        }`}
                    >
                      ETH
                    </Button>
                    <Button
                      onClick={() =>
                        setMintForm({
                          ...mintForm,
                          acceptedTokenMode: "USDC",
                          customTokenAddress: "",
                          customTokenSymbol: "",
                          customTokenDecimals: "18",
                        })
                      }
                      className={`py-3 rounded-lg transition-all ${mintForm.acceptedTokenMode === "USDC"
                        ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000]"
                        : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white"
                        }`}
                    >
                      USDC
                    </Button>
                    <Button
                      onClick={() => setMintForm({ ...mintForm, acceptedTokenMode: "CUSTOM" })}
                      className={`py-3 rounded-lg transition-all ${mintForm.acceptedTokenMode === "CUSTOM"
                        ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000]"
                        : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white"
                        }`}
                    >
                      Custom ERC-20
                    </Button>
                  </div>

                  {mintForm.acceptedTokenMode === "CUSTOM" && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-black dark:text-white mb-2">Token Contract Address</label>
                        <Input
                          value={mintForm.customTokenAddress}
                          onChange={(e) => setMintForm({ ...mintForm, customTokenAddress: e.target.value })}
                          placeholder="0x..."
                          className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black dark:text-white mb-2">Decimals</label>
                        <Input
                          type="number"
                          min="0"
                          max="18"
                          value={mintForm.customTokenDecimals}
                          onChange={(e) => setMintForm({ ...mintForm, customTokenDecimals: e.target.value })}
                          placeholder="18"
                          className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black dark:text-white mb-2">Symbol</label>
                        <Input
                          value={mintForm.customTokenSymbol}
                          onChange={(e) => setMintForm({ ...mintForm, customTokenSymbol: e.target.value })}
                          placeholder="TOKEN"
                          className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Starting Price and Royalty - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-medium text-black dark:text-white mb-2">
                      Starting Price ({formatTokenLabel()})
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={mintForm.startingPrice}
                      onChange={(e) => setMintForm({ ...mintForm, startingPrice: e.target.value })}
                      placeholder="0.00"
                      className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg text-lg py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-black dark:text-white mb-2">
                      Royalty % (Future Sales)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={mintForm.royaltyPercent}
                      onChange={(e) => setMintForm({ ...mintForm, royaltyPercent: e.target.value })}
                      placeholder="5"
                      className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg text-lg py-3"
                    />
                  </div>
                </div>

                {/* Auction Date and Time - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-medium text-black dark:text-white mb-2">
                      Auction Date
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                        (Must be in the future)
                      </span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 z-10" />
                      <Input
                        type="date"
                        value={mintForm.auctionDate}
                        min={new Date().toISOString().split('T')[0]} // Prevent past dates
                        onChange={(e) => setMintForm({ ...mintForm, auctionDate: e.target.value })}
                        className="pl-12 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg text-lg py-3"
                        title="Select auction start date"
                      />
                    </div>
                    {/* Date helper text */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      💡 Tip: Click the calendar icon to open date picker
                    </p>
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-black dark:text-white mb-2">
                      Auction Start Time
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                        (24-hour format)
                      </span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 z-10" />
                      <Input
                        type="time"
                        value={mintForm.auctionTime}
                        onChange={(e) => setMintForm({ ...mintForm, auctionTime: e.target.value })}
                        className="pl-12 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg text-lg py-3"
                        title="Select auction start time (24-hour format)"
                        step="60" // Only allow hour/minute selection
                      />
                    </div>
                    {/* Time helper text */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      💡 Tip: Popular times are 12:00, 15:00, 18:00, 20:00
                    </p>
                  </div>
                </div>


                {/* Conflict Warning Display */}
                {mintForm.auctionDate && mintForm.auctionTime && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      ⏰ Auction Schedule Preview
                    </h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p>Start: {new Date(`${mintForm.auctionDate}T${mintForm.auctionTime}`).toLocaleString()}</p>
                      {mintForm.duration && mintForm.durationMode === "quick" && (
                        <p>End: {new Date(new Date(`${mintForm.auctionDate}T${mintForm.auctionTime}`).getTime() +
                          (parseInt(mintForm.duration.replace('h', '')) * 60 * 60 * 1000)).toLocaleString()}</p>
                      )}
                    </div>

                    {/* Real-time conflict checking */}
                    {(() => {
                      const proposedStart = new Date(`${mintForm.auctionDate}T${mintForm.auctionTime}`)
                      const proposedEnd = new Date(proposedStart)

                      if (mintForm.durationMode === "quick" && mintForm.duration) {
                        const hours = parseInt(mintForm.duration.replace('h', ''))
                        proposedEnd.setHours(proposedEnd.getHours() + hours)
                      } else if (mintForm.durationMode === "custom") {
                        const { days, hours, minutes } = mintForm.customDuration
                        const totalMinutes = (parseInt(days || "0") * 24 * 60) + (parseInt(hours || "0") * 60) + parseInt(minutes || "0")
                        proposedEnd.setMinutes(proposedEnd.getMinutes() + totalMinutes)
                      }

                      const conflicts = allAuctions.filter(auction => {
                        const auctionStartMs = auction.startTime.getTime()
                        const auctionEndMs = auction.endTime.getTime()
                        const proposedStartMs = proposedStart.getTime()
                        const proposedEndMs = proposedEnd.getTime()

                        const separatedByBuffer =
                          proposedStartMs >= auctionEndMs + AUCTION_BUFFER_MS ||
                          auctionStartMs >= proposedEndMs + AUCTION_BUFFER_MS

                        return !separatedByBuffer
                      })

                      if (conflicts.length > 0) {
                        return (
                          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700">
                            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                              ⚠️ Time Conflict Detected!
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                              Only 1 auction can run at a time, with a 10-minute buffer after each auction ends.
                            </p>
                            <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                              {conflicts.map(auction => (
                                <div key={auction.id}>
                                  • Conflicts with &quot;{auction.title}&quot; ({auction.startTime.toLocaleDateString()} {auction.startTime.toLocaleTimeString()} - {auction.endTime.toLocaleTimeString()})
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded border border-green-300 dark:border-green-700">
                            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                              ✅ Time slot available!
                            </p>
                          </div>
                        )
                      }
                    })()}
                  </div>
                )}

                {/* Auction Duration */}
                <div>
                  <label className="block text-lg font-medium text-black dark:text-white mb-4">Auction Duration</label>

                  {/* Duration Mode Selection */}
                  <div className="flex space-x-2 mb-6">
                    <Button
                      onClick={() => setMintForm({ ...mintForm, durationMode: "quick" })}
                      className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${mintForm.durationMode === "quick"
                        ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000] shadow-lg"
                        : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-900"
                        }`}
                    >
                      Quick Select
                    </Button>
                    <Button
                      onClick={() => setMintForm({ ...mintForm, durationMode: "custom" })}
                      className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${mintForm.durationMode === "custom"
                        ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000] shadow-lg"
                        : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-900"
                        }`}
                    >
                      Custom Duration
                    </Button>
                  </div>

                  {/* Quick Select Duration */}
                  {mintForm.durationMode === "quick" && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <h3 className="text-base font-semibold text-black dark:text-white mb-4">Choose a preset duration:</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: "1h", label: "1 Hour", value: "1h", popular: false },
                          { key: "6h", label: "6 Hours", value: "6h", popular: false },
                          { key: "12h", label: "12 Hours", value: "12h", popular: false },
                          { key: "24h", label: "1 Day", value: "24h", popular: true },
                          { key: "48h", label: "2 Days", value: "48h", popular: true },
                          { key: "72h", label: "3 Days", value: "72h", popular: false },
                        ].map((duration) => (
                          <Button
                            key={duration.key}
                            onClick={() => setMintForm({ ...mintForm, duration: duration.value })}
                            className={`relative p-4 text-center rounded-xl transition-all ${mintForm.duration === duration.value
                              ? "bg-[#000000] dark:bg-white text-white dark:text-[#000000] scale-105 shadow-lg"
                              : "bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white hover:scale-102 hover:shadow-md"
                              }`}
                          >
                            {duration.popular && (
                              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                Popular
                              </span>
                            )}
                            <div className="font-bold text-lg">{duration.label}</div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Duration */}
                  {mintForm.durationMode === "custom" && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <h3 className="text-base font-semibold text-black dark:text-white mb-4">Set precise duration:</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <label className="block text-sm font-medium text-black dark:text-white mb-2">Days</label>
                          <Input
                            type="number"
                            min="0"
                            max="3"
                            value={mintForm.customDuration.days}
                            onChange={(e) => setMintForm({
                              ...mintForm,
                              customDuration: { ...mintForm.customDuration, days: e.target.value }
                            })}
                            placeholder="0"
                            className="w-full text-center bg-white dark:bg-[#000000] border-2 border-black dark:border-white text-black dark:text-white rounded-lg text-xl font-bold py-3"
                          />
                        </div>
                        <div className="text-center">
                          <label className="block text-sm font-medium text-black dark:text-white mb-2">Hours</label>
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={mintForm.customDuration.hours}
                            onChange={(e) => setMintForm({
                              ...mintForm,
                              customDuration: { ...mintForm.customDuration, hours: e.target.value }
                            })}
                            placeholder="0"
                            className="w-full text-center bg-white dark:bg-[#000000] border-2 border-black dark:border-white text-black dark:text-white rounded-lg text-xl font-bold py-3"
                          />
                        </div>
                        <div className="text-center">
                          <label className="block text-sm font-medium text-black dark:text-white mb-2">Minutes</label>
                          <Input
                            type="number"
                            min="1"
                            max="59"
                            value={mintForm.customDuration.minutes}
                            onChange={(e) => setMintForm({
                              ...mintForm,
                              customDuration: { ...mintForm.customDuration, minutes: e.target.value }
                            })}
                            placeholder="1"
                            className="w-full text-center bg-white dark:bg-[#000000] border-2 border-black dark:border-white text-black dark:text-white rounded-lg text-xl font-bold py-3"
                          />
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          💡 <strong>Tip:</strong> Maximum duration is 3 days. Minimum is 1 minute.
                          Popular choices are 1-2 days for high-value pieces.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mint Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleMintSubmit}
                    className="w-full bg-[#000000] dark:bg-white text-white dark:text-[#000000] border-2 border-white dark:border-black hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white rounded-lg py-3 text-lg font-semibold"
                  >
                    ✨ MINT AUCTION
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black dark:text-white">Total Sales</CardTitle>
                  <DollarSign
                    className="h-4 w-4 text-black dark:text-white cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => openDetailedChart("sales")}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{analytics.totalSales}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{analytics.growth.sales} from last period</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black dark:text-white">Total Bids</CardTitle>
                  <Gavel
                    className="h-4 w-4 text-black dark:text-white cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => openDetailedChart("bids")}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{analytics.totalBids}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{analytics.growth.bids} from last period</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black dark:text-white">Total Volume</CardTitle>
                  <TrendingUp
                    className="h-4 w-4 text-black dark:text-white cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => openDetailedChart("volume")}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{analytics.totalVolume}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{analytics.growth.volume} from last period</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black dark:text-white">Active Users</CardTitle>
                  <Activity
                    className="h-4 w-4 text-black dark:text-white cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => openDetailedChart("users")}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{analytics.activeUsers}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{analytics.growth.active} from last period</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black dark:text-white">Joined Users</CardTitle>
                  <UserPlus
                    className="h-4 w-4 text-black dark:text-white cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => openDetailedChart("joined")}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{analytics.joinedUsers}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{analytics.growth.joined} from last period</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black dark:text-white">Live Users</CardTitle>
                  <Eye
                    className="h-4 w-4 text-black dark:text-white cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => openDetailedChart("live")}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{analytics.liveUsers}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{analytics.growth.live}</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Charts Section - NOW DYNAMIC */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-black dark:text-white">Detailed Analytics</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart - Now updates with timeFrame */}
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

                {/* Bid Activity Chart - Now updates with timeFrame */}
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

                {/* User Growth Chart - Now updates with timeFrame */}
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

                {/* Platform Stats - NEW 4th Box */}
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

                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl col-span-2">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-white flex items-center">
                      <Gavel className="h-5 w-5 mr-2" />
                      Recent Auctions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                            <th className={`text-left py-2 px-3 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Auction</th>
                            <th className={`text-left py-2 px-3 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Winner</th>
                            <th className={`text-right py-2 px-3 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Final Price</th>
                            <th className={`text-right py-2 px-3 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Bids</th>
                            <th className={`text-left py-2 px-3 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Mock data - will be replaced with real data */}
                          <tr className={`border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                            <td className={`py-3 px-3 ${isDark ? "text-white" : "text-black"}`}>Abstract Dreams #42</td>
                            <td className={`py-3 px-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>0x1234...5678</td>
                            <td className={`py-3 px-3 text-right font-medium ${isDark ? "text-white" : "text-black"}`}>2.45 ETH</td>
                            <td className={`py-3 px-3 text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}>18</td>
                            <td className="py-3 px-3"><Badge className="bg-green-500 text-white">Settled</Badge></td>
                          </tr>
                          <tr className={`border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                            <td className={`py-3 px-3 ${isDark ? "text-white" : "text-black"}`}>Neon Cityscape</td>
                            <td className={`py-3 px-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>artlover.eth</td>
                            <td className={`py-3 px-3 text-right font-medium ${isDark ? "text-white" : "text-black"}`}>1.89 ETH</td>
                            <td className={`py-3 px-3 text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}>12</td>
                            <td className="py-3 px-3"><Badge className="bg-green-500 text-white">Settled</Badge></td>
                          </tr>
                          <tr className={`border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                            <td className={`py-3 px-3 ${isDark ? "text-white" : "text-black"}`}>Digital Sunset</td>
                            <td className={`py-3 px-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>0x9876...4321</td>
                            <td className={`py-3 px-3 text-right font-medium ${isDark ? "text-white" : "text-black"}`}>3.12 ETH</td>
                            <td className={`py-3 px-3 text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}>24</td>
                            <td className="py-3 px-3"><Badge className="bg-yellow-500 text-black">Pending</Badge></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black dark:text-white">User Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search wallet addresses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card
                  key={user.address}
                  className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-lg font-bold text-black dark:text-white">{user.address}</span>
                          <Badge
                            className={`${user.status === "active"
                              ? "bg-white dark:bg-white text-black border border-black"
                              : "bg-[#000000] dark:bg-[#000000] text-white border border-white"
                              } rounded-lg`}
                          >
                            {user.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Total Bids:</span>
                            <div className="font-bold text-black dark:text-white">{user.totalBids}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Auctions Won:</span>
                            <div className="font-bold text-black dark:text-white flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              {user.auctionsWon}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Total Spent:</span>
                            <div className="font-bold text-black dark:text-white">{user.totalSpent}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Reputation:</span>
                            <div className="font-bold text-black dark:text-white">{user.reputation}%</div>
                          </div>
                        </div>

                        <div className="flex space-x-4 text-xs text-gray-600 dark:text-gray-400">
                          <span>Joined: {user.joinDate}</span>
                          <span>Last Active: {user.lastActive}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => toggleUserStatus(user.address)}
                        className={`${user.status === "active"
                          ? "bg-[#000000] text-white border-2 border-white hover:bg-white hover:text-black hover:border-black"
                          : "bg-white text-black border-2 border-black hover:bg-black hover:text-white hover:border-white"
                          } rounded-lg`}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        {user.status === "active" ? "Blacklist" : "Unblock"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chat Management Tab */}
        {activeTab === "chat" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black dark:text-white">Chat Management</h2>
              <div className="flex space-x-2">
                {selectedHistoryDays.length > 0 && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={exportSelectedHistory}
                      className="bg-[#000000] dark:bg-white text-white dark:text-[#000000] border-2 border-white dark:border-black hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white rounded-lg"
                    >
                      Export Selected ({selectedHistoryDays.length})
                    </Button>
                    <Button
                      onClick={deleteSelectedHistory}
                      className="bg-red-600 text-white hover:bg-red-700 rounded-lg"
                    >
                      Delete Selected ({selectedHistoryDays.length})
                    </Button>
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    placeholder="Search messages, users, keywords..."
                    className="pl-10 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Chat Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-black dark:text-white">1,247</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages (7d)</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-black dark:text-white">89</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Chatters</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-black dark:text-white">12</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Warnings Issued</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-black dark:text-white">3</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Users Restricted</p>
                </CardContent>
              </Card>
            </div>

            {/* Blocked Words Management */}
            <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Blocked Words Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Input
                    value={newBlockedWord}
                    onChange={(e) => setNewBlockedWord(e.target.value)}
                    placeholder="Add new blocked word..."
                    className="flex-1 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg"
                  />
                  <Button
                    onClick={addBlockedWord}
                    className="bg-[#000000] dark:bg-white text-white dark:text-[#000000] border-2 border-white dark:border-black hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white rounded-lg"
                  >
                    Add Word
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blockedWords.map((word: string) => (
                    <Badge key={word} className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-lg">
                      {word}
                      <button onClick={() => removeBlockedWord(word)} className="ml-2 text-red-500 hover:text-red-700">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 7-Day Chat History */}
            <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center justify-between">
                  <span>Chat History (Last 7 Days)</span>
                  {selectedHistoryDays.length > 0 && (
                    <Button
                      onClick={deleteSelectedHistory}
                      className="bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm"
                    >
                      Delete Selected ({selectedHistoryDays.length})
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chatHistory.map((day) => (
                    <div
                      key={day.date}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedHistoryDays.includes(day.date)
                        ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedHistoryDays.includes(day.date)}
                            onChange={() => toggleHistorySelection(day.date)}
                            className="w-4 h-4"
                          />
                          <div onClick={() => viewDayHistory(day.date, day.dayName)} className="flex-1 hover:underline">
                            <div className="font-semibold text-black dark:text-white">
                              {day.date} ({day.dayName})
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {day.messageCount} messages • {day.activeUsers} active users
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {day.warnings > 0 && <span className="text-red-500">{day.warnings} warnings</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Moderation Table */}
            <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">User Moderation History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        <th className="text-left p-3 text-black dark:text-white">User</th>
                        <th className="text-left p-3 text-black dark:text-white">Action</th>
                        <th className="text-left p-3 text-black dark:text-white">Reason</th>
                        <th className="text-left p-3 text-black dark:text-white">Date</th>
                        <th className="text-left p-3 text-black dark:text-white">Status</th>
                        <th className="text-left p-3 text-black dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moderationHistory.map((record) => (
                        <tr key={record.id} className="border-b border-gray-200 dark:border-gray-700">
                          <td className="p-3 font-mono text-sm text-black dark:text-white">{record.userAddress}</td>
                          <td className="p-3">
                            <Badge
                              className={`${record.action === "warned"
                                ? "bg-yellow-500 text-white"
                                : record.action === "restricted"
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-500 text-white"
                                } rounded-lg`}
                            >
                              {record.action}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-700 dark:text-gray-300">{record.reason}</td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{record.date}</td>
                          <td className="p-3">
                            <Badge
                              className={`${record.status === "active" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                } rounded-lg`}
                            >
                              {record.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {record.status === "blacklisted" && (
                              <Button
                                onClick={() => unblacklistUser(record.userAddress)}
                                className="bg-green-600 text-white hover:bg-green-700 rounded-lg text-xs px-3 py-1"
                              >
                                Unblacklist
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Chart Modal */}
      {showDetailedChart && <ChartModal chartType={showDetailedChart} onClose={() => setShowDetailedChart(null)} />}

      {/* Mint Confirmation Modal */}
      {showMintConfirmation && <MintConfirmationModal />}
      {selectedChatDay && (
        <ChatDayModal
          date={selectedChatDay.date}
          dayName={selectedChatDay.dayName}
          onClose={() => setSelectedChatDay(null)}
          isDark={isDark}
        />
      )}

      {/* Floating Chat Button */}
      <ChatButton
        isDark={isDark}
        connectedWallet={connectedWallet || ""}
        isAdmin={true}
        activeAuctionId={null}
        lastEndedAuctionId={null}
        isFinalTenSeconds={false}
      />

      {/* Mint Flow Modal */}
      {showMintFlow && (
        <MintFlowModal
          isOpen={showMintFlow}
          onClose={() => setShowMintFlow(false)}
          isDark={isDark}
          onMintComplete={(tokenId, txHash) => {
            console.log('Minted:', tokenId, txHash)
            setShowMintFlow(false)
          }}
        />
      )}
    </div>
  )
}
