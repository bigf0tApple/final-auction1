// ⚠️ DEMO DATA - PLACEHOLDER FOR TESTING ⚠️
// This file contains placeholder auction data for development and testing purposes.
// Replace this with real auction data when ready for production deployment.

// Shared auction data for consistency across calendar and main page
import { DEFAULT_ACCEPTED_TOKEN, type AcceptedToken } from "../types/accepted-token"

export interface AuctionEvent {
  id: number
  title: string
  artist: string
  startTime: Date
  endTime: Date
  startingBid: string
  status: "upcoming" | "live" | "ended"
  acceptedToken: AcceptedToken
  auctionContractAddress?: string
  description?: string
  category?: string
  royaltyPercent?: number
  teaserImage?: string
  mainImage?: string
}

// 🎯 DEMO AUCTION DATA - 22 Auctions for Testing Calendar & Site Integration
// Current date context: December 17, 2025
// Dates spread across 2025-2026 for realistic testing scenarios

// Helper to create auctions relative to NOW
const now = new Date()
const minutesFromNow = (mins: number) => new Date(now.getTime() + mins * 60 * 1000)

const upcomingAuctionsRaw: Omit<AuctionEvent, "acceptedToken">[] = [
  // 🔴 LIVE TEST AUCTION #1 - 3 minute auction
  {
    id: 900,
    title: "⚡ Quick Test #1",
    artist: "TestCrew",
    startTime: minutesFromNow(-1), // Started 1 min ago
    endTime: minutesFromNow(2), // Ends in 2 mins (3 min total)
    startingBid: "0.01 ETH",
    status: "live" as const,
    description: "3 minute test auction - bid now!",
    category: "Test",
    royaltyPercent: 10
  },
  // 🟡 NEXT UP - Starts at 3 mins, ends at 6 mins
  {
    id: 901,
    title: "⚡ Quick Test #2",
    artist: "TestCrew",
    startTime: minutesFromNow(3),
    endTime: minutesFromNow(6),
    startingBid: "0.02 ETH",
    status: "upcoming" as const,
    description: "Second 3-minute test auction",
    category: "Test",
    royaltyPercent: 10
  },
  // 🟢 THIRD - Starts at 6 mins, ends at 9 mins
  {
    id: 902,
    title: "⚡ Quick Test #3",
    artist: "TestCrew",
    startTime: minutesFromNow(6),
    endTime: minutesFromNow(9),
    startingBid: "0.03 ETH",
    status: "upcoming" as const,
    description: "Third 3-minute test auction",
    category: "Test",
    royaltyPercent: 10
  },
  // 🔵 FOURTH - Starts at 9 mins, ends at 12 mins
  {
    id: 903,
    title: "⚡ Quick Test #4",
    artist: "TestCrew",
    startTime: minutesFromNow(9),
    endTime: minutesFromNow(12),
    startingBid: "0.01 ETH",
    status: "upcoming" as const,
    description: "Fourth 3-minute test auction",
    category: "Test",
    royaltyPercent: 10
  },
  // August 2025 Auctions
  {
    id: 1,
    title: "Abstract Consciousness",
    artist: "VisionaryArt",
    startTime: new Date(2025, 7, 15, 14, 0), // August 15, 2025, 2:00 PM
    endTime: new Date(2025, 7, 17, 16, 0), // August 17, 2025, 4:00 PM
    startingBid: "1.00 ETH",
    status: "upcoming",
    description: "A mesmerizing journey through abstract forms and consciousness",
    category: "Digital Art",
    royaltyPercent: 5
  },
  {
    id: 2,
    title: "Matrix Reality",
    artist: "CyberVision",
    startTime: new Date(2025, 7, 22, 18, 0), // August 22, 2025, 6:00 PM
    endTime: new Date(2025, 7, 24, 20, 0), // August 24, 2025, 8:00 PM
    startingBid: "0.80 ETH",
    status: "upcoming",
    description: "Explore the boundaries between digital and physical reality",
    category: "Cyberpunk",
    royaltyPercent: 7
  },
  {
    id: 3,
    title: "Ocean Wave Dynamics",
    artist: "NatureTech",
    startTime: new Date(2025, 7, 28, 12, 0), // August 28, 2025, 12:00 PM  
    endTime: new Date(2025, 7, 30, 14, 0), // August 30, 2025, 2:00 PM
    startingBid: "1.20 ETH",
    status: "upcoming",
    description: "Dynamic fluid simulations capturing ocean wave patterns",
    category: "Generative",
    royaltyPercent: 6
  },

  // September 2025 Auctions  
  {
    id: 4,
    title: "Neon Dreams",
    artist: "ElectricMind",
    startTime: new Date(2025, 8, 5, 16, 0), // September 5, 2025, 4:00 PM
    endTime: new Date(2025, 8, 7, 18, 0), // September 7, 2025, 6:00 PM
    startingBid: "2.50 ETH",
    status: "upcoming",
    description: "Vibrant neon landscapes in a digital metropolis",
    category: "Cyberpunk",
    royaltyPercent: 8
  },
  {
    id: 5,
    title: "Cosmic Echoes",
    artist: "StarGazer",
    startTime: new Date(2025, 8, 12, 10, 0), // September 12, 2025, 10:00 AM
    endTime: new Date(2025, 8, 14, 12, 0), // September 14, 2025, 12:00 PM
    startingBid: "1.75 ETH",
    status: "upcoming",
    description: "Deep space phenomena rendered in stunning detail",
    category: "Space Art",
    royaltyPercent: 6
  },
  {
    id: 6,
    title: "Urban Synthesis",
    artist: "StreetPixel",
    startTime: new Date(2025, 8, 19, 15, 30), // September 19, 2025, 3:30 PM
    endTime: new Date(2025, 8, 21, 17, 30), // September 21, 2025, 5:30 PM
    startingBid: "0.95 ETH",
    status: "upcoming",
    description: "Street art meets digital synthesis",
    category: "Urban Art",
    royaltyPercent: 4
  },
  {
    id: 7,
    title: "Quantum Fractals",
    artist: "MathArtist",
    startTime: new Date(2025, 8, 26, 13, 0), // September 26, 2025, 1:00 PM
    endTime: new Date(2025, 8, 28, 15, 0), // September 28, 2025, 3:00 PM
    startingBid: "3.20 ETH",
    status: "upcoming",
    description: "Mathematical beauty expressed through quantum mechanics",
    category: "Mathematical Art",
    royaltyPercent: 9
  },

  // October 2025 Auctions
  {
    id: 8,
    title: "Digital Forest",
    artist: "EcoTech",
    startTime: new Date(2025, 9, 3, 11, 0), // October 3, 2025, 11:00 AM
    endTime: new Date(2025, 9, 5, 13, 0), // October 5, 2025, 1:00 PM
    startingBid: "1.40 ETH",
    status: "upcoming",
    description: "Nature reimagined through digital ecosystems",
    category: "Eco Art",
    royaltyPercent: 5
  },
  {
    id: 9,
    title: "Retro Future",
    artist: "TimeMachine",
    startTime: new Date(2025, 9, 10, 19, 0), // October 10, 2025, 7:00 PM
    endTime: new Date(2025, 9, 12, 21, 0), // October 12, 2025, 9:00 PM
    startingBid: "2.10 ETH",
    status: "upcoming",
    description: "80s aesthetics meet futuristic visions",
    category: "Retro Futurism",
    royaltyPercent: 7
  },
  {
    id: 10,
    title: "Crystalline Structures",
    artist: "GeoForm",
    startTime: new Date(2025, 9, 17, 14, 15), // October 17, 2025, 2:15 PM
    endTime: new Date(2025, 9, 19, 16, 15), // October 19, 2025, 4:15 PM
    startingBid: "1.85 ETH",
    status: "upcoming",
    description: "Geometric precision in crystalline formations",
    category: "Geometric Art",
    royaltyPercent: 6
  },
  {
    id: 11,
    title: "AI Consciousness",
    artist: "NeuralNet",
    startTime: new Date(2025, 9, 24, 16, 45), // October 24, 2025, 4:45 PM
    endTime: new Date(2025, 9, 26, 18, 45), // October 26, 2025, 6:45 PM
    startingBid: "4.50 ETH",
    status: "upcoming",
    description: "Exploring the emergence of artificial consciousness",
    category: "AI Art",
    royaltyPercent: 10
  },
  {
    id: 12,
    title: "Biomechanical Fusion",
    artist: "CyberOrg",
    startTime: new Date(2025, 9, 31, 12, 30), // October 31, 2025, 12:30 PM
    endTime: new Date(2025, 10, 2, 14, 30), // November 2, 2025, 2:30 PM
    startingBid: "2.75 ETH",
    status: "upcoming",
    description: "Where biology meets technology",
    category: "Biomechanical",
    royaltyPercent: 8
  },

  // November 2025 Auctions
  {
    id: 13,
    title: "Ethereal Landscapes",
    artist: "DreamWeaver",
    startTime: new Date(2025, 10, 7, 15, 0), // November 7, 2025, 3:00 PM
    endTime: new Date(2025, 10, 9, 17, 0), // November 9, 2025, 5:00 PM
    startingBid: "1.65 ETH",
    status: "upcoming",
    description: "Otherworldly landscapes that defy reality",
    category: "Surreal Art",
    royaltyPercent: 5
  },
  {
    id: 14,
    title: "Data Visualization",
    artist: "InfoGraphic",
    startTime: new Date(2025, 10, 14, 10, 30), // November 14, 2025, 10:30 AM
    endTime: new Date(2025, 10, 16, 12, 30), // November 16, 2025, 12:30 PM
    startingBid: "1.25 ETH",
    status: "upcoming",
    description: "Beautiful patterns emerging from complex data",
    category: "Data Art",
    royaltyPercent: 4
  },
  {
    id: 15,
    title: "Holographic Dreams",
    artist: "LightBender",
    startTime: new Date(2025, 10, 21, 17, 15), // November 21, 2025, 5:15 PM
    endTime: new Date(2025, 10, 23, 19, 15), // November 23, 2025, 7:15 PM
    startingBid: "3.80 ETH",
    status: "upcoming",
    description: "Three-dimensional light sculptures in digital space",
    category: "Holographic Art",
    royaltyPercent: 9
  },
  {
    id: 16,
    title: "Sonic Visualizations",
    artist: "SoundWave",
    startTime: new Date(2025, 10, 28, 13, 45), // November 28, 2025, 1:45 PM
    endTime: new Date(2025, 10, 30, 15, 45), // November 30, 2025, 3:45 PM
    startingBid: "2.30 ETH",
    status: "upcoming",
    description: "Music transformed into visual spectacle",
    category: "Audio Visual",
    royaltyPercent: 7
  },

  // December 2025 Auctions
  {
    id: 17,
    title: "Winter Solstice",
    artist: "SeasonalArt",
    startTime: new Date(2025, 11, 5, 11, 30), // December 5, 2025, 11:30 AM
    endTime: new Date(2025, 11, 7, 13, 30), // December 7, 2025, 1:30 PM
    startingBid: "1.90 ETH",
    status: "upcoming",
    description: "Celebrating the darkest day with brilliant light",
    category: "Seasonal Art",
    royaltyPercent: 6
  },
  {
    id: 18,
    title: "Neural Networks",
    artist: "BrainGrid",
    startTime: new Date(2025, 11, 12, 16, 0), // December 12, 2025, 4:00 PM
    endTime: new Date(2025, 11, 14, 18, 0), // December 14, 2025, 6:00 PM
    startingBid: "2.95 ETH",
    status: "upcoming",
    description: "Visualizing the complexity of neural connections",
    category: "Scientific Art",
    royaltyPercent: 8
  },
  {
    id: 19,
    title: "Digital Alchemy",
    artist: "ModernMage",
    startTime: new Date(2025, 11, 19, 14, 20), // December 19, 2025, 2:20 PM
    endTime: new Date(2025, 11, 21, 16, 20), // December 21, 2025, 4:20 PM
    startingBid: "3.45 ETH",
    status: "upcoming",
    description: "Transforming digital elements into gold",
    category: "Alchemy Art",
    royaltyPercent: 9
  },
  {
    id: 20,
    title: "Year End Reflection",
    artist: "TimeKeeper",
    startTime: new Date(2025, 11, 28, 18, 30), // December 28, 2025, 6:30 PM
    endTime: new Date(2025, 11, 30, 20, 30), // December 30, 2025, 8:30 PM
    startingBid: "5.00 ETH",
    status: "upcoming",
    description: "A contemplative piece marking the end of 2025",
    category: "Conceptual Art",
    royaltyPercent: 10
  },

  // Bonus January 2026 Auctions (for extended testing)
  {
    id: 21,
    title: "New Beginnings",
    artist: "FreshStart",
    startTime: new Date(2026, 0, 8, 12, 0), // January 8, 2026, 12:00 PM
    endTime: new Date(2026, 0, 10, 14, 0), // January 10, 2026, 2:00 PM
    startingBid: "2.20 ETH",
    status: "upcoming",
    description: "Celebrating fresh starts and new possibilities",
    category: "Motivational Art",
    royaltyPercent: 6
  },
  {
    id: 22,
    title: "Quantum Entanglement",
    artist: "QuantumLab",
    startTime: new Date(2026, 0, 15, 15, 45), // January 15, 2026, 3:45 PM
    endTime: new Date(2026, 0, 17, 17, 45), // January 17, 2026, 5:45 PM
    startingBid: "4.20 ETH",
    status: "upcoming",
    description: "Particles dancing across space and time",
    category: "Quantum Art",
    royaltyPercent: 9
  }
]

