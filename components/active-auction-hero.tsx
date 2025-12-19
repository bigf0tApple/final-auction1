"use client"

import Image from "next/image"
import { Clock, TrendingUp, Wallet } from "lucide-react"
import { Button } from "./ui/button"

// Define exact shape needed or import types if possible
// For now, we define a compatible subset
interface ActiveAuctionHeroProps {
    isDark: boolean
    displayAuction: any // Relaxed for now to accept AuctionEvent | UpcomingAuction
    auctionState: {
        currentBid: number
        highestBidder?: string
        isEnded?: boolean
        // Add other properties if actually used
    }
    acceptedToken: {
        symbol: string
        decimals: number
    }
    timeLeft: {
        days: number
        hours: number
        minutes: number
        seconds: number
    }
    countdownLabel: string
    connectedWallet: string | null
    connectWallet: () => void
    activeAuction: any
    isDemoMode: boolean
    isFinalTenSeconds: boolean
    getMinBid: () => number
    getMaxBid: () => number
    handleBid: (type: "min" | "max") => void
    pendingBids: { onePercent: boolean; tenPercent: boolean }
    handleMaxPain: () => void
    hasMaxPainActive: boolean
    handleOptOut: () => void
    pendingRefund: string
    rateLimitCooldown: number
}

export default function ActiveAuctionHero({
    isDark,
    displayAuction,
    auctionState,
    acceptedToken,
    timeLeft,
    countdownLabel,
    connectedWallet,
    connectWallet,
    activeAuction,
    isFinalTenSeconds,
    getMinBid,
    getMaxBid,
    handleBid,
    pendingBids,
    handleMaxPain,
    hasMaxPainActive,
    handleOptOut,
    pendingRefund,
    rateLimitCooldown
}: ActiveAuctionHeroProps) {
    return (
        <section className="bg-white dark:bg-[#000000] min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)]">
            <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-8 py-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-center">
                    {/* Artwork Image - Centered and Larger */}
                    <div className="xl:col-span-2 flex justify-center">
                        <div className="relative w-full max-w-3xl h-[500px] sm:h-[600px]">
                            <Image
                                src={displayAuction?.mainImage || "/placeholder.svg?height=700&width=900&text=Digital Dreams: Neon Cityscape"}
                                alt={displayAuction?.title || "Digital Dreams: Neon Cityscape"}
                                fill
                                className="object-cover rounded-xl border border-black dark:border-white"
                                sizes="(max-width: 1280px) 100vw, 1024px"
                                priority
                            />
                        </div>
                    </div>

                    {/* Auction Details - Simplified */}
                    <div className="xl:col-span-1">
                        <div className="bg-white dark:bg-[#000000] rounded-xl p-6 border border-black dark:border-white h-full">
                            {/* Title */}
                            <div className="mb-4">
                                <h1 className="text-2xl font-bold text-black dark:text-white mb-1">
                                    {displayAuction?.title ?? "Awaiting next auction"}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {displayAuction?.artist ? `by ${displayAuction.artist}` : "Schedule pending"}
                                </p>
                            </div>

                            {/* Current Bid */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current bid</p>
                                <p className="text-3xl font-bold text-black dark:text-white">
                                    {auctionState.currentBid.toFixed(2)} {acceptedToken.symbol}
                                </p>
                            </div>

                            {/* Countdown */}
                            <div className="mb-6">
                                <div className="flex items-center justify-center mb-3">
                                    <Clock className="h-4 w-4 mr-2 text-black dark:text-white" />
                                    <span className="text-sm text-black dark:text-white">{countdownLabel}</span>
                                </div>
                                <div className="flex justify-center space-x-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-black dark:text-white">{timeLeft.days.toString().padStart(2, "0")}</div>
                                        <div className="text-xs text-black dark:text-white">Days</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-black dark:text-white">{timeLeft.hours.toString().padStart(2, "0")}</div>
                                        <div className="text-xs text-black dark:text-white">Hours</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-black dark:text-white">{timeLeft.minutes.toString().padStart(2, "0")}</div>
                                        <div className="text-xs text-black dark:text-white">Minutes</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-black dark:text-white">{timeLeft.seconds.toString().padStart(2, "0")}</div>
                                        <div className="text-xs text-black dark:text-white">Seconds</div>
                                    </div>
                                </div>
                            </div>

                            {/* Bidding Buttons */}
                            <div className="space-y-3">
                                {!connectedWallet ? (
                                    <Button
                                        onClick={connectWallet}
                                        variant="auction"
                                        className="w-full py-4 rounded-lg"
                                    >
                                        <Wallet className="h-4 w-4 mr-2" />
                                        Connect Wallet to Bid
                                    </Button>
                                ) : (
                                    <>
                                        {(() => {
                                            const canBid = Boolean(activeAuction?.auctionContractAddress?.trim())

                                            return (
                                                <>
                                                    {/* Wallet connected status */}
                                                    <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                                        Connected: <span className={`font-semibold ${isDark ? "text-white" : "text-black"}`}>
                                                            {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                                                        </span>
                                                    </div>

                                                    {!canBid && (
                                                        <div className={`text-xs text-yellow-600 dark:text-yellow-400`}>
                                                            ⚠️ Bidding unavailable: auction contract not configured
                                                        </div>
                                                    )}
                                                </>
                                            )
                                        })()}

                                        <Button
                                            onClick={() => handleBid("min")}
                                            disabled={Boolean(pendingBids.onePercent) || Boolean(activeAuction && isFinalTenSeconds)}
                                            variant="auction"
                                            className="w-full py-4 rounded-lg disabled:opacity-50"
                                        >
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Min Bid (1%) - {getMinBid().toFixed(2)} {acceptedToken.symbol}
                                            {activeAuction && isFinalTenSeconds && <span className="ml-2 text-xs">Disabled in final 10s</span>}
                                            {pendingBids.onePercent && <span className="ml-2">Processing...</span>}
                                        </Button>

                                        <Button
                                            onClick={() => handleBid("max")}
                                            disabled={pendingBids.tenPercent}
                                            variant="auction"
                                            className="w-full py-4 rounded-lg disabled:opacity-50"
                                        >
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Max Bid (10%) - {getMaxBid().toFixed(2)} {acceptedToken.symbol}
                                            {pendingBids.tenPercent && <span className="ml-2">Confirming...</span>}
                                        </Button>

                                        <Button
                                            onClick={handleMaxPain}
                                            className={`w-full py-4 border-2 ${hasMaxPainActive
                                                ? isDark
                                                    ? "bg-red-600 text-white border-white hover:bg-white hover:text-red-600"
                                                    : "bg-red-600 text-white border-black hover:bg-white hover:text-red-600"
                                                : isDark
                                                    ? "bg-black text-red-500 border-white hover:bg-white hover:text-red-500 hover:border-black"
                                                    : "bg-white text-red-500 border-black hover:bg-black hover:text-red-500 hover:border-white"
                                                }`}
                                        >
                                            <span className="font-bold">
                                                {hasMaxPainActive ? "Cancel MAX PAIN" : "MAX PAIN"}
                                            </span>
                                        </Button>

                                        <Button
                                            onClick={handleOptOut}
                                            variant="auction-secondary"
                                            className="w-full py-4 rounded-lg"
                                        >
                                            {parseFloat(pendingRefund) > 0
                                                ? `Withdraw Funds (${parseFloat(pendingRefund).toFixed(4)} ${acceptedToken.symbol})`
                                                : "I'm Out, Thanks"}
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Rate Limiting Indicator */}
                            {rateLimitCooldown > 0 && (
                                <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                                    Cooldown: {rateLimitCooldown}s
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
