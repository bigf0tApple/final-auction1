"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Wallet } from "lucide-react"

interface WalletConnectModalProps {
  onConnect: (address: string) => void
  onCancel: () => void
  isDark: boolean
}

export default function WalletConnectModal({ onConnect, onCancel, isDark }: WalletConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const connectMetaMask = async () => {
    setIsConnecting(true)
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[]
        if (accounts && accounts.length > 0) {
          onConnect(accounts[0])
        }
      } else {
        // Fallback for demo - simulate wallet connection
        const mockWallets = [
          "0xF1Ed4C4cE65B6353B71f2304b3fD7641a436675F", // Admin wallet
          "0x1234567890123456789012345678901234567890",
          "0x9876543210987654321098765432109876543210",
          "0xABCDEF1234567890ABCDEF1234567890ABCDEF12",
        ]
        const randomWallet = mockWallets[Math.floor(Math.random() * mockWallets.length)]
        setTimeout(() => {
          onConnect(randomWallet)
        }, 1000)
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to connect wallet:", error)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const connectWalletConnect = async () => {
    setIsConnecting(true)
    // Simulate WalletConnect
    setTimeout(() => {
      const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)
      onConnect(mockAddress)
      setIsConnecting(false)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${isDark ? "bg-[#000000] border-white" : "bg-white border-black"
          } border rounded-2xl p-4 sm:p-6 max-w-md w-full mx-4`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg sm:text-xl font-bold ${isDark ? "text-white" : "text-black"}`}>Connect Wallet</h3>
          <Button
            onClick={onCancel}
            variant="ghost"
            className={`p-2 bg-transparent border-none ${isDark
                ? "text-white hover:bg-white hover:text-black"
                : "text-black hover:bg-black hover:text-white"
              }`}
          >
            <X className={`h-4 w-4`} />
          </Button>
        </div>

        <div className="space-y-4">
          <Button
            onClick={connectMetaMask}
            disabled={isConnecting}
            className={`w-full flex items-center justify-center space-x-3 py-4 border-2 ${isDark
                ? "bg-white text-black border-black hover:bg-black hover:text-white hover:border-white"
                : "bg-black text-white border-white hover:bg-white hover:text-black hover:border-black"
              } rounded-lg`}
          >
            <Wallet className="h-5 w-5" />
            <span>{isConnecting ? "Connecting..." : "MetaMask"}</span>
          </Button>

          <Button
            onClick={connectWalletConnect}
            disabled={isConnecting}
            className={`w-full flex items-center justify-center space-x-3 py-4 border-2 ${isDark
                ? "bg-black text-white border-white hover:bg-white hover:text-black hover:border-black"
                : "bg-white text-black border-black hover:bg-black hover:text-white hover:border-white"
              } rounded-lg`}
          >
            <Wallet className="h-5 w-5" />
            <span>{isConnecting ? "Connecting..." : "WalletConnect"}</span>
          </Button>

          <Button
            onClick={() => onConnect("0xF1Ed4C4cE65B6353B71f2304b3fD7641a436675F")}
            className={`w-full text-sm py-2 border-2 ${isDark
                ? "bg-black text-white border-white hover:bg-white hover:text-black hover:border-black"
                : "bg-white text-black border-black hover:bg-black hover:text-white hover:border-white"
              } rounded-lg`}
          >
            Demo: Connect as Admin
          </Button>
        </div>

        <p className={`text-xs text-center mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          By connecting, you agree to our Terms of Service
        </p>
      </div>
    </div>
  )
}
