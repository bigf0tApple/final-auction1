"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Bell, Clock } from "lucide-react"

interface ReminderModalProps {
  auction: {
    id: number
    title: string
    artist: string
    startingBid: string
    status: string
  }
  onClose: () => void
  isDark: boolean
}

export default function ReminderModal({ auction, onClose, isDark }: ReminderModalProps) {
  const [selectedOption, setSelectedOption] = useState("start")
  const [isSettingReminder, setIsSettingReminder] = useState(false)

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }
    return false
  }

  const calculateReminderTime = () => {
    // Parse the status to get hours (e.g., "Starting in 2h" -> 2)
    const hoursMatch = auction.status.match(/(\d+)h/)
    const hours = hoursMatch ? Number.parseInt(hoursMatch[1]) : 2

    const now = new Date()
    let reminderTime = new Date(now.getTime() + hours * 60 * 60 * 1000)

    switch (selectedOption) {
      case "5min":
        reminderTime = new Date(reminderTime.getTime() - 5 * 60 * 1000)
        break
      case "10min":
        reminderTime = new Date(reminderTime.getTime() - 10 * 60 * 1000)
        break
      case "start":
      default:
        // No adjustment needed
        break
    }

    return reminderTime
  }

  const setReminder = async () => {
    setIsSettingReminder(true)

    try {
      const hasPermission = await requestNotificationPermission()

      if (!hasPermission) {
        alert("Please enable notifications to set reminders")
        setIsSettingReminder(false)
        return
      }

      const reminderTime = calculateReminderTime()
      const now = new Date()
      const timeUntilReminder = reminderTime.getTime() - now.getTime()

      if (timeUntilReminder <= 0) {
        alert("This auction is starting too soon to set a reminder")
        setIsSettingReminder(false)
        return
      }

      // Set the browser notification
      setTimeout(() => {
        const notificationTitle = `Auction Starting: ${auction.title}`
        const notificationBody = `by ${auction.artist} - Starting bid: ${auction.startingBid}`

        new Notification(notificationTitle, {
          body: notificationBody,
          icon: "/placeholder.svg?height=64&width=64&text=🎨",
          badge: "/placeholder.svg?height=32&width=32&text=🔔",
          tag: `auction-${auction.id}`,
          requireInteraction: true,
        })
      }, timeUntilReminder)

      // Store reminder in localStorage for persistence
      const reminders = JSON.parse(localStorage.getItem("auctionReminders") || "[]")
      reminders.push({
        auctionId: auction.id,
        title: auction.title,
        artist: auction.artist,
        reminderTime: reminderTime.toISOString(),
        type: selectedOption,
        created: new Date().toISOString(),
      })
      localStorage.setItem("auctionReminders", JSON.stringify(reminders))

      const optionText = {
        start: "when it starts",
        "5min": "5 minutes before it starts",
        "10min": "10 minutes before it starts",
      }

      alert(
        `Reminder set! You'll be notified ${optionText[selectedOption as keyof typeof optionText]} for "${auction.title}"`,
      )
      onClose()
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to set reminder:", error)
      }
      alert("Failed to set reminder. Please try again.")
    } finally {
      setIsSettingReminder(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          isDark ? "bg-[#000000] border-white" : "bg-white border-black"
        } border rounded-2xl p-4 sm:p-6 max-w-md w-full mx-4`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-base sm:text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>Set Auction Reminder</h3>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            className={`p-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-none ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-black"} mb-1`}>{auction.title}</h4>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>by {auction.artist}</p>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Starting bid: {auction.startingBid}</p>
        </div>

        <div className="mb-6">
          <p className={`text-sm font-medium ${isDark ? "text-white" : "text-black"} mb-3`}>
            Remind me of the auction:
          </p>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="reminderTime"
                value="start"
                checked={selectedOption === "start"}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-4 h-4"
              />
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className={`${isDark ? "text-white" : "text-black"}`}>When it starts</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="reminderTime"
                value="5min"
                checked={selectedOption === "5min"}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-4 h-4"
              />
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span className={`${isDark ? "text-white" : "text-black"}`}>5 minutes before</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="reminderTime"
                value="10min"
                checked={selectedOption === "10min"}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-4 h-4"
              />
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span className={`${isDark ? "text-white" : "text-black"}`}>10 minutes before</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white hover:border-white dark:hover:bg-white dark:hover:text-black dark:hover:border-black rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={setReminder}
            disabled={isSettingReminder}
            className="flex-1 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white hover:border-white dark:hover:bg-white dark:hover:text-black dark:hover:border-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSettingReminder ? "Setting..." : "Set Reminder"}
          </Button>
        </div>

        <p className={`text-xs text-center mt-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Browser notifications must be enabled
        </p>
      </div>
    </div>
  )
}