export const upcomingAuctions: AuctionEvent[] = upcomingAuctionsRaw.map((auction) => ({
  ...auction,
  acceptedToken: DEFAULT_ACCEPTED_TOKEN,
  auctionContractAddress: "",
}))

// Function to calculate time until auction starts
export const getTimeUntilAuction = (startTime: Date, now = new Date()): string => {
  const diff = startTime.getTime() - now.getTime()

  if (diff <= 0) return "Starting now"

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `Starting in ${days}d ${hours % 24}h`
  } else {
    return `Starting in ${hours}h`
  }
}

// Basic time remaining helper for countdowns
export const getTimeRemaining = (target: Date, now = new Date()) => {
  const diffSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
  const days = Math.floor(diffSeconds / 86400)
  const hours = Math.floor((diffSeconds % 86400) / 3600)
  const minutes = Math.floor((diffSeconds % 3600) / 60)
  const seconds = diffSeconds % 60

  return { totalSeconds: diffSeconds, days, hours, minutes, seconds }
}

// Function to get auction status with time that accounts for live/ended states
export const getAuctionStatusWithTime = (
  auction: AuctionEvent,
  now = new Date(),
  activeAuctionId?: number | null,
): string => {
  if (auction.endTime.getTime() <= now.getTime()) {
    return "Ended"
  }

  if (activeAuctionId && auction.id === activeAuctionId) {
    const remaining = getTimeRemaining(auction.endTime, now)
    if (remaining.totalSeconds === 0) return "Ending now"
    if (remaining.days > 0) return `Live - ends in ${remaining.days}d ${remaining.hours}h`
    if (remaining.hours > 0) return `Live - ends in ${remaining.hours}h ${remaining.minutes}m`
    return `Live - ends in ${remaining.minutes}m ${remaining.seconds}s`
  }

  if (auction.startTime.getTime() <= now.getTime()) {
    return "Queued"
  }

  return getTimeUntilAuction(auction.startTime, now)
}

