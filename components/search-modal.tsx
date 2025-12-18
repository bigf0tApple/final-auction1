"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, User, Clock } from "lucide-react"
import { searchUsers, searchAuctions, checkSupabaseConnection } from "@/lib/supabase"

interface SearchResult {
    type: "user" | "auction"
    id: string
    title: string
    subtitle: string
    avatar?: string | null
}

interface SearchModalProps {
    isDark: boolean
    onClose: () => void
    onSelectUser?: (wallet: string) => void
    onSelectAuction?: (auctionId: number) => void
}

export default function SearchModal({
    isDark,
    onClose,
    onSelectUser,
    onSelectAuction,
}: SearchModalProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [activeTab, setActiveTab] = useState<"all" | "users" | "auctions">("all")
    const inputRef = useRef<HTMLInputElement>(null)

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([])
            return
        }

        setIsSearching(true)
        const timeoutId = setTimeout(() => {
            performSearch(query)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [query])

    const performSearch = async (searchQuery: string) => {
        const lowerQuery = searchQuery.toLowerCase()
        const searchResults: SearchResult[] = []

        // Check connection
        const isConnected = await checkSupabaseConnection()

        if (isConnected) {
            // Parallel Fetch from Supabase
            try {
                const [users, auctions] = await Promise.all([
                    searchUsers(searchQuery),
                    searchAuctions(searchQuery)
                ])

                // Map Users
                users.forEach(u => {
                    searchResults.push({
                        type: "user",
                        id: u.wallet_address,
                        title: u.username || `${u.wallet_address.slice(0, 6)}...${u.wallet_address.slice(-4)}`,
                        subtitle: u.wallet_address,
                        avatar: u.profile_pic_url
                    })
                })

                // Map Auctions
                auctions.forEach(a => {
                    searchResults.push({
                        type: "auction",
                        id: String(a.id),
                        title: a.title,
                        subtitle: `by ${a.artist_name || 'Unknown'}`
                    })
                })

            } catch (e) {
                console.error("Supabase search failed", e)
            }
        }

        // If no results from Supabase (or not connected), try LocalStorage (Fallback)
        if (searchResults.length === 0) {
            // Search users from localStorage
            try {
                const existingUsers = JSON.parse(localStorage.getItem("arpo_users") || "{}")
                Object.values(existingUsers).forEach((user: unknown) => {
                    const u = user as { wallet: string; username: string | null; avatar: string | null }
                    if (
                        u.username?.toLowerCase().includes(lowerQuery) ||
                        u.wallet.toLowerCase().includes(lowerQuery)
                    ) {
                        // Avoid duplicates if we somehow got some from Supabase
                        if (!searchResults.find(r => r.type === "user" && r.id === u.wallet)) {
                            searchResults.push({
                                type: "user",
                                id: u.wallet,
                                title: u.username || `${u.wallet.slice(0, 6)}...${u.wallet.slice(-4)}`,
                                subtitle: u.wallet,
                                avatar: u.avatar,
                            })
                        }
                    }
                })
            } catch (e) {
                console.error("Error searching local users:", e)
            }

            // Search auctions from localStorage (mock data for now)
            try {
                const auctions = JSON.parse(localStorage.getItem("arpo_auctions") || "[]")
                auctions.forEach((auction: { id: number; title: string; artist: string }) => {
                    if (
                        auction.title?.toLowerCase().includes(lowerQuery) ||
                        auction.artist?.toLowerCase().includes(lowerQuery)
                    ) {
                        if (!searchResults.find(r => r.type === "auction" && r.id === String(auction.id))) {
                            searchResults.push({
                                type: "auction",
                                id: String(auction.id),
                                title: auction.title,
                                subtitle: `by ${auction.artist}`,
                            })
                        }
                    }
                })
            } catch (e) {
                console.error("Error searching local auctions:", e)
            }
        }

        setResults(searchResults)
        setIsSearching(false)
    }

    const filteredResults = results.filter((result) => {
        if (activeTab === "all") return true
        if (activeTab === "users") return result.type === "user"
        if (activeTab === "auctions") return result.type === "auction"
        return true
    })

    const handleResultClick = (result: SearchResult) => {
        if (result.type === "user" && onSelectUser) {
            onSelectUser(result.id)
        } else if (result.type === "auction" && onSelectAuction) {
            onSelectAuction(parseInt(result.id))
        }
        onClose()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className={`relative w-full max-w-xl mx-4 rounded-2xl border-2 shadow-2xl overflow-hidden ${isDark ? "bg-black border-white" : "bg-white border-black"
                    }`}
                onKeyDown={handleKeyDown}
            >
                {/* Search Input */}
                <div className={`flex items-center gap-3 p-4 border-b ${isDark ? "border-white/20" : "border-black/20"}`}>
                    <Search className={`h-5 w-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                    <Input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search users, auctions..."
                        className={`flex-1 border-0 bg-transparent focus-visible:ring-0 text-lg ${isDark ? "text-white placeholder-gray-500" : "text-black placeholder-gray-400"
                            }`}
                    />
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 ${isDark ? "text-white" : "text-black"
                            }`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex gap-2 px-4 py-2 border-b ${isDark ? "border-white/20" : "border-black/20"}`}>
                    {(["all", "users", "auctions"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${activeTab === tab
                                ? isDark
                                    ? "bg-white text-black"
                                    : "bg-black text-white"
                                : isDark
                                    ? "text-gray-400 hover:text-white"
                                    : "text-gray-500 hover:text-black"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                    {query.length < 2 ? (
                        <div className={`p-8 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            Type at least 2 characters to search
                        </div>
                    ) : isSearching ? (
                        <div className={`p-8 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Searching...
                        </div>
                    ) : filteredResults.length === 0 ? (
                        <div className={`p-8 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            No results found for "{query}"
                        </div>
                    ) : (
                        <div className="p-2">
                            {filteredResults.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}-${index}`}
                                    onClick={() => handleResultClick(result)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${isDark
                                        ? "hover:bg-white/10"
                                        : "hover:bg-black/5"
                                        }`}
                                >
                                    {/* Icon/Avatar */}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-100"
                                            }`}
                                    >
                                        {result.avatar ? (
                                            <img src={result.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : result.type === "user" ? (
                                            <User className={`h-5 w-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                                        ) : (
                                            <Clock className={`h-5 w-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 text-left">
                                        <div className={`font-medium ${isDark ? "text-white" : "text-black"}`}>
                                            {result.title}
                                        </div>
                                        <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                            {result.type === "user" ? (
                                                <span className="font-mono">
                                                    {result.subtitle.slice(0, 8)}...{result.subtitle.slice(-6)}
                                                </span>
                                            ) : (
                                                result.subtitle
                                            )}
                                        </div>
                                    </div>

                                    {/* Type badge */}
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${result.type === "user"
                                            ? isDark
                                                ? "bg-blue-500/20 text-blue-300"
                                                : "bg-blue-100 text-blue-700"
                                            : isDark
                                                ? "bg-purple-500/20 text-purple-300"
                                                : "bg-purple-100 text-purple-700"
                                            }`}
                                    >
                                        {result.type}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Keyboard hint */}
                <div className={`px-4 py-2 text-xs border-t ${isDark ? "border-white/20 text-gray-500" : "border-black/20 text-gray-400"}`}>
                    Press <kbd className={`px-1 py-0.5 rounded ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>Esc</kbd> to close
                </div>
            </div>
        </div>
    )
}
