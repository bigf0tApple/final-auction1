"use client"

import React, { useState } from "react"
import { X, Bell, Palette, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import NotificationSettings from "./notification-settings"

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    isDark: boolean
    toggleTheme: () => void
    onEditProfile?: () => void
}

type SettingsTab = "notifications" | "appearance" | "profile"

export default function SettingsModal({
    isOpen,
    onClose,
    isDark,
    toggleTheme,
    onEditProfile,
}: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>("notifications")

    if (!isOpen) return null

    const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { key: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
        { key: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
        { key: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    ]

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
                className={`${isDark ? "bg-black text-white border-white" : "bg-white text-black border-black"
                    } border-2 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col`}
            >
                {/* Header */}
                <div className={`flex justify-between items-center p-4 border-b ${isDark ? "border-white" : "border-black"}`}>
                    <h2 className="text-xl font-bold">Settings</h2>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className={`p-1 ${isDark ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className={`flex border-b ${isDark ? "border-white/20" : "border-black/20"}`}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === tab.key
                                    ? isDark
                                        ? "bg-white text-black"
                                        : "bg-black text-white"
                                    : isDark
                                        ? "text-gray-400 hover:text-white hover:bg-white/10"
                                        : "text-gray-600 hover:text-black hover:bg-black/10"
                                }`}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Notifications Tab */}
                    {activeTab === "notifications" && (
                        <NotificationSettings isDark={isDark} />
                    )}

                    {/* Appearance Tab */}
                    {activeTab === "appearance" && (
                        <div className="space-y-6">
                            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>
                                Appearance
                            </h3>

                            {/* Theme Toggle */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    Theme
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => isDark && toggleTheme()}
                                        className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${!isDark
                                                ? "bg-black text-white border-black"
                                                : "bg-transparent text-white border-white hover:bg-white hover:text-black"
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">☀️</div>
                                        <div className="text-sm font-medium">Light</div>
                                    </button>
                                    <button
                                        onClick={() => !isDark && toggleTheme()}
                                        className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${isDark
                                                ? "bg-white text-black border-white"
                                                : "bg-transparent text-black border-black hover:bg-black hover:text-white"
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🌙</div>
                                        <div className="text-sm font-medium">Dark</div>
                                    </button>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className={`p-4 rounded-lg ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
                                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    Current Theme: <span className="font-bold">{isDark ? "Dark Mode" : "Light Mode"}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>
                                Profile Settings
                            </h3>

                            <div className={`p-4 rounded-lg ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
                                <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    Manage your username, avatar, and display preferences.
                                </p>
                                {onEditProfile && (
                                    <Button
                                        onClick={() => {
                                            onClose()
                                            onEditProfile()
                                        }}
                                        className={`w-full ${isDark
                                                ? "bg-white text-black hover:bg-gray-200"
                                                : "bg-black text-white hover:bg-gray-800"
                                            }`}
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    Display Name Priority
                                </h4>
                                <div className={`space-y-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">1</span>
                                        <span>Username (if set)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</span>
                                        <span>ENS Name (if available)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs">3</span>
                                        <span>Wallet Address (shortened)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
