"use client"

import { useState, useEffect } from "react"
import { Trophy, Clock, AlertTriangle } from "lucide-react"
import confetti from "canvas-confetti"

interface AuctionEndingBannerProps {
    secondsRemaining: number
    highestBidder: string | null
    currentBid: number
    tokenSymbol: string
    connectedWallet: string
    isDark: boolean
    onSettleAuction?: () => void
    isAdmin?: boolean
}

export default function AuctionEndingBanner({
    secondsRemaining,
    highestBidder,
    currentBid,
    tokenSymbol,
    connectedWallet,
    isDark,
    onSettleAuction,
    isAdmin = false,
}: AuctionEndingBannerProps) {
    const [hasEnded, setHasEnded] = useState(false)
    const [showWinnerModal, setShowWinnerModal] = useState(false)
    const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false)

    const isWinner = highestBidder?.toLowerCase() === connectedWallet?.toLowerCase()
    const shortBidder = highestBidder
        ? `${highestBidder.slice(0, 6)}...${highestBidder.slice(-4)}`
        : "No bids"

    // Detect auction end
    useEffect(() => {
        if (secondsRemaining <= 0 && !hasEnded && highestBidder) {
            setHasEnded(true)
            setShowWinnerModal(true)

            // Trigger confetti for winner
            if (isWinner && !hasTriggeredConfetti) {
                setHasTriggeredConfetti(true)
                triggerConfetti()
            }
        }
    }, [secondsRemaining, hasEnded, highestBidder, isWinner, hasTriggeredConfetti])

    const triggerConfetti = () => {
        const duration = 3000
        const end = Date.now() + duration

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ["#ffd700", "#ff6b6b", "#4ecdc4"],
            })
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ["#ffd700", "#ff6b6b", "#4ecdc4"],
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        }
        frame()
    }

    // Show ending banner for last 10 seconds
    if (secondsRemaining > 0 && secondsRemaining <= 10) {
        return (
            <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full border-2 shadow-lg animate-pulse ${isDark
                    ? "bg-red-950 border-red-500 text-red-100"
                    : "bg-red-100 border-red-500 text-red-900"
                }`}>
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 animate-bounce" />
                    <span className="font-bold text-lg">
                        AUCTION ENDING IN {secondsRemaining}s!
                    </span>
                    <Clock className="h-5 w-5" />
                </div>
            </div>
        )
    }

    // Show winner modal when auction ends
    if (showWinnerModal && hasEnded) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className={`relative max-w-md mx-4 p-8 rounded-2xl border-2 text-center ${isDark ? "bg-black border-white" : "bg-white border-black"
                    }`}>
                    {/* Trophy icon */}
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? "bg-yellow-500/20" : "bg-yellow-100"
                        }`}>
                        <Trophy className="h-10 w-10 text-yellow-500" />
                    </div>

                    {/* Title */}
                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}>
                        {isWinner ? "🎉 Congratulations!" : "Auction Ended!"}
                    </h2>

                    {/* Winner info */}
                    <p className={`text-lg mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {isWinner
                            ? "You won this auction!"
                            : `Winner: ${shortBidder}`
                        }
                    </p>

                    {/* Winning bid */}
                    <div className={`p-4 rounded-lg mb-6 ${isDark ? "bg-white/10" : "bg-black/5"}`}>
                        <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Winning Bid
                        </div>
                        <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                            {currentBid.toFixed(4)} {tokenSymbol}
                        </div>
                    </div>

                    {/* Settle button (admin only) */}
                    {isAdmin && onSettleAuction && (
                        <button
                            onClick={onSettleAuction}
                            className={`w-full py-3 px-6 rounded-lg font-bold border-2 mb-4 ${isDark
                                    ? "bg-green-500 text-black border-green-400 hover:bg-green-400"
                                    : "bg-green-600 text-white border-green-700 hover:bg-green-500"
                                }`}
                        >
                            Settle Auction & Transfer NFT
                        </button>
                    )}

                    {/* Close button */}
                    <button
                        onClick={() => setShowWinnerModal(false)}
                        className={`text-sm ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    }

    return null
}
