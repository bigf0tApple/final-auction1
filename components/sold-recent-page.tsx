"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { X, ExternalLink, Copy, CheckCheck } from "lucide-react"
import ChatButton from "./chat-button"
import { useChatPinned } from "@/hooks/use-chat-pinned"

interface SoldNFT {
  id: number
  title: string
  artist: string
  finalPrice: number
  totalBids: number
  currentHolder: string
  soldDate: string
  category: string
  imageUrl: string
  description: string
}

interface SoldRecentPageProps {
  onClose: () => void
  isDark: boolean
  connectedWallet?: string
}

export default function SoldRecentPage({ onClose, isDark, connectedWallet }: SoldRecentPageProps) {
  const { isChatPinnedLeft, isChatPinnedRight } = useChatPinned()
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const recentlySoldNFTs: SoldNFT[] = [
    {
      id: 1,
      title: "Cosmic Dreamscape",
      artist: "DigitalVision",
      finalPrice: 2.45,
      totalBids: 23,
      currentHolder: "0x742d35Cc6647C4532E5B4Dc5d0D4E8a5dA9b8c3f",
      soldDate: "2025-07-20",
      imageUrl: "/placeholder.svg?height=400&width=400&text=Cosmic Dreamscape",
      description: "A mesmerizing journey through digital cosmos with vibrant colors and ethereal forms.",
      category: "Digital Art",
    },
    {
      id: 2,
      title: "Urban Symphony",
      artist: "CityBeats",
      finalPrice: 1.89,
      totalBids: 18,
      currentHolder: "0x987d35Cc6647C4532E5B4Dc5d0D4E8a5dA9b8c3f",
      soldDate: "2025-07-18",
      imageUrl: "/placeholder.svg?height=400&width=400&text=Urban Symphony",
      description: "Street art meets digital innovation in this powerful urban composition.",
      category: "Digital Art",
    },
    {
      id: 3,
      title: "Ocean Depths",
      artist: "AquaArt",
      finalPrice: 3.12,
      totalBids: 31,
      currentHolder: "0x456d35Cc6647C4532E5B4Dc5d0D4E8a5dA9b8c3f",
      soldDate: "2025-07-15",
      imageUrl: "/placeholder.svg?height=400&width=400&text=Ocean Depths",
      description: "Underwater scenes captured with stunning digital precision and color depth.",
      category: "Nature",
    },
    {
      id: 4,
      title: "Neon Nights",
      artist: "CyberPixel",
      finalPrice: 4.67,
      totalBids: 42,
      currentHolder: "0x123d35Cc6647C4532E5B4Dc5d0D4E8a5dA9b8c3f",
      soldDate: "2025-07-12",
      imageUrl: "/placeholder.svg?height=400&width=400&text=Neon Nights",
      description: "Cyberpunk aesthetics meet modern digital art in this vibrant piece.",
      category: "Digital Art",
    },
    {
      id: 5,
      title: "Mountain Majesty",
      artist: "PeakVisions",
      finalPrice: 2.78,
      totalBids: 27,
      currentHolder: "0x789d35Cc6647C4532E5B4Dc5d0D4E8a5dA9b8c3f",
      soldDate: "2025-07-10",
      imageUrl: "/placeholder.svg?height=400&width=400&text=Mountain Majesty",
      description: "Majestic mountain landscapes reimagined through digital artistry.",
      category: "Nature",
    },
    {
      id: 6,
      title: "Street Portrait",
      artist: "UrbanLens",
      finalPrice: 1.95,
      totalBids: 15,
      currentHolder: "0x321d35Cc6647C4532E5B4Dc5d0D4E8a5dA9b8c3f",
      soldDate: "2025-07-08",
      imageUrl: "/placeholder.svg?height=400&width=400&text=Street Portrait",
      description: "Raw emotion captured in urban street photography with digital enhancement.",
      category: "Photography",
    }
  ]

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const openEtherscan = (address: string) => {
    window.open(`https://etherscan.io/address/${address}`, "_blank")
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
      isChatPinnedLeft ? 'modal-with-chat-left' : isChatPinnedRight ? 'modal-with-chat-right' : ''
    }`}>
      <div
        className={`${isDark ? "bg-black border-white" : "bg-white border-black"} border-2 rounded-2xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-4 sm:p-6 border-b ${isDark ? "border-white" : "border-black"}`}>
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Recently Sold</h2>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
              Explore completed auctions and their results
            </p>
          </div>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            className="p-2 bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-none text-black dark:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                {recentlySoldNFTs.length}
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Pieces Sold
              </div>
            </div>
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                {recentlySoldNFTs.reduce((sum, nft) => sum + nft.finalPrice, 0).toFixed(1)} ETH
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Total Volume
              </div>
            </div>
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                {recentlySoldNFTs.reduce((sum, nft) => sum + nft.totalBids, 0)}
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Total Bids
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {recentlySoldNFTs.map((nft) => (
              <Card
                key={nft.id}
                className={`${isDark ? "bg-[#000000] border-white" : "bg-white border-black"} border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow`}
              >
                <div className="relative h-48">
                  <Image
                    src={nft.imageUrl || "/placeholder.svg"}
                    alt={nft.title}
                    fill
                    className="object-cover border-b border-black dark:border-white pointer-events-none"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <Badge
                    className={`absolute top-2 right-2 ${
                      isDark ? "bg-white text-black border-black" : "bg-black text-white border-white"
                    }`}
                  >
                    Sold
                  </Badge>
                  <Badge
                    className="absolute top-2 left-2 bg-gray-800 text-white border-gray-600 text-xs"
                  >
                    {nft.category}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-black"} mb-1`}>
                    {nft.title}
                  </h3>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} mb-3`}>
                    by {nft.artist}
                  </p>

                  {/* Sale Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Final Price
                      </span>
                      <span className={`font-bold ${isDark ? "text-white" : "text-black"}`}>
                        {nft.finalPrice} ETH
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Total Bids
                      </span>
                      <span className={`font-medium ${isDark ? "text-white" : "text-black"}`}>
                        {nft.totalBids}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Sold Date
                      </span>
                      <span className={`font-medium ${isDark ? "text-white" : "text-black"}`}>
                        {new Date(nft.soldDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Current Holder */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mb-1`}>
                      Current Holder
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-sm ${isDark ? "text-white" : "text-black"}`}>
                        {formatAddress(nft.currentHolder)}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => copyAddress(nft.currentHolder)}
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6"
                        >
                          {copiedAddress === nft.currentHolder ? (
                            <CheckCheck className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          onClick={() => openEtherscan(nft.currentHolder)}
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Floating Chat Button */}
      <ChatButton 
        isDark={isDark}
        connectedWallet={connectedWallet || ""}
        isAdmin={false}
        activeAuctionId={null}
        lastEndedAuctionId={null}
        isFinalTenSeconds={false}
      />
    </div>
  )
}
