"use client"

import Image from "next/image"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UpcomingAuction {
    id: number
    title: string
    artist: string
    image?: string
    startingBid: string
    status: string
    startTime?: string | Date
    teaserImage?: string
    mainImage?: string
}

interface UpcomingAuctionsProps {
    auctions: UpcomingAuction[]
    onSetReminder: (auction: UpcomingAuction) => void
    isDark: boolean
}

export default function UpcomingAuctions({ auctions, onSetReminder, isDark }: UpcomingAuctionsProps) {
    return (
        <section data-section="upcoming-auctions" className="py-6 sm:py-8 lg:py-12 bg-gray-50 dark:bg-[#000000]">
            <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-8">
                <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-2 sm:mb-4">
                        Upcoming Auctions
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        Don&apos;t miss these exciting upcoming pieces
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {auctions.map((auction) => (
                        <Card
                            key={auction.id}
                            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-[#000000] border-[#000000] dark:border-white rounded-lg sm:rounded-xl lg:rounded-2xl"
                        >
                            <div className="relative h-40 sm:h-48 lg:h-64">
                                <Image
                                    src={auction.teaserImage || auction.mainImage || "/placeholder.svg?height=300&width=400&text=NFT Artwork"}
                                    alt={auction.title}
                                    fill
                                    className="object-cover border-b border-black dark:border-white"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                                <Badge
                                    className={`absolute top-2 right-2 sm:top-3 sm:right-3 rounded-md sm:rounded-lg text-xs ${auction.status.startsWith("Live")
                                        ? "bg-green-500 text-white border-green-600"
                                        : auction.status === "Ended"
                                            ? "bg-gray-500 text-white border-gray-600"
                                            : "bg-black dark:bg-white text-white dark:text-black border border-white dark:border-black"
                                        }`}
                                >
                                    {auction.status}
                                </Badge>
                            </div>
                            <CardContent className="p-3 sm:p-4 lg:p-6">
                                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-black dark:text-white mb-1 sm:mb-2 leading-tight">
                                    {auction.title}
                                </h3>
                                <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">by {auction.artist}</p>

                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Starting Bid</p>
                                        <p className="text-sm sm:text-base lg:text-lg font-bold text-black dark:text-white">{auction.startingBid}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span className="whitespace-nowrap text-[10px] sm:text-xs">{auction.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => onSetReminder(auction)}
                                    className="w-full bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-md sm:rounded-lg text-xs sm:text-sm py-2 sm:py-2.5"
                                >
                                    Set Reminder
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
