"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import DisplayNameModal from "./display-name-modal"
import AuctionChat from "./auction-chat"
import type { AcceptedToken } from "../types/accepted-token"

interface ChatButtonProps {
  isDark: boolean
  connectedWallet: string
  isAdmin: boolean
  activeAuctionId: number | null
  lastEndedAuctionId: number | null
  isFinalTenSeconds: boolean
  acceptedToken?: AcceptedToken
  onchainRecipientAddress?: string
  onConnectWallet?: () => void
}

export default function ChatButton({
  isDark,
  connectedWallet,
  isAdmin,
  activeAuctionId,
  lastEndedAuctionId,
  isFinalTenSeconds,
  acceptedToken,
  onchainRecipientAddress,
  onConnectWallet,
}: ChatButtonProps) {
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [lockedUntil, setLockedUntil] = useState<number>(0)

  // Load display name from localStorage when wallet changes
  useEffect(() => {
    if (connectedWallet) {
      const savedDisplayName = localStorage.getItem(`displayName_${connectedWallet}`)
      const savedLockedUntil = Number(localStorage.getItem(`displayNameLockedUntil_${connectedWallet}`) || "0")
      if (savedDisplayName) {
        setDisplayName(savedDisplayName)
      } else {
        setDisplayName("") // Reset if no saved name
      }

      setLockedUntil(Number.isFinite(savedLockedUntil) ? savedLockedUntil : 0)
    }
  }, [connectedWallet])

  const handleChatClick = () => {
    if (!connectedWallet) {
      // Open wallet connect modal instead of alert
      onConnectWallet?.()
      return
    }

    if (!displayName) {
      setShowDisplayNameModal(true)
    } else {
      setShowChat(true)
    }
  }

  const handleDisplayNameSave = (name: string) => {
    setDisplayName(name)
    setShowDisplayNameModal(false)
    setShowChat(true)
    // Save display name to localStorage
    localStorage.setItem(`displayName_${connectedWallet}`, name)

    const nextLockedUntil = Date.now() + 24 * 60 * 60 * 1000
    setLockedUntil(nextLockedUntil)
    localStorage.setItem(`displayNameLockedUntil_${connectedWallet}`, String(nextLockedUntil))
  }

  const handleRequestDisplayNameChange = () => {
    setShowChat(false)
    setShowDisplayNameModal(true)
  }

  return (
    <>
      {/* Floating Chat Button - moved more to corner */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={handleChatClick}
          className={`w-14 h-14 rounded-full shadow-lg ${isDark ? "bg-white text-black" : "bg-black text-white"
            }`}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Display Name Modal */}
      {showDisplayNameModal && (
        <DisplayNameModal
          connectedWallet={connectedWallet}
          onSave={handleDisplayNameSave}
          onCancel={() => setShowDisplayNameModal(false)}
          isDark={isDark}
          currentName={displayName || undefined}
          lockedUntil={lockedUntil || undefined}
        />
      )}

      {/* Auction Chat */}
      {showChat && (
        <AuctionChat
          displayName={displayName}
          connectedWallet={connectedWallet}
          isAdmin={isAdmin}
          activeAuctionId={activeAuctionId}
          lastEndedAuctionId={lastEndedAuctionId}
          isFinalTenSeconds={isFinalTenSeconds}
          acceptedToken={acceptedToken}
          onchainRecipientAddress={onchainRecipientAddress}
          onRequestDisplayNameChange={handleRequestDisplayNameChange}
          onClose={() => setShowChat(false)}
          isDark={isDark}
        />
      )}
    </>
  )
}
