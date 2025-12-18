"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: string
  action: "normal" | "flagged" | "warning"
}

interface ChatDayModalProps {
  date: string
  dayName: string
  onClose: () => void
  isDark: boolean
}

export default function ChatDayModal({ date, dayName, onClose, isDark }: ChatDayModalProps) {
  // Mock chat data for the selected day
  const [chatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      user: "0x1234...5678",
      message: "Great artwork! Love the colors",
      timestamp: "14:30:15",
      action: "normal",
    },
    {
      id: "2",
      user: "artlover.eth",
      message: "When does bidding end?",
      timestamp: "14:32:20",
      action: "normal",
    },
    {
      id: "3",
      user: "0x9876...4321",
      message: "This is spam content",
      timestamp: "09:15:30",
      action: "flagged",
    },
    {
      id: "4",
      user: "0x5555...7777",
      message: "Love this piece, bidding now!",
      timestamp: "10:45:12",
      action: "normal",
    },
    {
      id: "5",
      user: "0xABCD...EFGH",
      message: "Message contained blocked word",
      timestamp: "11:22:45",
      action: "warning",
    },
  ])

  const exportDayChat = () => {
    const csvContent = [
      "Date,User,Message,Timestamp,Action",
      ...chatMessages.map((msg) => `${date},${msg.user},"${msg.message}",${msg.timestamp},${msg.action}`),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-history-${date}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${
          isDark ? "bg-[#000000] border-white" : "bg-white border-black"
        } border rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${isDark ? "border-white" : "border-black"}`}>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}>Chat History - {date}</h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {dayName} • {chatMessages.length} messages
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={exportDayChat}
              className={`${
                isDark ? "bg-white text-black hover:bg-black hover:text-white" : "bg-black text-white hover:bg-white hover:text-black"
              } rounded-lg`}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Day
            </Button>
            <Button 
              onClick={onClose} 
              variant="ghost" 
              className={`p-2 bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-none ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border ${
                  message.action === "flagged"
                    ? "bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-600"
                    : message.action === "warning"
                      ? "bg-yellow-50 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-600"
                      : isDark
                        ? "bg-gray-900 border-gray-600"
                        : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-mono text-sm ${isDark ? "text-white" : "text-black"}`}>{message.user}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>{message.timestamp}</span>
                    {message.action === "flagged" && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">FLAGGED</span>
                    )}
                    {message.action === "warning" && (
                      <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">WARNING</span>
                    )}
                  </div>
                </div>
                <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{message.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