export interface AuctionSchedule {
  activeAuction: AuctionEvent | null
  nextAuction: AuctionEvent | null
  upcomingQueue: AuctionEvent[]
  hasOverlap: boolean
  bufferedNextStart: Date | null
}

// Build a normalized schedule that prevents overlapping active windows.
export const resolveAuctionSchedule = (events: AuctionEvent[], now = new Date()): AuctionSchedule => {
  const BUFFER_MS = 10 * 60 * 1000
  const sorted = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  const hasOverlap = sorted.some((event, index) => {
    if (index === 0) return false
    const prev = sorted[index - 1]
    return event.startTime.getTime() < prev.endTime.getTime() + BUFFER_MS
  })

  const activeAuction =
    sorted.find((event) => event.startTime.getTime() <= now.getTime() && now.getTime() < event.endTime.getTime()) || null

  const lastEnded = [...sorted].filter((event) => event.endTime.getTime() <= now.getTime()).pop() ?? null
  const lastEndTime = activeAuction ? activeAuction.endTime.getTime() : lastEnded?.endTime.getTime() ?? now.getTime()
  const bufferGate = lastEndTime + BUFFER_MS

  const upcomingQueue = sorted.filter((event) => {
    if (activeAuction && event.id === activeAuction.id) return false
    return event.startTime.getTime() > now.getTime()
  })

  const nextAuction = upcomingQueue[0] ?? null
  const bufferedNextStart = nextAuction ? new Date(Math.max(nextAuction.startTime.getTime(), bufferGate)) : null

  return { activeAuction, nextAuction, upcomingQueue, hasOverlap, bufferedNextStart }
}

// Current live auction data with launch price for Max Pain modal
export const currentLiveAuction = {
  launchPrice: 1.1000, // Dynamic auction data source
}
