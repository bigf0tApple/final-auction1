"use client"

import { useState, useMemo } from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Badge } from "./ui/badge"
import { X, TrendingUp, TrendingDown, Calendar, User, Hash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import ChatButton from "./chat-button"

interface SoldArtwork {
  id: number
  title: string
  artist: string
  finalPrice: number
  totalBids: number
  soldDate: Date
  category: string
  image: string
  royaltyPercent: number
  buyer: string
}

// DEMO DATA - Placeholder for testing (to be replaced with real data)
const soldArtworks: SoldArtwork[] = [
  {
    id: 1,
    title: "Digital Dreams",
    artist: "CryptoVision",
    finalPrice: 12.5,
    totalBids: 47,
    soldDate: new Date(2025, 0, 15),
    category: "Digital Art",
    image: "/placeholder.jpg",
    royaltyPercent: 5,
    buyer: "0x1234...5678"
  },
  {
    id: 2,
    title: "Abstract Reality",
    artist: "NeonMaster",
    finalPrice: 8.3,
    totalBids: 23,
    soldDate: new Date(2025, 0, 10),
    category: "Abstract",
    image: "/placeholder.jpg",
    royaltyPercent: 7,
    buyer: "0x9876...4321"
  },
  {
    id: 3,
    title: "Cyber Landscape",
    artist: "TechArtist",
    finalPrice: 15.7,
    totalBids: 65,
    soldDate: new Date(2025, 0, 5),
    category: "Cyberpunk",
    image: "/placeholder.jpg",
    royaltyPercent: 6,
    buyer: "0x5555...9999"
  },
  {
    id: 4,
    title: "Ocean Depths",
    artist: "AquaCreator",
    finalPrice: 6.2,
    totalBids: 18,
    soldDate: new Date(2024, 11, 28),
    category: "Nature",
    image: "/placeholder.jpg",
    royaltyPercent: 4,
    buyer: "0x7777...3333"
  },
  {
    id: 5,
    title: "Space Odyssey",
    artist: "CosmicArt",
    finalPrice: 22.1,
    totalBids: 89,
    soldDate: new Date(2024, 11, 20),
    category: "Space",
    image: "/placeholder.jpg",
    royaltyPercent: 8,
    buyer: "0x1111...2222"
  },
  {
    id: 6,
    title: "Urban Pulse",
    artist: "StreetVision",
    finalPrice: 4.8,
    totalBids: 12,
    soldDate: new Date(2024, 11, 15),
    category: "Urban",
    image: "/placeholder.jpg",
    royaltyPercent: 3,
    buyer: "0x4444...6666"
  }
]

type SortOption = "price-high" | "price-low" | "bids-high" | "bids-low" | "recent" | "oldest"

interface AllSoldPageProps {
  onClose: () => void
  isDark: boolean
  connectedWallet?: string
}

export default function AllSoldPage({ onClose, isDark, connectedWallet }: AllSoldPageProps) {
  const [sortBy, setSortBy] = useState<SortOption>("recent")

  const sortedArtworks = useMemo(() => {
    const sorted = [...soldArtworks]

    switch (sortBy) {
      case "price-high":
        return sorted.sort((a, b) => b.finalPrice - a.finalPrice)
      case "price-low":
        return sorted.sort((a, b) => a.finalPrice - b.finalPrice)
      case "bids-high":
        return sorted.sort((a, b) => b.totalBids - a.totalBids)
      case "bids-low":
        return sorted.sort((a, b) => a.totalBids - b.totalBids)
      case "recent":
        return sorted.sort((a, b) => b.soldDate.getTime() - a.soldDate.getTime())
      case "oldest":
        return sorted.sort((a, b) => a.soldDate.getTime() - b.soldDate.getTime())
      default:
        return sorted
    }
  }, [sortBy])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`relative w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border ${isDark ? "bg-[#000000] border-white" : "bg-white border-black"}`}>
        {/* Header */}
        <div className={`border-b ${isDark ? "border-white" : "border-black"} p-4 shrink-0`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                ALL SOLD ARTWORKS
              </h1>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
                Browse all previously sold pieces from ARPO Studio auctions
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className={`p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black ${isDark ? "text-white" : "text-black"}`}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className={`border-b ${isDark ? "border-white" : "border-black"} p-4`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${isDark ? "text-white" : "text-black"}`}>
                Sort by:
              </span>

              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className={`w-48 ${isDark
                  ? "bg-[#000000] border-white text-white hover:bg-white hover:text-black"
                  : "bg-white border-black text-black hover:bg-black hover:text-white"
                  }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-[#000000] border-white" : "bg-white border-black"}>
                  <SelectItem value="price-high" className={isDark ? "text-white hover:bg-white hover:text-black" : "text-black hover:bg-black hover:text-white"}>
                    <div className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-2" />
                      Price High-Low
                    </div>
                  </SelectItem>
                  <SelectItem value="price-low" className={isDark ? "text-white hover:bg-white hover:text-black" : "text-black hover:bg-black hover:text-white"}>
                    <div className="flex items-center">
                      <TrendingDown className="h-3 w-3 mr-2" />
                      Price Low-High
                    </div>
                  </SelectItem>
                  <SelectItem value="bids-high" className={isDark ? "text-white hover:bg-white hover:text-black" : "text-black hover:bg-black hover:text-white"}>
                    <div className="flex items-center">
                      <Hash className="h-3 w-3 mr-2" />
                      Most Bids
                    </div>
                  </SelectItem>
                  <SelectItem value="bids-low" className={isDark ? "text-white hover:bg-white hover:text-black" : "text-black hover:bg-black hover:text-white"}>
                    <div className="flex items-center">
                      <Hash className="h-3 w-3 mr-2" />
                      Least Bids
                    </div>
                  </SelectItem>
                  <SelectItem value="recent" className={isDark ? "text-white hover:bg-white hover:text-black" : "text-black hover:bg-black hover:text-white"}>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      Recent First
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest" className={isDark ? "text-white hover:bg-white hover:text-black" : "text-black hover:bg-black hover:text-white"}>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      Oldest First
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Artworks Grid */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {sortedArtworks.map((artwork) => (
                <Card
                  key={artwork.id}
                  className={`${isDark ? "bg-[#000000] border-white" : "bg-white border-black"
                    } border hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden`}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      fill
                      className="object-cover pointer-events-none"
                      sizes="(max-width: 1024px) 50vw, 20vw"
                    />
                    <Badge
                      className={`absolute top-1 right-1 text-xs ${isDark ? "bg-white text-black" : "bg-black text-white"
                        }`}
                    >
                      SOLD
                    </Badge>
                  </div>

                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-black"} truncate`}>
                        {artwork.title}
                      </h3>

                      <div className="flex items-center space-x-1">
                        <User className={`h-3 w-3 ${isDark ? "text-gray-400" : "text-gray-600"}`} />
                        <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>
                          {artwork.artist}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div>
                          <p className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>
                            {artwork.finalPrice.toFixed(2)} ETH
                          </p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Final Price
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}>
                            {artwork.totalBids}
                          </p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Bids
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-300 dark:border-gray-700">
                        <div className="flex justify-between items-center text-xs">
                          <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                            {formatDate(artwork.soldDate)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {artwork.category}
                          </Badge>
                        </div>

                        <div className={`mt-1 text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          <div className="flex justify-between">
                            <span>Buyer:</span>
                            <span className="font-mono text-xs">{artwork.buyer}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Royalty:</span>
                            <span>{artwork.royaltyPercent}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Statistics Footer */}
            <div className={`mt-8 p-6 rounded-2xl border ${isDark ? "bg-[#000000] border-white" : "bg-white border-black"}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>
                Sales Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                    {soldArtworks.length}
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Total Sold
                  </p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                    {soldArtworks.reduce((sum, artwork) => sum + artwork.finalPrice, 0).toFixed(1)} ETH
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Total Volume
                  </p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                    {(soldArtworks.reduce((sum, artwork) => sum + artwork.finalPrice, 0) / soldArtworks.length).toFixed(2)} ETH
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Average Price
                  </p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                    {soldArtworks.reduce((sum, artwork) => sum + artwork.totalBids, 0)}
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Total Bids
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
