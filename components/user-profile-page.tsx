"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, User, Copy, Check, ExternalLink, TrendingUp, MessageCircle, Trophy, Twitter, Instagram } from "lucide-react"

interface UserProfilePageProps {
    isDark: boolean
    walletAddress: string
    onClose: () => void
    onEditProfile?: () => void
    isOwnProfile?: boolean
}

interface ProfileData {
    wallet: string
    username: string | null
    avatar: string | null
    bio?: string
    twitter?: string
    instagram?: string
    createdAt: string
}

interface UserStats {
    totalBids: number
    auctionsWon: number
    messagesSent: number
}

export default function UserProfilePage({
    isDark,
    walletAddress,
    onClose,
    onEditProfile,
    isOwnProfile = false,
}: UserProfilePageProps) {
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [stats, setStats] = useState<UserStats>({ totalBids: 0, auctionsWon: 0, messagesSent: 0 })
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<"nfts" | "activity">("nfts")

    useEffect(() => {
        // Load profile from localStorage
        const existingUsers = JSON.parse(localStorage.getItem("arpo_users") || "{}")
        const userProfile = existingUsers[walletAddress.toLowerCase()]
        setProfile(userProfile || { wallet: walletAddress, username: null, avatar: null, createdAt: new Date().toISOString() })

        // Load mock stats (will be real data later)
        setStats({
            totalBids: Math.floor(Math.random() * 50),
            auctionsWon: Math.floor(Math.random() * 5),
            messagesSent: Math.floor(Math.random() * 100),
        })
    }, [walletAddress])

    const handleCopyAddress = async () => {
        await navigator.clipboard.writeText(walletAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const shortWallet = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    const displayName = profile?.username || shortWallet

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                className={`relative w-full max-w-lg mx-4 rounded-2xl border-2 shadow-2xl overflow-hidden ${isDark ? "bg-black border-white" : "bg-white border-black"
                    }`}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full ${isDark ? "bg-black/50 text-white hover:bg-white hover:text-black" : "bg-white/50 text-black hover:bg-black hover:text-white"
                        }`}
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header/Banner */}
                <div className={`h-24 ${isDark ? "bg-gradient-to-br from-gray-900 to-black" : "bg-gradient-to-br from-gray-100 to-white"}`} />

                {/* Profile Info */}
                <div className="px-6 -mt-12">
                    {/* Avatar */}
                    <div
                        className={`w-24 h-24 rounded-full border-4 overflow-hidden ${isDark ? "border-black bg-gray-900" : "border-white bg-gray-100"
                            }`}
                    >
                        {profile?.avatar ? (
                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className={`h-12 w-12 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                            </div>
                        )}
                    </div>

                    {/* Name & Wallet */}
                    <div className="mt-4">
                        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                            {displayName}
                        </h2>

                        {/* Bio */}
                        {profile?.bio && (
                            <p className={`mt-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                {profile.bio}
                            </p>
                        )}

                        {/* Socials */}
                        {(profile?.twitter || profile?.instagram) && (
                            <div className="flex gap-3 mt-2">
                                {profile.twitter && (
                                    <span className={`text-xs flex items-center gap-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                        <Twitter className="h-3 w-3" /> {profile.twitter}
                                    </span>
                                )}
                                {profile.instagram && (
                                    <span className={`text-xs flex items-center gap-1 ${isDark ? "text-pink-400" : "text-pink-600"}`}>
                                        <Instagram className="h-3 w-3" /> {profile.instagram}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                            <span className={`font-mono text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {shortWallet}
                            </span>
                            <button
                                onClick={handleCopyAddress}
                                className={`p-1 rounded transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                                    }`}
                                title="Copy address"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                                )}
                            </button>
                            <a
                                href={`https://sepolia.basescan.org/address/${walletAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-1 rounded transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                                    }`}
                                title="View on explorer"
                            >
                                <ExternalLink className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                            </a>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className={`text-center p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                            <div className="flex items-center justify-center mb-1">
                                <TrendingUp className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                            </div>
                            <div className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}>{stats.totalBids}</div>
                            <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Bids</div>
                        </div>
                        <div className={`text-center p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                            <div className="flex items-center justify-center mb-1">
                                <Trophy className={`h-4 w-4 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />
                            </div>
                            <div className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}>{stats.auctionsWon}</div>
                            <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Wins</div>
                        </div>
                        <div className={`text-center p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                            <div className="flex items-center justify-center mb-1">
                                <MessageCircle className={`h-4 w-4 ${isDark ? "text-green-400" : "text-green-600"}`} />
                            </div>
                            <div className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}>{stats.messagesSent}</div>
                            <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Messages</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={`flex gap-4 mt-6 border-b ${isDark ? "border-white/20" : "border-black/20"}`}>
                        <button
                            onClick={() => setActiveTab("nfts")}
                            className={`pb-3 text-sm font-medium transition-colors ${activeTab === "nfts"
                                ? isDark
                                    ? "text-white border-b-2 border-white"
                                    : "text-black border-b-2 border-black"
                                : isDark
                                    ? "text-gray-400 hover:text-white"
                                    : "text-gray-500 hover:text-black"
                                }`}
                        >
                            NFTs Won
                        </button>
                        <button
                            onClick={() => setActiveTab("activity")}
                            className={`pb-3 text-sm font-medium transition-colors ${activeTab === "activity"
                                ? isDark
                                    ? "text-white border-b-2 border-white"
                                    : "text-black border-b-2 border-black"
                                : isDark
                                    ? "text-gray-400 hover:text-white"
                                    : "text-gray-500 hover:text-black"
                                }`}
                        >
                            Activity
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="py-6 min-h-[150px]">
                        {activeTab === "nfts" ? (
                            <div className={`text-center py-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No NFTs won yet</p>
                                <p className="text-sm mt-1">Win an auction to see your collection here</p>
                            </div>
                        ) : (
                            <div className={`text-center py-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No recent activity</p>
                                <p className="text-sm mt-1">Place bids and chat to see activity here</p>
                            </div>
                        )}
                    </div>

                    {/* Edit Profile Button (only for own profile) */}
                    {isOwnProfile && onEditProfile && (
                        <div className="pb-6">
                            <Button
                                onClick={onEditProfile}
                                className={`w-full py-3 border-2 ${isDark
                                    ? "bg-white text-black border-black hover:bg-black hover:text-white hover:border-white"
                                    : "bg-black text-white border-white hover:bg-white hover:text-black hover:border-black"
                                    }`}
                            >
                                Edit Profile
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
