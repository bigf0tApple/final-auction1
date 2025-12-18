"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, X } from "lucide-react"

interface BidNotificationProps {
  message: string
  type: "success" | "error"
  onClose: () => void
  isDark: boolean
}

export default function BidNotification({ message, type, onClose, isDark }: BidNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, 5000) // Extended to 5 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div
        className={`${
          isDark ? "bg-[#000000] border-white" : "bg-white border-black"
        } border rounded-lg p-4 shadow-lg flex items-center space-x-3 min-w-[300px]`}
      >
        <CheckCircle className={`h-5 w-5 ${type === "success" ? "text-green-500" : "text-red-500"}`} />
        <span className={`flex-1 text-sm font-medium ${isDark ? "text-white" : "text-black"}`}>{message}</span>
        <Button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          variant="ghost"
          className={`p-1 ${isDark ? "text-white" : "text-black"}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
