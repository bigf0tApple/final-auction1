"use client"

import React from "react"
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/hooks/use-notifications"

interface NotificationSettingsProps {
    isDark: boolean
    onClose?: () => void
}

export default function NotificationSettings({ isDark, onClose }: NotificationSettingsProps) {
    const {
        isSupported,
        permission,
        soundEnabled,
        requestPermission,
        toggleSound,
    } = useNotifications()

    const handleRequestPermission = async () => {
        await requestPermission()
    }

    const baseButtonClass = `flex items-center justify-between w-full p-4 rounded-lg border-2 ${isDark
            ? "bg-black text-white border-white hover:bg-white hover:text-black"
            : "bg-white text-black border-black hover:bg-black hover:text-white"
        }`

    const enabledClass = isDark
        ? "bg-green-900/30 border-green-500 hover:bg-green-500 hover:text-white"
        : "bg-green-100 border-green-500 hover:bg-green-500 hover:text-white"

    const disabledClass = isDark
        ? "bg-red-900/30 border-red-500 hover:bg-red-500 hover:text-white"
        : "bg-red-100 border-red-500 hover:bg-red-500 hover:text-white"

    return (
        <div className="space-y-4">
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>
                Notification Settings
            </h3>

            {!isSupported && (
                <div className={`p-4 rounded-lg ${isDark ? "bg-yellow-900/20 text-yellow-400" : "bg-yellow-100 text-yellow-700"}`}>
                    ⚠️ Browser notifications are not supported in this browser.
                </div>
            )}

            {/* Browser Notifications */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Browser Notifications
                </label>
                <button
                    onClick={handleRequestPermission}
                    disabled={!isSupported || permission === "denied"}
                    className={`${baseButtonClass} ${permission === "granted" ? enabledClass : permission === "denied" ? disabledClass : ""
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <div className="flex items-center gap-3">
                        {permission === "granted" ? (
                            <Bell className="h-5 w-5" />
                        ) : (
                            <BellOff className="h-5 w-5" />
                        )}
                        <div className="text-left">
                            <div className="font-medium">
                                {permission === "granted"
                                    ? "Notifications Enabled"
                                    : permission === "denied"
                                        ? "Notifications Blocked"
                                        : "Enable Notifications"}
                            </div>
                            <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {permission === "granted"
                                    ? "You'll receive alerts for bids and auctions"
                                    : permission === "denied"
                                        ? "Please enable in browser settings"
                                        : "Get notified when you're outbid or win"}
                            </div>
                        </div>
                    </div>
                    <div
                        className={`w-12 h-6 rounded-full transition-colors ${permission === "granted"
                                ? "bg-green-500"
                                : permission === "denied"
                                    ? "bg-red-500"
                                    : isDark
                                        ? "bg-gray-700"
                                        : "bg-gray-300"
                            }`}
                    >
                        <div
                            className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${permission === "granted" ? "translate-x-6" : "translate-x-0.5"
                                } mt-0.5`}
                        />
                    </div>
                </button>
            </div>

            {/* Sound Toggle */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Notification Sound
                </label>
                <button
                    onClick={toggleSound}
                    className={`${baseButtonClass} ${soundEnabled ? enabledClass : disabledClass}`}
                >
                    <div className="flex items-center gap-3">
                        {soundEnabled ? (
                            <Volume2 className="h-5 w-5" />
                        ) : (
                            <VolumeX className="h-5 w-5" />
                        )}
                        <div className="text-left">
                            <div className="font-medium">
                                {soundEnabled ? "Sound Enabled" : "Sound Disabled"}
                            </div>
                            <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {soundEnabled
                                    ? "You'll hear a beep on notifications"
                                    : "Notifications will be silent"}
                            </div>
                        </div>
                    </div>
                    <div
                        className={`w-12 h-6 rounded-full transition-colors ${soundEnabled ? "bg-green-500" : "bg-red-500"
                            }`}
                    >
                        <div
                            className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${soundEnabled ? "translate-x-6" : "translate-x-0.5"
                                } mt-0.5`}
                        />
                    </div>
                </button>
            </div>

            {/* Test Notification */}
            {permission === "granted" && (
                <div className="pt-4">
                    <Button
                        onClick={() => {
                            new Notification("ARPO Studio", {
                                body: "This is a test notification!",
                                icon: "/arpo-logo.png",
                            })
                        }}
                        className={`w-full ${isDark
                                ? "bg-white text-black hover:bg-gray-200"
                                : "bg-black text-white hover:bg-gray-800"
                            }`}
                    >
                        Send Test Notification
                    </Button>
                </div>
            )}

            {/* Close button if provided */}
            {onClose && (
                <div className="pt-2">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className={`w-full ${isDark
                                ? "border-white text-white hover:bg-white hover:text-black"
                                : "border-black text-black hover:bg-black hover:text-white"
                            }`}
                    >
                        Close
                    </Button>
                </div>
            )}
        </div>
    )
}
