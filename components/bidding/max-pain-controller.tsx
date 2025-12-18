"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle, X, Zap, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface MaxPainControllerProps {
  onConfirm: (maxAmount: number) => Promise<boolean>
  onCancel: () => void
  onDeactivate: () => Promise<boolean>
  currentBid: number
  launchPrice: number
  isDark: boolean
  isActive?: boolean
  currentLimit?: number
}

export default function MaxPainController({
  onConfirm,
  onCancel,
  onDeactivate,
  currentBid,
  launchPrice,
  isDark,
  isActive = false,
  currentLimit
}: MaxPainControllerProps) {
  const [maxAmount, setMaxAmount] = useState((launchPrice * 2).toFixed(4))
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const defaultMaxPain = launchPrice * 2 // 100% more than launch price

  const handleConfirm = async () => {
    const amount = parseFloat(maxAmount)

    // Validation
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amount <= currentBid) {
      setError(`Max Pain amount must be higher than current bid of ${currentBid.toFixed(4)} ETH`)
      return
    }

    if (isActive && currentLimit && amount <= currentLimit) {
      setError(`New limit must be higher than current limit of ${currentLimit.toFixed(4)} ETH`)
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const success = await onConfirm(amount)
      if (success) {
        toast.success(`MAX PAIN ${isActive ? 'updated' : 'activated'}: ${amount.toFixed(4)} ETH`)
      } else {
        toast.error('Failed to set MAX PAIN')
      }
    } catch {
      toast.error('Transaction failed')
      setError('Transaction failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeactivate = async () => {
    setIsProcessing(true)
    try {
      const success = await onDeactivate()
      if (success) {
        toast.success('MAX PAIN deactivated')
      } else {
        toast.error('Failed to deactivate MAX PAIN')
      }
    } catch {
      toast.error('Deactivation failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuickSet = (multiplier: number) => {
    const amount = (launchPrice * multiplier).toFixed(4)
    setMaxAmount(amount)
    setError("")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${isDark ? "bg-[#000000] border-white" : "bg-white border-black"
          } border rounded-2xl p-6 max-w-md w-full mx-4`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>
            {isActive ? 'Update MAX PAIN' : 'Set MAX PAIN'}
          </h3>
          <Button onClick={onCancel} variant="ghost" className={`p-1 ${isDark ? "text-white" : "text-black"}`}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Warning */}
        <div
          className={`mb-4 p-3 rounded-lg ${isDark ? "bg-yellow-900 border-yellow-600" : "bg-yellow-50 border-yellow-400"
            } border flex items-start space-x-2`}
        >
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-semibold mb-1">MAX PAIN Auto-Bidding</p>
            <p>
              You will automatically outbid others until you reach your maximum threshold.
              This cannot be undone once activated.
            </p>
          </div>
        </div>

        {/* Current Status */}
        {isActive && currentLimit && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                MAX PAIN Currently Active
              </span>
            </div>
            <div className="text-xs text-red-700 dark:text-red-300">
              Current limit: {currentLimit.toFixed(4)} ETH
            </div>
          </div>
        )}

        {/* Quick Set Options */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2 text-foreground">Quick Options:</div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSet(2)}
              className={`text-xs ${maxAmount === (launchPrice * 2).toFixed(4) ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            >
              2x Launch
              <br />
              <span className="text-xs opacity-75">{(launchPrice * 2).toFixed(4)} ETH</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSet(3)}
              className={`text-xs ${maxAmount === (launchPrice * 3).toFixed(4) ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            >
              3x Launch
              <br />
              <span className="text-xs opacity-75">{(launchPrice * 3).toFixed(4)} ETH</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSet(5)}
              className={`text-xs ${maxAmount === (launchPrice * 5).toFixed(4) ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            >
              5x Launch
              <br />
              <span className="text-xs opacity-75">{(launchPrice * 5).toFixed(4)} ETH</span>
            </Button>
          </div>
        </div>

        {/* Manual Input */}
        <div className="mb-4">
          <label className={`block text-sm font-medium ${isDark ? "text-white" : "text-black"} mb-2`}>
            Maximum Bid Amount (ETH)
          </label>
          <Input
            type="number"
            step="0.0001"
            value={maxAmount}
            onChange={(e) => {
              setMaxAmount(e.target.value)
              setError("")
            }}
            className={`${isDark ? "bg-[#000000] border-white text-white" : "bg-white border-black text-black"
              } rounded-lg`}
            placeholder="Enter max amount"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <div className="flex justify-between items-center mt-1">
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Current bid: {currentBid.toFixed(4)} ETH
            </p>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Launch price: {launchPrice.toFixed(4)} ETH
            </p>
          </div>
        </div>

        {/* Strategy Info */}
        <div className="mb-6 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-blue-500" />
            <span>Automatically places 1% counter-bids instantly</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-orange-500" />
            <span>Stops when threshold reached or someone bids higher</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className={`flex-1 ${isDark
                  ? "bg-[#000000] border-white text-white hover:bg-white hover:text-black"
                  : "bg-white border-black text-black hover:bg-black hover:text-white"
                } rounded-lg`}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`flex-1 ${isDark ? "bg-white text-black border-2 border-black hover:bg-black hover:text-white hover:border-white" : "bg-black text-white border-2 border-white hover:bg-white hover:text-black hover:border-black"
                } rounded-lg`}
            >
              {isProcessing ? 'Processing...' : isActive ? 'Update MAX PAIN' : 'Activate MAX PAIN'}
            </Button>
          </div>

          {/* Deactivate Button (only when active) */}
          {isActive && (
            <Button
              onClick={handleDeactivate}
              variant="destructive"
              disabled={isProcessing}
              className="w-full rounded-lg"
            >
              {isProcessing ? 'Deactivating...' : 'Deactivate MAX PAIN'}
            </Button>
          )}
        </div>

        {/* Default Recommendation */}
        {!isActive && parseFloat(maxAmount) === defaultMaxPain && (
          <div className="mt-3 text-xs text-center text-muted-foreground">
            💡 Default recommendation: 2x launch price ({defaultMaxPain.toFixed(4)} ETH)
          </div>
        )}
      </div>
    </div>
  )
}
