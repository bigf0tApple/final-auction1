"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, HelpCircle, Send, ChevronDown, Pin, ArrowDown, User, AtSign } from "lucide-react"
import ChatRules from "./chat-rules"
import MentionInput, { renderMessageWithMentions } from "./mention-input"
import { useAuction } from "./auction-context"
import { DEFAULT_ACCEPTED_TOKEN, type AcceptedToken } from "../types/accepted-token"
import { placeBidOnChain, CONTRACTS } from "../lib/contracts"
import {
  getAuctionChat,
  sendChatMessage,
  subscribeToChatMessages,
  checkSupabaseConnection
} from "@/lib/supabase"

interface Message {
  id: string
  user: string
  message: string
  timestamp: Date
  userBadge: string
  badgeColor: string
}

interface AuctionChatProps {
  displayName: string
  connectedWallet: string
  onClose: () => void
  isDark: boolean
  isAdmin: boolean
  activeAuctionId: number | null
  lastEndedAuctionId: number | null
  isFinalTenSeconds: boolean
  onRequestDisplayNameChange?: () => void
  acceptedToken?: AcceptedToken
  onchainRecipientAddress?: string
}

export default function AuctionChat({
  displayName,
  connectedWallet,
  onClose,
  isDark,
  isAdmin,
  activeAuctionId,
  lastEndedAuctionId,
  isFinalTenSeconds,
  onRequestDisplayNameChange,
  acceptedToken = DEFAULT_ACCEPTED_TOKEN,
  onchainRecipientAddress,
}: AuctionChatProps) {
  const { auctionState, placeBid, getMinBid, getMaxBid } = useAuction()
  const [messages, setMessages] = useState<Message[]>([])
  const messagesByAuction = useRef<Record<string, Message[]>>({})
  const previousAuctionId = useRef<number | null>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [showRules, setShowRules] = useState(false)
  const [showQuickBid, setShowQuickBid] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [lastMessageTime, setLastMessageTime] = useState(0)
  const [isRestricted, setIsRestricted] = useState(false)
  const [restrictionTime, setRestrictionTime] = useState(0)
  const [isPinned, setIsPinned] = useState(true) // Always pinned by default (no hover mode)
  const [pinnedSide, setPinnedSide] = useState<"left" | "right">("right")
  const [isMobile, setIsMobile] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showPinDropdown, setShowPinDropdown] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [userDropdown, setUserDropdown] = useState<{ user: string; x: number; y: number } | null>(null)
  const [userWarnings, setUserWarnings] = useState<{ [key: string]: number }>({})
  const [blockedWords, setBlockedWords] = useState<string[]>([
    "spam",
    "scam",
    "hack",
    "private key",
    "phishing",
    "fuck",
    "shit",
    "damn",
  ])
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)

  // Check Supabase connection
  useEffect(() => {
    checkSupabaseConnection().then(setIsSupabaseConnected)
  }, [])

  // Load and Subscribe to Supabase Chat
  useEffect(() => {
    if (!activeAuctionId || !isSupabaseConnected) return

    let channel: any

    const loadChat = async () => {
      const history = await getAuctionChat(activeAuctionId)
      const formattedMessages: Message[] = history.map(msg => ({
        id: msg.id.toString(),
        user: msg.display_name,
        message: msg.message,
        timestamp: new Date(msg.created_at),
        userBadge: "Bidder", // Default for now
        badgeColor: "bg-blue-400"
      }))
      setMessages(formattedMessages)
    }

    loadChat()

    channel = subscribeToChatMessages(activeAuctionId, (newMsg) => {
      // Avoid duplicates if we handled it optimistically? 
      // Current strategy: We don't optimistically add valid messages when connected, we wait for sub.
      setMessages((prev) => {
        // Check if message with this ID already exists
        if (prev.some(m => m.id === newMsg.id.toString())) return prev

        return [...prev, {
          id: newMsg.id.toString(),
          user: newMsg.display_name,
          message: newMsg.message,
          timestamp: new Date(newMsg.created_at),
          userBadge: "Bidder",
          badgeColor: "bg-blue-400"
        }]
      })
      scrollToBottom()
    })

    return () => {
      if (channel) channel.unsubscribe()
    }
  }, [activeAuctionId, isSupabaseConnected])


  // Mock user bid count for badge calculation
  const userBidCount = 15 // This would come from your user data

  const getUserBadge = (bidCount: number) => {
    if (bidCount >= 50)
      return { badge: "Legendary Bidder", color: "border-2 border-black dark:border-white", level: "L6" }
    if (bidCount >= 40) return { badge: "Elite Bidder", color: "bg-purple-500", level: "L5" }
    if (bidCount >= 30) return { badge: "Pro Bidder", color: "bg-yellow-500", level: "L4" }
    if (bidCount >= 20) return { badge: "Active Bidder", color: "bg-orange-500", level: "L3" }
    if (bidCount >= 10) return { badge: "Eager Bidder", color: "bg-lime-500", level: "L2" }
    return { badge: "New Bidder", color: "bg-blue-400", level: "L1" }
  }

  const userBadgeInfo = getUserBadge(userBidCount)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      try {
        if (typeof window !== 'undefined') {
          setIsMobile(window.innerWidth < 768)
          if (window.innerWidth < 768) {
            setIsFullScreen(true)
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Error checking mobile:", error)
        }
      }
    }
    checkMobile()
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Handle body class for pinning
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isPinned) {
        document.body.classList.add(`chat-pinned-${pinnedSide}`)
      } else {
        document.body.classList.remove("chat-pinned-left", "chat-pinned-right")
      }

      return () => {
        document.body.classList.remove("chat-pinned-left", "chat-pinned-right")
      }
    }
  }, [isPinned, pinnedSide])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Rate limiting check
  const checkRateLimit = () => {
    const now = Date.now()
    if (now - lastMessageTime < 1000) {
      setMessageCount((prev) => prev + 1)
      if (messageCount >= 4) {
        setIsRestricted(true)
        setRestrictionTime(10)
        return false
      }
    } else {
      setMessageCount(0)
    }
    setLastMessageTime(now)
    return true
  }

  // Enhanced content filtering with substring matching
  const filterMessage = (message: string) => {
    const lowerMessage = message.toLowerCase()

    // Check against blocked words (substring matching)
    for (const word of blockedWords) {
      if (lowerMessage.includes(word.toLowerCase())) {
        return { allowed: false, blockedWord: word }
      }
    }

    if (message.length > 42) return { allowed: false, reason: "Message too long (42 character limit)" }
    if (message.includes("http")) return { allowed: false, reason: "Links not allowed" }

    return { allowed: true }
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isRestricted) return

    // Check if wallet is connected
    if (!connectedWallet) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        user: "System",
        message: "Please connect your wallet to send messages",
        timestamp: new Date(),
        userBadge: "System",
        badgeColor: "bg-red-500",
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    if (!checkRateLimit()) {
      const rateLimitMessage: Message = {
        id: Date.now().toString(),
        user: "System",
        message: "Rate limit exceeded. Please slow down.",
        timestamp: new Date(),
        userBadge: "System",
        badgeColor: "bg-red-500",
      }
      setMessages((prev) => [...prev, rateLimitMessage])
      return
    }

    const filterResult = filterMessage(inputMessage)
    if (!filterResult.allowed) {
      // Increment user warnings
      const currentWarnings = userWarnings[connectedWallet] || 0
      const newWarnings = currentWarnings + 1
      setUserWarnings((prev) => ({ ...prev, [connectedWallet]: newWarnings }))

      // Show warning to user only (red text)
      const warningMessage: Message = {
        id: Date.now().toString(),
        user: "Warning",
        message: `Message blocked: ${filterResult.blockedWord ? `Contains blocked word "${filterResult.blockedWord}"` : filterResult.reason}. Warning ${newWarnings}/3`,
        timestamp: new Date(),
        userBadge: "Warning",
        badgeColor: "bg-red-500",
      }
      setMessages((prev) => [...prev, warningMessage])

      // Apply restrictions based on warnings
      if (newWarnings >= 3) {
        setIsRestricted(true)
        setRestrictionTime(20) // 20 seconds for 3rd offense
        const restrictionMessage: Message = {
          id: Date.now().toString(),
          user: "System",
          message: "You have been restricted from chatting for 20 seconds due to repeated violations.",
          timestamp: new Date(),
          userBadge: "System",
          badgeColor: "bg-red-500",
        }
        setMessages((prev) => [...prev, restrictionMessage])
      } else if (newWarnings === 2) {
        setIsRestricted(true)
        setRestrictionTime(10) // 10 seconds for 2nd offense
      }

      setInputMessage("")
      return
    }

    // If Supabase is connected, send to DB and let subscription handle UI
    if (isSupabaseConnected && activeAuctionId) {
      sendChatMessage(activeAuctionId, connectedWallet, displayName, inputMessage.trim())
        .catch(err => {
          const errorMessage: Message = {
            id: Date.now().toString(),
            user: "System",
            message: "Failed to send message: " + err.message,
            timestamp: new Date(),
            userBadge: "System",
            badgeColor: "bg-red-500",
          }
          setMessages((prev) => [...prev, errorMessage])
        })
      setInputMessage("")
      return
    }

    // Fallback: Local handling
    const newMessage: Message = {
      id: Date.now().toString(),
      user: displayName,
      message: inputMessage.trim(),
      timestamp: new Date(),
      userBadge: userBadgeInfo.badge,
      badgeColor: userBadgeInfo.color,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickBid = (bidType: "min" | "max") => {
    // Check if wallet is connected before bidding
    if (!connectedWallet) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        user: "System",
        message: "Please connect your wallet to place a bid",
        timestamp: new Date(),
        userBadge: "System",
        badgeColor: "bg-red-500",
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    if (bidType === "min" && isFinalTenSeconds) {
      const warning: Message = {
        id: Date.now().toString(),
        user: "System",
        message: "Final 10 seconds: only 10% bids are accepted.",
        timestamp: new Date(),
        userBadge: "System",
        badgeColor: "bg-red-500",
      }
      setMessages((prev) => [...prev, warning])
      return
    }

    try {
      const bidAmount = bidType === "min" ? getMinBid() : getMaxBid()

      if (!activeAuctionId) {
        throw new Error("No active auction")
      }

      // On-chain bidding
      const pendingMessage: Message = {
        id: Date.now().toString(),
        user: "System",
        message: `Please confirm bid in your wallet: ${bidAmount.toFixed(4)} ${acceptedToken.symbol}...`,
        timestamp: new Date(),
        userBadge: "System",
        badgeColor: "bg-gray-500",
      }
      setMessages((prev) => [...prev, pendingMessage])

      setMessages((prev) => [...prev, pendingMessage])

        ; (async () => {
          try {
            // Check if contracts are configured
            if (!CONTRACTS.auctionHouse) {
              // Demo mode
              placeBid(bidAmount, connectedWallet)
              const demoMessage: Message = {
                id: Date.now().toString(),
                user: "System",
                message: `Demo bid placed: ${bidAmount.toFixed(4)} ${acceptedToken.symbol} (No contract)`,
                timestamp: new Date(),
                userBadge: "System",
                badgeColor: "bg-green-500",
              }
              setMessages((prev) => [...prev, demoMessage])
              return
            }

            if (typeof window === "undefined" || !window.ethereum) throw new Error("No wallet provider found")

            // Get auction ID (must be passed from props or context)
            if (!activeAuctionId) throw new Error("No active auction ID")

            const { hash, wait } = await placeBidOnChain(activeAuctionId, bidAmount.toString())

            const waitingMessage: Message = {
              id: Date.now().toString(),
              user: "System",
              message: `Transaction submitted. Waiting for confirmation...`,
              timestamp: new Date(),
              userBadge: "System",
              badgeColor: "bg-gray-500",
            }
            setMessages((prev) => [...prev, waitingMessage])

            await wait()

            placeBid(bidAmount, connectedWallet)
            const confirmedMessage: Message = {
              id: Date.now().toString(),
              user: "System",
              message: `Bid confirmed: ${bidAmount.toFixed(4)} ${acceptedToken.symbol}`,
              timestamp: new Date(),
              userBadge: "System",
              badgeColor: "bg-green-500",
            }
            setMessages((prev) => [...prev, confirmedMessage])
          } catch (error) {
            const errorMessage: Message = {
              id: Date.now().toString(),
              user: "System",
              message: `Error: ${error instanceof Error ? error.message : "Failed to place bid"}`,
              timestamp: new Date(),
              userBadge: "System",
              badgeColor: "bg-red-500",
            }
            setMessages((prev) => [...prev, errorMessage])
          }
        })()

    } catch (error) {
      // Add system error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        user: "System",
        message: `Error: ${error instanceof Error ? error.message : "Failed to place bid"}`,
        timestamp: new Date(),
        userBadge: "System",
        badgeColor: "bg-red-500",
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  // Restriction countdown
  useEffect(() => {
    if (restrictionTime > 0) {
      const timer = setTimeout(() => {
        setRestrictionTime((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isRestricted && restrictionTime === 0) {
      setIsRestricted(false)
    }
  }, [restrictionTime, isRestricted])

  // Fetch blocked words from localStorage or API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBlockedWords = localStorage.getItem("blockedWords")
        if (savedBlockedWords) {
          setBlockedWords(JSON.parse(savedBlockedWords))
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn('Failed to load blocked words:', error)
        }
      }
    }
  }, [])

  // Reset chat per auction for users while keeping admin history
  useEffect(() => {
    if (previousAuctionId.current && messages.length > 0) {
      messagesByAuction.current[previousAuctionId.current.toString()] = messages
    }

    if (!activeAuctionId) {
      previousAuctionId.current = null
      if (!isAdmin) setMessages([])
      return
    }

    previousAuctionId.current = activeAuctionId
    if (isAdmin && messagesByAuction.current[activeAuctionId.toString()]) {
      setMessages(messagesByAuction.current[activeAuctionId.toString()])
    } else if (!isAdmin) {
      setMessages([])
    }
  }, [activeAuctionId, isAdmin, messages])

  useEffect(() => {
    if (lastEndedAuctionId && !isAdmin) {
      setMessages([])
    }
  }, [lastEndedAuctionId, isAdmin])

  // Scroll detection
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollButton(!isNearBottom)
  }, [])

  // User dropdown handlers
  const handleUsernameClick = (user: string, event: React.MouseEvent) => {
    if (user === "System") return
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setUserDropdown({ user, x: rect.left, y: rect.bottom + 5 })
  }

  const handleMentionUser = (username: string) => {
    setInputMessage(prev => `${prev}@${username} `)
    setUserDropdown(null)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }


  const chatClasses =
    isFullScreen && isMobile
      ? "fixed inset-0 z-50"
      : isPinned
        ? `fixed top-16 ${pinnedSide}-0 bottom-0 z-50 w-80`
        : "fixed bottom-4 right-4 z-50 w-80"

  const chatHeight = isFullScreen && isMobile ? "h-full" : isPinned ? "h-[calc(100vh-64px-128px-8px)]" : "h-[372px]"

  const banner = (
    <div
      className={`chat-banner h-32 w-full ${isDark ? "bg-[#000000] border-white text-white" : "bg-white border-black text-black"} border rounded-2xl overflow-hidden flex items-center justify-center text-xs`}
    >
      Ad Space
    </div>
  )

  return (
    <>
      <div className={`${chatClasses} flex flex-col gap-2`}>
        {banner}
        <div
          className={`${chatHeight} ${isDark ? "bg-[#000000] border-white" : "bg-white border-black"} border rounded-2xl shadow-2xl flex flex-col ${isFullScreen && isMobile ? "rounded-none" : ""}`}
        >
          {/* Header */}
          <div className={`flex justify-between items-center p-4 border-b ${isDark ? "border-white" : "border-black"}`}>
            <h3 className={`font-bold ${isDark ? "text-white" : "text-black"}`}>Auction Chat</h3>
            <div className="flex space-x-2">
              {!isMobile && (
                <div className="relative">
                  <Button onClick={() => setShowPinDropdown(!showPinDropdown)} variant="ghost" className="p-1">
                    <Pin className={`h-4 w-4 ${isDark ? "text-white" : "text-black"}`} />
                  </Button>
                  {showPinDropdown && (
                    <div
                      className={`absolute right-0 top-8 ${isDark ? "bg-[#000000] border-white" : "bg-white border-black"} border rounded-lg shadow-lg z-10 min-w-[120px]`}
                    >
                      <button
                        onClick={() => {
                          setPinnedSide("left")
                          setIsPinned(true)
                          setShowPinDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black ${isDark ? "text-white" : "text-black"}`}
                      >
                        Pin Left
                      </button>
                      <button
                        onClick={() => {
                          setPinnedSide("right")
                          setIsPinned(true)
                          setShowPinDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black ${isDark ? "text-white" : "text-black"}`}
                      >
                        Pin Right
                      </button>
                      <button
                        onClick={() => {
                          setShowPinDropdown(false)
                          onClose()
                        }}
                        className={`w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white`}
                      >
                        Close Chat
                      </button>
                    </div>
                  )}
                </div>
              )}
              {onRequestDisplayNameChange && (
                <Button onClick={onRequestDisplayNameChange} variant="ghost" className="px-2 py-1 text-xs">
                  Name
                </Button>
              )}
              <Button onClick={() => setShowRules(true)} variant="ghost" className="p-1">
                <HelpCircle className={`h-4 w-4 ${isDark ? "text-white" : "text-black"}`} />
              </Button>
              <Button onClick={onClose} variant="ghost" className={`p-1 ${isDark ? "text-white" : "text-black"}`}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-4 overflow-y-auto relative"
          >
            {messages.length === 0 ? (
              <div className="text-center">
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  No messages yet. Start the conversation!
                </p>
                <div className={`mt-4 text-sm font-medium ${isDark ? "text-white" : "text-black"}`}>
                  Current Bid: {auctionState.currentBid.toFixed(2)} {acceptedToken.symbol}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={`${msg.id}-${msg.timestamp.getTime()}`} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          onClick={(e) => handleUsernameClick(msg.user, e)}
                          className={`text-sm font-medium px-2 py-1 rounded-full cursor-pointer transition-all ${msg.badgeColor.includes("border")
                            ? `${msg.badgeColor} ${isDark ? "text-white bg-transparent hover:bg-white/10" : "text-black bg-transparent hover:bg-black/10"}`
                            : `${msg.badgeColor} text-white hover:opacity-80`
                            } ${msg.user !== "System" ? "cursor-pointer" : ""}`}
                        >
                          {msg.user}
                        </span>
                      </div>
                      <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? "text-white" : "text-black"}`}>
                      {renderMessageWithMentions(msg.message, isDark)}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Scroll to bottom button */}
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className={`absolute bottom-2 right-2 p-2 rounded-full shadow-lg transition-all ${isDark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
                  }`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* User Dropdown */}
          {userDropdown && (
            <div
              className={`fixed z-50 rounded-lg shadow-lg border-2 overflow-hidden ${isDark ? "bg-black border-white" : "bg-white border-black"
                }`}
              style={{ left: userDropdown.x, top: userDropdown.y }}
            >
              <button
                onClick={() => {
                  // TODO: Navigate to profile
                  setUserDropdown(null)
                }}
                className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 ${isDark
                  ? "text-white hover:bg-white hover:text-black"
                  : "text-black hover:bg-black hover:text-white"
                  }`}
              >
                <User className="h-4 w-4" />
                View Profile
              </button>
              <button
                onClick={() => handleMentionUser(userDropdown.user)}
                className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 ${isDark
                  ? "text-white hover:bg-white hover:text-black"
                  : "text-black hover:bg-black hover:text-white"
                  }`}
              >
                <AtSign className="h-4 w-4" />
                Mention
              </button>
            </div>
          )}

          {/* Click outside to close dropdown */}
          {userDropdown && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setUserDropdown(null)}
            />
          )}

          {/* Quick Bid Section */}
          <div className={`px-4 py-2 border-t ${isDark ? "border-white" : "border-black"}`}>
            <Button
              onClick={() => setShowQuickBid(!showQuickBid)}
              className={`w-full flex items-center justify-between text-xs py-2 ${isDark
                ? "bg-[#000000] text-white border border-white hover:bg-white hover:text-black"
                : "bg-white text-black border border-black hover:bg-black hover:text-white"
                } rounded-lg`}
            >
              <span>Quick Bid</span>
              <ChevronDown className="h-3 w-3" />
            </Button>

            {showQuickBid && (
              <div className="mt-2 space-y-1">
                <Button
                  onClick={() => handleQuickBid("min")}
                  disabled={!connectedWallet || auctionState.highestBidder === connectedWallet || isFinalTenSeconds}
                  className={`w-full text-xs py-2 ${isDark
                    ? "bg-black border border-white text-white hover:bg-white hover:text-black"
                    : "bg-white border border-black text-black hover:bg-black hover:text-white"
                    } rounded disabled:opacity-50`}
                >
                  Min Bid (1%) - {getMinBid().toFixed(4)} {acceptedToken.symbol}
                </Button>
                <Button
                  onClick={() => handleQuickBid("max")}
                  disabled={!connectedWallet || auctionState.highestBidder === connectedWallet}
                  className={`w-full text-xs py-2 ${isDark
                    ? "bg-black border border-white text-white hover:bg-white hover:text-black"
                    : "bg-white border border-black text-black hover:bg-black hover:text-white"
                    } rounded disabled:opacity-50`}
                >
                  Max Bid (10%) - {getMaxBid().toFixed(4)} {acceptedToken.symbol}
                </Button>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className={`p-4 border-t ${isDark ? "border-white" : "border-black"}`}>
            <div className="flex space-x-2">
              <MentionInput
                value={inputMessage}
                onChange={setInputMessage}
                onKeyPress={handleKeyPress}
                isDark={isDark}
                placeholder={isRestricted ? `Restricted for ${restrictionTime}s` : "Type a message... (use @ to mention)"}
                disabled={isRestricted}
                className={`text-sm ${isDark ? "bg-[#000000] border-white text-white" : "bg-white border-black text-black"} rounded-lg`}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isRestricted}
                className={`${isDark ? "bg-white text-black hover:bg-black hover:text-white" : "bg-black text-white hover:bg-white hover:text-black"} rounded-lg`}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {inputMessage.length}/42 characters
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${userBadgeInfo.color.includes("border")
                  ? `${userBadgeInfo.color} ${isDark ? "text-white bg-transparent" : "text-black bg-transparent"}`
                  : `${userBadgeInfo.color} text-white`
                  }`}
              >
                {userBadgeInfo.badge}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && <ChatRules onClose={() => setShowRules(false)} isDark={isDark} />}
    </>
  )
}
