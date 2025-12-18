"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Users, ArrowUp, LogOut, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface UserBid {
  id: string
  amount: number
  timestamp: number
  isLeading: boolean
  position: number
  canWithdraw: boolean
  type: '1%' | '10%' | 'MAX_PAIN'
}

interface BidPoolManagerProps {
  userAddress?: string
  userBids: UserBid[]
  currentLeader: string
  totalParticipants: number
  userPoolTotal: number
  maxPainLimit?: number
  onWithdraw: (bidId: string) => Promise<boolean>
  onWithdrawAll: () => Promise<boolean>
  onAddToBid: (type: '1%' | '10%') => void
}

export default function BidPoolManager({
  userAddress,
  userBids,
  currentLeader,
  totalParticipants,
  userPoolTotal,
  maxPainLimit,
  onWithdraw,
  onWithdrawAll,
  onAddToBid
}: BidPoolManagerProps) {
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const [showAllBids, setShowAllBids] = useState(false)
  
  const isUserLeading = userAddress === currentLeader
  const leadingBid = userBids.find(bid => bid.isLeading)
  const withdrawableBids = userBids.filter(bid => bid.canWithdraw)

  const handleWithdraw = async (bidId: string) => {
    setWithdrawing(bidId)
    try {
      const success = await onWithdraw(bidId)
      if (success) {
        toast.success('Bid withdrawn successfully')
      } else {
        toast.error('Failed to withdraw bid')
      }
    } catch {
      toast.error('Withdrawal failed')
    } finally {
      setWithdrawing(null)
    }
  }

  const handleWithdrawAll = async () => {
    setWithdrawing('all')
    try {
      const success = await onWithdrawAll()
      if (success) {
        toast.success('All eligible bids withdrawn')
      } else {
        toast.error('Failed to withdraw all bids')
      }
    } catch {
      toast.error('Failed to withdraw all bids')
    } finally {
      setWithdrawing(null)
    }
  }

  if (!userAddress || userBids.length === 0) {
    return null
  }

  return (
    <Card className="border-2">
      <CardContent className="p-4 space-y-4">
        {/* User Status Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={isUserLeading ? "default" : "secondary"}>
                {isUserLeading ? '🏆 Leading' : `#${leadingBid?.position || '?'}`}
              </Badge>
              <Badge variant="outline">
                <Users className="w-3 h-3 mr-1" />
                {totalParticipants} bidders
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Pool total: <span className="font-medium">{userPoolTotal.toFixed(4)} ETH</span>
              {maxPainLimit && (
                <span className="ml-2 text-xs">
                  (MAX: {maxPainLimit.toFixed(4)} ETH)
                </span>
              )}
            </div>
          </div>
          
          {isUserLeading && (
            <div className="text-green-600 text-sm font-medium animate-pulse">
              🏆 You&apos;re winning!
            </div>
          )}
        </div>

        {/* Pool Strategy Summary */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
            <div className="font-medium text-blue-700 dark:text-blue-300">
              {userBids.filter(b => b.type === '1%').length}
            </div>
            <div className="text-blue-600 dark:text-blue-400">1% Bids</div>
          </div>
          <div className="text-center p-2 bg-orange-50 dark:bg-orange-950 rounded">
            <div className="font-medium text-orange-700 dark:text-orange-300">
              {userBids.filter(b => b.type === '10%').length}
            </div>
            <div className="text-orange-600 dark:text-orange-400">10% Bids</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded">
            <div className="font-medium text-red-700 dark:text-red-300">
              {userBids.filter(b => b.type === 'MAX_PAIN').length > 0 ? '1' : '0'}
            </div>
            <div className="text-red-600 dark:text-red-400">Max Pain</div>
          </div>
        </div>

        {/* Active Bids List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Your Active Bids:</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllBids(!showAllBids)}
              className="h-6 px-2 text-xs"
            >
              {showAllBids ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showAllBids ? 'Hide' : 'Show All'}
            </Button>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {(showAllBids ? userBids : userBids.slice(0, 3)).map((bid) => (
              <div
                key={bid.id}
                className={`flex items-center justify-between p-2 rounded border text-sm ${
                  bid.isLeading 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2">
                  {bid.isLeading && <ArrowUp className="w-3 h-3 text-green-600" />}
                  <span className="font-medium">{bid.amount.toFixed(4)} ETH</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      bid.type === '1%' ? 'border-blue-500 text-blue-600' :
                      bid.type === '10%' ? 'border-orange-500 text-orange-600' :
                      'border-red-500 text-red-600'
                    }`}
                  >
                    {bid.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    #{bid.position}
                  </Badge>
                </div>
                
                {bid.canWithdraw && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleWithdraw(bid.id)}
                    disabled={withdrawing === bid.id}
                    className="h-6 px-2 text-xs"
                  >
                    {withdrawing === bid.id ? 'Withdrawing...' : 'Withdraw'}
                  </Button>
                )}
              </div>
            ))}
            
            {!showAllBids && userBids.length > 3 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                +{userBids.length - 3} more bids
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => onAddToBid('1%')}
            size="sm"
            className="text-xs bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
            disabled={!userAddress}
          >
            Add 1%
          </Button>
          
          <Button
            onClick={() => onAddToBid('10%')}
            size="sm"
            className="text-xs bg-orange-600 text-white hover:bg-orange-700 hover:text-white"
            disabled={!userAddress}
          >
            Add 10%
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleWithdrawAll}
            disabled={
              withdrawing === 'all' || 
              withdrawableBids.length === 0
            }
            size="sm"
            className="text-xs"
          >
            <LogOut className="w-3 h-3 mr-1" />
            {withdrawing === 'all' ? 'Withdrawing...' : "I&apos;m Out"}
          </Button>
        </div>

        {/* Warning for non-leading bids */}
        {!isUserLeading && userBids.length > 0 && (
          <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-yellow-800 dark:text-yellow-200 text-xs">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <div>
              <div className="font-medium">Not currently winning</div>
              <div>Your funds are held in contract. You can withdraw non-leading bids or add more to compete.</div>
            </div>
          </div>
        )}

        {/* Leading bid protection notice */}
        {isUserLeading && (
          <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950 rounded text-green-800 dark:text-green-200 text-xs">
            <ArrowUp className="w-4 h-4 mt-0.5" />
            <div>
              <div className="font-medium">You&apos;re winning!</div>
              <div>Cannot withdraw while leading. If someone outbids you, withdrawal will be enabled.</div>
            </div>
          </div>
        )}

        {/* Max Pain Strategy Hint */}
        {userBids.length >= 3 && !maxPainLimit && (
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            💡 <strong>Consider MAX PAIN:</strong> Multiple small bids? Set a maximum limit and let the system auto-bid for you!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
