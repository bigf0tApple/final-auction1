"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import SiteHeader from "@/components/site-header"
import ActiveAuctionHero from "@/components/active-auction-hero"
import UpcomingAuctions from "@/components/upcoming-auctions"
import { Button } from "@/components/ui/button"
import { Wallet, Clock, TrendingUp } from "lucide-react"

import { useAuction } from "../components/auction-context"
import BidNotification from "../components/bid-notification"
import { MaxPainModal } from "../components/max-pain-modal"
import EthereumFix from "../components/ethereum-fix"
import WalletConnectModal from "../components/wallet-connect-modal"
import ReminderModal from "../components/reminder-modal"
import AuctionCalendar from "../components/auction-calendar"

import ChatButton from "../components/chat-button"

import AuctionEndingBanner from "../components/auction-ending-banner"
import TransactionModal from "../components/transaction-modal"
import ToastNotification from "../components/toast-notification"
import { useChatPinned } from "../hooks/use-chat-pinned"
import { useUserProfile } from "../hooks/use-user-profile"
import { useClientAuctions } from "../hooks/use-client-auctions"
import { useNotifications } from "../hooks/use-notifications"
import { DEFAULT_ACCEPTED_TOKEN, type AcceptedToken } from "../types/accepted-token"
import {
  placeBidOnChain,
  settleAuctionOnChain,
  getPendingRefundOnChain,
  claimRefundOnChain,
  formatAddress,
  CONTRACTS
} from "../lib/contracts"
import {
  getAuctionStatusWithTime,
  currentLiveAuction,
  resolveAuctionSchedule,
  getTimeRemaining,
  type AuctionEvent,
} from "../lib/auction-data"

// Dynamic Imports for Performance Optimization
const AdminPanel = dynamic(() => import("./admin-panel"), { ssr: false })
const SoldRecentPage = dynamic(() => import("../components/sold-recent-page"))
const TeamPage = dynamic(() => import("../components/team-page"))
const WhyPage = dynamic(() => import("../components/why-page"))
const ContactPage = dynamic(() => import("../components/contact-page"))
const TermsPage = dynamic(() => import("../components/terms-page"))
const AllSoldPage = dynamic(() => import("../components/all-sold-page"))
const UserProfileModal = dynamic(() => import("../components/user-profile-modal"))
const UserProfilePage = dynamic(() => import("../components/user-profile-page"))
const SearchModal = dynamic(() => import("../components/search-modal"))
const SettingsModal = dynamic(() => import("../components/settings-modal"))

