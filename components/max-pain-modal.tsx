"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { X } from "lucide-react"

interface MaxPainModalProps {
  isOpen: boolean
  onConfirm: (amount: number) => void
  onCancel: () => void
  currentBid: number
  launchPrice: number
  isDark?: boolean
  symbol?: string
}

export function MaxPainModal({
  isOpen,
  onConfirm,
  onCancel,
  currentBid,
  launchPrice,
  isDark = false,
  symbol = "ETH",
}: MaxPainModalProps) {
  const [maxAmount, setMaxAmount] = useState("")
  const [error, setError] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }
    
    checkMobile()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])

  if (!isOpen) return null

  const minimumMaxPain = launchPrice * 2

  const quickOptions = [
    {
      label: "2x Launch",
      value: (launchPrice * 2).toFixed(4),
      description: "Conservative",
      disabled: currentBid >= launchPrice * 2,
    },
    {
      label: "3x Launch", 
      value: (launchPrice * 3).toFixed(4),
      description: "Moderate",
      disabled: currentBid >= launchPrice * 3,
    },
    {
      label: "4x Launch",
      value: (launchPrice * 4).toFixed(4),
      description: "Aggressive",
      disabled: currentBid >= launchPrice * 4,
    },
    {
      label: "5x Launch",
      value: (launchPrice * 5).toFixed(4),
      description: "Maximum",
      disabled: currentBid >= launchPrice * 5,
    },
  ]

  const handleQuickOption = (value: string, disabled: boolean) => {
    if (disabled) return
    setMaxAmount(value)
    setError("")
  }

  const handleConfirm = () => {
    const amount = Number.parseFloat(maxAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (amount <= currentBid) {
      setError(`Max Pain amount must be higher than current bid of ${currentBid.toFixed(4)} ${symbol}`)
      return
    }
    if (amount < minimumMaxPain) {
      setError(`Max Pain amount must be at least 2x launch price (${minimumMaxPain.toFixed(4)} ${symbol})`)
      return
    }
    onConfirm(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          isDark ? "bg-[#000000] border-white" : "bg-white border-black"
        } border rounded-2xl ${isMobile ? 'p-4 max-w-sm' : 'p-6 max-w-md'} w-full mx-4`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>Set MAX PAIN</h3>
          <Button 
            onClick={onCancel} 
            variant="ghost" 
            className="p-2 bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-none"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700">
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-semibold mb-1">MAX PAIN Auto-Bidding System</p>
            <p>
              Automatically outbids others until you reach your maximum threshold. 
              Minimum threshold is 2x launch price.
            </p>
          </div>
        </div>

        {/* Quick Options */}
        <div className="mb-4">
          <p className={`text-sm font-medium ${isDark ? "text-white" : "text-black"} mb-2`}>Quick Options:</p>
          <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {quickOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => handleQuickOption(option.value, option.disabled)}
                disabled={option.disabled}
                className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                  option.disabled
                    ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-600"
                    : maxAmount === option.value
                    ? isDark
                      ? "bg-white text-black border-white"
                      : "bg-black text-white border-black"
                    : isDark
                    ? "bg-[#000000] text-white border-white hover:bg-white hover:text-black"
                    : "bg-white text-black border-black hover:bg-black hover:text-white"
                }`}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-[10px] opacity-80">
                  {option.disabled ? "Price Exceeded" : option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium ${isDark ? "text-white" : "text-black"} mb-2`}>
            Maximum Bid Amount ({symbol})
          </label>
          <Input
            type="number"
            step="0.0001"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className={`${
              isDark ? "bg-[#000000] border-white text-white" : "bg-white border-black text-black"
            } rounded-lg`}
            placeholder="Enter max amount"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <div className="flex justify-between text-xs mt-1">
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>Current bid: {currentBid.toFixed(4)} {symbol}</span>
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>Launch price: {launchPrice.toFixed(4)} {symbol}</span>
          </div>
          <div className="text-xs mt-1 text-center">
            <span className={`font-medium ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
              Minimum: {minimumMaxPain.toFixed(4)} {symbol} (2x Launch)
            </span>
          </div>
        </div>

        {/* Feature descriptions */}
        <div className={`mb-4 text-xs ${isDark ? "text-gray-400" : "text-gray-600"} space-y-1`}>
          <div className="flex items-center space-x-2">
            <span className="text-blue-500">⚡</span>
            <span>Automatically places 1% counter-bids instantly</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-orange-500">🛑</span>
            <span>Stops when threshold reached or someone bids higher</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className={`${isMobile ? 'space-y-3' : 'flex space-x-3'} mb-4`}>
          <Button
            onClick={onCancel}
            variant="outline"
            className={`${isMobile ? 'w-full' : 'flex-1'} bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white hover:border-white dark:hover:bg-white dark:hover:text-black dark:hover:border-black rounded-lg`}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={`${isMobile ? 'w-full' : 'flex-1'} bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white hover:border-white dark:hover:bg-white dark:hover:text-black dark:hover:border-black rounded-lg`}
          >
            <span className="text-red-600 font-bold">Activate MAX PAIN</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
