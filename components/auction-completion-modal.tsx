"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Trophy } from "lucide-react"

interface AuctionCompletionModalProps {
  winner: string
  winningBid: number
  totalBidders: number
  onClose: () => void
  isDark: boolean
  isCurrentUser: boolean
  maxPainRefund?: number
}

export default function AuctionCompletionModal({ 
  winner, 
  winningBid, 
  totalBidders: _totalBidders, // Unused parameter, kept for API compatibility
  onClose, 
  isDark, 
  isCurrentUser,
  maxPainRefund 
}: AuctionCompletionModalProps) {

  // Keep compatibility with callers while avoiding lint errors
  void _totalBidders

  useEffect(() => {
    // Auto-close notification after 8 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 8000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div
        className={`${
          isDark ? "bg-[#000000] border-white text-white" : "bg-white border-black text-black"
        } border-2 rounded-xl p-4 shadow-lg`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <Trophy className={`h-5 w-5 mr-2 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />
            <h3 className="font-bold text-lg">Auction Complete!</h3>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark ? "text-white hover:bg-white hover:text-black" : "text-black hover:bg-black hover:text-white"}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Winner Info */}
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">Winner:</p>
            <p className="text-xs font-mono">{winner.slice(0, 6)}...{winner.slice(-4)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium">Winning Bid:</p>
            <p className="text-lg font-bold">{winningBid.toFixed(4)} ETH</p>
          </div>

          {/* Show Max Pain refund if applicable */}
          {isCurrentUser && maxPainRefund && maxPainRefund > 0 && (
            <div className="mt-3 p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <p className="text-xs text-green-800 dark:text-green-200">
                Max Pain refund: {maxPainRefund.toFixed(4)} ETH
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