function AuctionSiteContent() {
  const { auctionState, placeBid, setMaxPain, cancelMaxPain, getMinBid, getMaxBid, getUserPool, withdrawFromPool, completeAuction } = useAuction()
  const [isDark, setIsDark] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState("")
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [showMaxPainModal, setShowMaxPainModal] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [selectedAuctionForReminder, setSelectedAuctionForReminder] = useState<{
    id: number;
    title: string;
    artist: string;
    startingBid: string;
    status: string;
  } | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showSoldRecent, setShowSoldRecent] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showAllSold, setShowAllSold] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [viewingProfileWallet, setViewingProfileWallet] = useState<string | null>(null)

  // Transaction modal state
  const [txModal, setTxModal] = useState<{
    isOpen: boolean
    status: "pending" | "confirming" | "success" | "error"
    title: string
    description?: string
    txHash?: string
    errorMessage?: string
  }>({ isOpen: false, status: "pending", title: "" })

  // Enhanced bidding state
  const [pendingBids, setPendingBids] = useState({ onePercent: false, tenPercent: false })
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0)
  const [bidCount, setBidCount] = useState(0)
  const [lastEndedAuctionId, setLastEndedAuctionId] = useState<number | null>(null)
  const [isFinalTenSeconds, setIsFinalTenSeconds] = useState(false)
  const [hasShownFinalTenNotice, setHasShownFinalTenNotice] = useState(false)
  const [pendingRefund, setPendingRefund] = useState<string>("0")

  // 🎮 DEMO MODE - Test credits for testing without real ETH
  const [isDemoMode, setIsDemoMode] = useState(true) // Enable by default for testing
  const [demoCredits, setDemoCredits] = useState(10.0) // Start with 10 ETH worth of credits
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  const [currentTime, setCurrentTime] = useState(() => new Date(0))
  const [activeAuction, setActiveAuction] = useState<AuctionEvent | null>(null)
  const [nextAuction, setNextAuction] = useState<AuctionEvent | null>(null)
  const [upcomingQueue, setUpcomingQueue] = useState<AuctionEvent[]>([])
  const lastCompletedAuctionId = useRef<number | null>(null)
  const hasLoggedOverlap = useRef(false)

  const { isChatPinnedLeft, isChatPinnedRight } = useChatPinned()

  // User profile management
  const {
    profile: userProfile,
    showProfileModal,
    setShowProfileModal,
    isFirstTime: isFirstTimeUser,
    saveProfile,
    getDisplayName,
  } = useUserProfile(connectedWallet)

  // Notifications
  const {
    permission: notificationPermission,
    requestPermission: requestNotificationPermission,
    notifyBidPlaced,
    notifyOutbid,
    notifyWinner,
  } = useNotifications()

  const { allAuctions } = useClientAuctions()

  const acceptedToken: AcceptedToken = activeAuction?.acceptedToken ?? DEFAULT_ACCEPTED_TOKEN


  // Countdown timer state (live auction end or next start)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Countdown timer driven by schedule (live auction end or next start)
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setCurrentTime(now)

      const schedule = resolveAuctionSchedule(allAuctions, now)

      if (schedule.hasOverlap && !hasLoggedOverlap.current && process.env.NODE_ENV !== "production") {
        console.warn("Auction schedule has overlapping start/end times; later auctions are held until the active slot completes.")
        hasLoggedOverlap.current = true
      }

      if (!schedule.hasOverlap && hasLoggedOverlap.current) {
        hasLoggedOverlap.current = false
      }

      if (schedule.activeAuction && lastCompletedAuctionId.current && lastCompletedAuctionId.current !== schedule.activeAuction.id) {
        lastCompletedAuctionId.current = null
      }

      setActiveAuction(schedule.activeAuction)
      setNextAuction(schedule.nextAuction)
      setUpcomingQueue(schedule.upcomingQueue)

      const target = schedule.activeAuction?.endTime ?? schedule.bufferedNextStart ?? schedule.nextAuction?.startTime ?? null

      if (!target) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const remaining = getTimeRemaining(target, now)

      setTimeLeft({
        days: remaining.days,
        hours: remaining.hours,
        minutes: remaining.minutes,
        seconds: remaining.seconds,
      })

      if (
        remaining.totalSeconds === 0 &&
        schedule.activeAuction &&
        lastCompletedAuctionId.current !== schedule.activeAuction.id
      ) {
        lastCompletedAuctionId.current = schedule.activeAuction.id
        setLastEndedAuctionId(schedule.activeAuction.id)

        setNotification({ message: "Auction has ended!", type: "success" })

        completeAuction().then(() => {
          setTimeout(() => {
            const winner = auctionState.highestBidder || "0x1234567890abcdef"
            const winningBid = auctionState.currentBid
            const isWinner = winner === connectedWallet

            const auctionTokenSymbol = schedule.activeAuction?.acceptedToken?.symbol ?? DEFAULT_ACCEPTED_TOKEN.symbol

            let completionMessage = `Auction complete! Winner: ${winner.slice(0, 6)}...${winner.slice(-4)} (${winningBid.toFixed(4)} ${auctionTokenSymbol})`

            if (isWinner) {
              completionMessage = `🏆 Congratulations! You won with ${winningBid.toFixed(4)} ${auctionTokenSymbol}`
            }

            setNotification({
              message: completionMessage,
              type: "success",
            })
          }, 2000)
        })
      }
    }

    const timer = setInterval(tick, 1000)
    tick()

    return () => clearInterval(timer)
  }, [allAuctions, auctionState.currentBid, auctionState.highestBidder, completeAuction, connectedWallet])

  // Track final-10s window and announce once
  useEffect(() => {
    if (!activeAuction) {
      setIsFinalTenSeconds(false)
      setHasShownFinalTenNotice(false)
      return
    }

    const totalSeconds = Math.max(
      0,
      timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds,
    )
    const inFinalTen = totalSeconds > 0 && totalSeconds <= 10
    setIsFinalTenSeconds(inFinalTen)

    if (inFinalTen && !hasShownFinalTenNotice) {
      setHasShownFinalTenNotice(true)
      setNotification({ message: "Only 10% bids are accepted in the final 10 seconds.", type: "error" })
    }
  }, [activeAuction, timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds, hasShownFinalTenNotice])

  // Hydration-safe theme management
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Apply current theme to document
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDark])

  // Load theme preference from localStorage only - NO AUTO WALLET CONNECTION
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('isDark')
      if (savedTheme !== null) {
        try {
          const isDarkTheme = JSON.parse(savedTheme)
          setIsDark(isDarkTheme)
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.warn('Failed to parse theme preference:', error)
          }
        }
      }
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    // Update document element class for global theme detection
    if (typeof window !== 'undefined') {
      if (newIsDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      // Save theme preference to localStorage
      try {
        localStorage.setItem('isDark', JSON.stringify(newIsDark))
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn('Failed to save theme preference:', error)
        }
      }
    }
  }

  const connectWallet = () => {
    setShowWalletModal(true)
  }

  const disconnectWallet = () => {
    setConnectedWallet("")
    // Clear any localStorage data related to wallet to prevent auto-reconnection
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('connectedWallet')
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn('Failed to clear wallet storage:', error)
        }
      }
    }
  }

  const handleWalletConnect = (address: string) => {
    setConnectedWallet(address)
    setShowWalletModal(false)
    // Don't store wallet connection - require manual connection each session
    // Don't show display name modal here - only when user clicks chat
  }

  // Check for pending refunds
  useEffect(() => {
    if (!connectedWallet || !CONTRACTS.auctionHouse) return

    const checkRefund = async () => {
      try {
        const refund = await getPendingRefundOnChain(connectedWallet)
        setPendingRefund(refund)
      } catch (error) {
        console.error("Failed to check refunds:", error)
      }
    }

    checkRefund()
    // Poll for refunds every 10 seconds
    const interval = setInterval(checkRefund, 10000)
    return () => clearInterval(interval)
  }, [connectedWallet])

  // Check if connected wallet is admin
  const isAdmin = connectedWallet === "0xF1Ed4C4cE65B6353B71f2304b3fD7641a436675F"

  // Check if user is highest bidder
  const isHighestBidder = auctionState.highestBidder === connectedWallet

  // Check if user has Max Pain active
  const hasMaxPainActive = Boolean(
    auctionState.maxPainSettings?.isActive && auctionState.maxPainSettings.bidder === connectedWallet
  )

  const displayAuction = activeAuction ?? nextAuction
  const countdownLabel = activeAuction
    ? "Auction ending in"
    : nextAuction
      ? "Next auction starts in"
      : "No scheduled auctions"

  // Use schedule-aware queue for the home "What's next" cards
  const upcomingDisplay = (upcomingQueue.length > 0 ? upcomingQueue : allAuctions).slice(0, 3)

  const upcomingAuctionsWithStatus = upcomingDisplay.map(auction => ({
    ...auction,
    status: getAuctionStatusWithTime(auction, currentTime, activeAuction?.id ?? null)
  }))

  const scrollToUpcoming = () => {
    const upcomingSection = document.querySelector('[data-section="upcoming-auctions"]')
    if (upcomingSection) {
      upcomingSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Enhanced bid handling with optimistic updates and rate limiting
  const handleBid = (bidType: "min" | "max") => {
    if (!connectedWallet) {
      setNotification({ message: "Please connect your wallet to bid", type: "error" })
      return
    }

    // Rate limiting logic
    if (rateLimitCooldown > 0) {
      setNotification({ message: `Please wait ${rateLimitCooldown} seconds before bidding again`, type: "error" })
      return
    }

    if (bidType === "min" && isFinalTenSeconds && activeAuction) {
      setNotification({ message: "Final 10 seconds: only 10% bids are accepted.", type: "error" })
      return
    }

    // Implement progressive rate limiting
    setBidCount(prev => prev + 1)
    if (bidCount >= 3) {
      setRateLimitCooldown(3)
      const cooldownInterval = setInterval(() => {
        setRateLimitCooldown(prev => {
          if (prev <= 1) {
            clearInterval(cooldownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    const amount = bidType === "min" ? getMinBid() : getMaxBid()
    const pendingKey = bidType === "min" ? "onePercent" : "tenPercent"

    // On-chain bidding: requires wallet confirmation
    setPendingBids((prev) => ({ ...prev, [pendingKey]: true }))

    // Show transaction modal
    setTxModal({
      isOpen: true,
      status: "pending",
      title: "Placing Bid",
      description: `Bidding ${amount.toFixed(4)} ${acceptedToken.symbol}`,
    })

      ; (async () => {
        try {
          if (!activeAuction) throw new Error("No active auction to bid on")

          // Check if contracts are configured
          if (!CONTRACTS.auctionHouse || isDemoMode) {
            // Demo mode - use demo credits with simple toast instead of modal
            if (isDemoMode && demoCredits < amount) {
              setToast({ message: `Not enough credits! You have ${demoCredits.toFixed(2)} ETH`, type: "error" })
              setPendingBids((prev) => ({ ...prev, [pendingKey]: false }))
              setTxModal(prev => ({ ...prev, isOpen: false }))
              return
            }

            // Deduct demo credits
            if (isDemoMode) {
              setDemoCredits(prev => prev - amount)
            }

            placeBid(amount, connectedWallet)

            // Close modal and show simple toast
            setTxModal(prev => ({ ...prev, isOpen: false }))
            setToast({ message: `Bid placed: ${amount.toFixed(2)} ${acceptedToken.symbol}`, type: "success" })
            notifyBidPlaced(amount.toFixed(4), acceptedToken.symbol)
            setPendingBids((prev) => ({ ...prev, [pendingKey]: false }))
            return
          }

          // Real on-chain bid using smart contract
          if (typeof window === "undefined" || !window.ethereum) {
            throw new Error("No wallet provider found. Please install MetaMask.")
          }

          // Get auction ID (use activeAuction.id as the on-chain auction ID)
          const auctionId = activeAuction.id

          const { hash, wait } = await placeBidOnChain(auctionId, amount.toString())

          // Update modal to confirming state
          setTxModal(prev => ({
            ...prev,
            status: "confirming",
            txHash: hash,
          }))

          await wait()

          // Update local state after confirmation
          placeBid(amount, connectedWallet)

          // Success
          setTxModal(prev => ({
            ...prev,
            status: "success",
            description: `Bid of ${amount.toFixed(4)} ${acceptedToken.symbol} confirmed!`,
          }))

          // Send browser notification
          notifyBidPlaced(amount.toFixed(4), acceptedToken.symbol)

          setNotification({
            message: `Bid confirmed: ${amount.toFixed(4)} ${acceptedToken.symbol}`,
            type: "success",
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Transaction failed"
          setTxModal(prev => ({
            ...prev,
            status: "error",
            errorMessage,
          }))
          setNotification({
            message: errorMessage,
            type: "error",
          })
        } finally {
          setPendingBids((prev) => ({ ...prev, [pendingKey]: false }))
        }
      })()
  }

  const handleMaxPain = () => {
    if (!connectedWallet) {
      setNotification({ message: "Please connect your wallet to use MAX PAIN", type: "error" })
      return
    }

    if (hasMaxPainActive) {
      // Cancel existing Max Pain
      cancelMaxPain()
      setNotification({ message: "MAX PAIN cancelled", type: "success" })
    } else {
      // Show Max Pain modal
      setShowMaxPainModal(true)
    }
  }

  const handleMaxPainConfirm = (maxAmount: number) => {
    setMaxPain(maxAmount, connectedWallet)
    setShowMaxPainModal(false)
    setNotification({
      message: `MAX PAIN activated up to ${maxAmount.toFixed(2)} ${acceptedToken.symbol}`,
      type: "success",
    })
  }

  const handleOptOut = async () => {
    if (!connectedWallet) {
      setNotification({ message: "Please connect your wallet first", type: "error" })
      return
    }

    if (isHighestBidder) {
      setNotification({ message: "You are the highest bidder and cannot withdraw", type: "error" })
      return
    }

    // Check if user has an active pool or pending refund on-chain
    const userPool = getUserPool(connectedWallet)
    const hasLocalPool = userPool && userPool.isActive
    const hasChainRefund = parseFloat(pendingRefund) > 0

    if (!hasLocalPool && !hasChainRefund) {
      setNotification({ message: "You don't have any funds to withdraw", type: "error" })
      return
    }

    // Cancel MAX PAIN if active
    if (hasMaxPainActive) {
      cancelMaxPain()
    }

    try {
      // 1. Claim on-chain refund if available
      if (hasChainRefund && CONTRACTS.auctionHouse) {
        setTxModal({
          isOpen: true,
          status: "pending",
          title: "Withdrawing Funds",
          description: `Withdrawing ${parseFloat(pendingRefund).toFixed(4)} ${acceptedToken.symbol}...`,
        })

        const { hash } = await claimRefundOnChain()

        setTxModal(prev => ({
          ...prev,
          status: "success",
          txHash: hash,
          description: "Funds withdrawn successfully!",
        }))

        setNotification({
          message: `Funds withdrawn on-chain: ${parseFloat(pendingRefund).toFixed(4)} ${acceptedToken.symbol}`,
          type: "success"
        })
        setPendingRefund("0")
      }

      // 2. Withdraw from local pool (demo mode)
      if (hasLocalPool) {
        const withdrawnAmount = withdrawFromPool(connectedWallet)
        setNotification({
          message: `Successfully withdrew ${withdrawnAmount.toFixed(4)} ${acceptedToken.symbol} from your local pool`,
          type: "success"
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to withdraw"
      setTxModal(prev => ({
        ...prev,
        status: "error",
        errorMessage,
      }))
      setNotification({
        message: errorMessage,
        type: "error"
      })
    }
  }

  const handleSetReminder = (auction: {
    id: number;
    title: string;
    artist: string;
    startingBid: string;
    status: string;
  }) => {
    setSelectedAuctionForReminder(auction)
  }

  if (showAdminPanel) {
    return <AdminPanel onClose={() => setShowAdminPanel(false)} isDark={isDark} toggleTheme={toggleTheme} connectedWallet={connectedWallet} />
  }

  const contentShiftClass = isChatPinnedLeft ? "content-with-chat-left" : isChatPinnedRight ? "content-with-chat-right" : ""

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "dark bg-[#000000]" : "bg-white"}`}>
      {/* Notification */}
      {notification && (
        <BidNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          isDark={isDark}
        />
      )}

      {/* Simple Toast for Bid Confirmations */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={2500}
        />
      )}

      {/* Enhanced Max Pain Modal */}
      {showMaxPainModal && (
        <MaxPainModal
          isOpen={showMaxPainModal}
          onConfirm={handleMaxPainConfirm}
          onCancel={() => setShowMaxPainModal(false)}
          currentBid={auctionState.currentBid}
          launchPrice={currentLiveAuction.launchPrice}
          isDark={isDark}
          symbol={acceptedToken.symbol}
        />
      )}

      {/* Header */}
      <SiteHeader
        isDark={isDark}
        toggleTheme={toggleTheme}
        isAdmin={isAdmin}
        connectedWallet={connectedWallet}
        userProfile={userProfile}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        onOpenAdmin={() => setShowAdminPanel(true)}
        onOpenSoldRecent={() => setShowSoldRecent(true)}
        onOpenAllSold={() => setShowAllSold(true)}
        onOpenCalendar={() => setShowCalendar(true)}
        onScrollToUpcoming={scrollToUpcoming}
        onOpenTeam={() => setShowTeam(true)}
        onOpenWhy={() => setShowWhy(true)}
        onOpenContact={() => setShowContact(true)}
        onOpenTerms={() => setShowTerms(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      <div className={contentShiftClass}>

        {/* 🎮 Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-center sticky top-[56px] sm:top-[64px] z-40">
            <span className="font-bold">🎮 DEMO MODE</span>
            <span className="mx-2">|</span>
            <span>Credits: <span className="font-mono font-bold">{demoCredits.toFixed(4)} ETH</span></span>
            <button
              onClick={() => setDemoCredits(10.0)}
              className="ml-4 px-3 py-0.5 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition"
            >
              🔄 Refill Credits
            </button>
            <button
              onClick={() => setIsDemoMode(false)}
              className="ml-2 px-3 py-0.5 bg-red-500/50 hover:bg-red-500/70 rounded text-sm font-medium transition"
            >
              Exit Demo
            </button>
          </div>
        )}

        {/* Live Auction Section */}
        <ActiveAuctionHero
          isDark={isDark}
          displayAuction={displayAuction}
          auctionState={auctionState}
          acceptedToken={acceptedToken}
          timeLeft={timeLeft}
          countdownLabel={countdownLabel}
          connectedWallet={connectedWallet}
          connectWallet={connectWallet}
          activeAuction={activeAuction}
          isDemoMode={isDemoMode}
          isFinalTenSeconds={isFinalTenSeconds}
          getMinBid={getMinBid}
          getMaxBid={getMaxBid}
          handleBid={handleBid}
          pendingBids={pendingBids}
          handleMaxPain={handleMaxPain}
          hasMaxPainActive={hasMaxPainActive}
          handleOptOut={handleOptOut}
          pendingRefund={pendingRefund}
          rateLimitCooldown={rateLimitCooldown}
        />

        {/* Upcoming Auctions Section */}
        <UpcomingAuctions
          auctions={upcomingAuctionsWithStatus}
          onSetReminder={handleSetReminder}
          isDark={isDark}
        />

        {/* Wallet Connect Modal */}
        {showWalletModal && (
          <WalletConnectModal
            onConnect={handleWalletConnect}
            onCancel={() => setShowWalletModal(false)}
            isDark={isDark}
          />
        )}

        {/* Reminder Modal */}
        {selectedAuctionForReminder && (
          <ReminderModal
            auction={selectedAuctionForReminder}
            onClose={() => setSelectedAuctionForReminder(null)}
            isDark={isDark}
          />
        )}

        {/* Calendar Modal */}
        {showCalendar && (
          <AuctionCalendar
            onClose={() => setShowCalendar(false)}
            isDark={isDark}
          />
        )}

        {/* Sold Recent Modal */}
        {showSoldRecent && (
          <SoldRecentPage
            onClose={() => setShowSoldRecent(false)}
            isDark={isDark}
            connectedWallet={connectedWallet}
          />
        )}

        {/* Team Modal */}
        {showTeam && (
          <TeamPage
            onClose={() => setShowTeam(false)}
            isDark={isDark}
          />
        )}

        {/* Why Modal */}
        {showWhy && (
          <WhyPage
            onClose={() => setShowWhy(false)}
            isDark={isDark}
          />
        )}

        {/* Contact Modal */}
        {showContact && (
          <ContactPage
            onClose={() => setShowContact(false)}
            isDark={isDark}
          />
        )}

        {/* Terms Modal */}
        {showTerms && (
          <TermsPage
            onClose={() => setShowTerms(false)}
            isDark={isDark}
          />
        )}

        {/* All Sold Modal */}
        {showAllSold && (
          <AllSoldPage
            onClose={() => setShowAllSold(false)}
            isDark={isDark}
            connectedWallet={connectedWallet}
          />
        )}

      </div>

      {/* Auction Ending Banner */}
      {activeAuction && isFinalTenSeconds && (
        <AuctionEndingBanner
          secondsRemaining={timeLeft.seconds}
          highestBidder={auctionState.highestBidder}
          currentBid={auctionState.currentBid}
          tokenSymbol={acceptedToken.symbol}
          connectedWallet={connectedWallet}
          isDark={isDark}
          isAdmin={isAdmin}
          onSettleAuction={async () => {
            if (!activeAuction) return

            try {
              if (!CONTRACTS.auctionHouse) {
                // Demo mode
                completeAuction()
                setNotification({ message: "Demo: Auction settled!", type: "success" })
                return
              }

              setTxModal({
                isOpen: true,
                status: "pending",
                title: "Settling Auction",
                description: "Transferring NFT to winner and ETH to artist...",
              })

              const { hash } = await settleAuctionOnChain(activeAuction.id)

              setTxModal(prev => ({
                ...prev,
                status: "success",
                txHash: hash,
                description: "Auction settled successfully!",
              }))

              completeAuction()
              setNotification({ message: "Auction settled on-chain!", type: "success" })
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Settlement failed"
              setTxModal(prev => ({
                ...prev,
                status: "error",
                errorMessage,
              }))
              setNotification({ message: errorMessage, type: "error" })
            }
          }}
        />
      )}

      {/* Floating Chat Button */}
      <ChatButton
        isDark={isDark}
        connectedWallet={connectedWallet}
        isAdmin={isAdmin}
        activeAuctionId={activeAuction?.id ?? null}
        lastEndedAuctionId={lastEndedAuctionId}
        isFinalTenSeconds={isFinalTenSeconds}
        acceptedToken={acceptedToken}
        onchainRecipientAddress={activeAuction?.auctionContractAddress}
      />

      {/* User Profile Modal */}
      {showProfileModal && connectedWallet && (
        <UserProfileModal
          isDark={isDark}
          connectedWallet={connectedWallet}
          currentUsername={userProfile?.username || ""}
          currentAvatar={userProfile?.avatar || undefined}
          currentBio={userProfile?.bio || ""}
          currentTwitter={userProfile?.twitter || ""}
          currentInstagram={userProfile?.instagram || ""}
          onSave={saveProfile}
          onClose={() => setShowProfileModal(false)}
          isFirstTime={isFirstTimeUser}
        />
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          isDark={isDark}
          onClose={() => setShowSearchModal(false)}
          onSelectUser={(wallet) => {
            setShowSearchModal(false)
            setViewingProfileWallet(wallet)
          }}
        />
      )}

      {/* User Profile Page (viewing another user) */}
      {viewingProfileWallet && (
        <UserProfilePage
          isDark={isDark}
          walletAddress={viewingProfileWallet}
          onClose={() => setViewingProfileWallet(null)}
          isOwnProfile={viewingProfileWallet.toLowerCase() === connectedWallet.toLowerCase()}
          onEditProfile={viewingProfileWallet.toLowerCase() === connectedWallet.toLowerCase() ? () => {
            setViewingProfileWallet(null)
            setShowProfileModal(true)
          } : undefined}
        />
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={txModal.isOpen}
        onClose={() => setTxModal(prev => ({ ...prev, isOpen: false }))}
        isDark={isDark}
        status={txModal.status}
        title={txModal.title}
        description={txModal.description}
        txHash={txModal.txHash}
        errorMessage={txModal.errorMessage}
        onRetry={() => setTxModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onEditProfile={connectedWallet ? () => setShowProfileModal(true) : undefined}
      />
    </div>
  )
}

export default function AuctionSite() {
  return (
    <>
      {/* Prevent "Cannot redefine property: ethereum" errors at runtime */}
      <EthereumFix />
      <AuctionSiteContent />
    </>
  )
}
