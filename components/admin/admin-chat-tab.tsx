"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface ChatHistoryDay {
    date: string
    dayName: string
    messageCount: number
    activeUsers: number
    warnings: number
}

interface ModerationRecord {
    id: number
    userAddress: string
    action: string
    reason: string
    date: string
    status: string
}

interface AdminChatTabProps {
    isDark: boolean
    blockedWords: string[]
    newBlockedWord: string
    setNewBlockedWord: (word: string) => void
    addBlockedWord: () => void
    removeBlockedWord: (word: string) => void
    chatHistory: ChatHistoryDay[]
    selectedHistoryDays: string[]
    toggleHistorySelection: (date: string) => void
    deleteSelectedHistory: () => void
    exportSelectedHistory: () => void
    viewDayHistory: (date: string, dayName: string) => void
    moderationHistory: ModerationRecord[]
    unblacklistUser: (address: string) => void
}

export default function AdminChatTab({
    blockedWords,
    newBlockedWord,
    setNewBlockedWord,
    addBlockedWord,
    removeBlockedWord,
    chatHistory,
    selectedHistoryDays,
    toggleHistorySelection,
    deleteSelectedHistory,
    exportSelectedHistory,
    viewDayHistory,
    moderationHistory,
    unblacklistUser,
}: AdminChatTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-black dark:text-white">Chat Management</h2>
                <div className="flex space-x-2">
                    {selectedHistoryDays.length > 0 && (
                        <div className="flex space-x-2">
                            <Button
                                onClick={exportSelectedHistory}
                                className="bg-[#000000] dark:bg-white text-white dark:text-[#000000] border-2 border-white dark:border-black hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white rounded-lg"
                            >
                                Export Selected ({selectedHistoryDays.length})
                            </Button>
                            <Button
                                onClick={deleteSelectedHistory}
                                className="bg-red-600 text-white hover:bg-red-700 rounded-lg"
                            >
                                Delete Selected ({selectedHistoryDays.length})
                            </Button>
                        </div>
                    )}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                            placeholder="Search messages, users, keywords..."
                            className="pl-10 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Chat Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-black dark:text-white">
                            {chatHistory.reduce((acc, day) => acc + day.messageCount, 0)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages (7d)</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-black dark:text-white">
                            {Math.max(...chatHistory.map(d => d.activeUsers), 0)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Chatters</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-black dark:text-white">
                            {chatHistory.reduce((acc, day) => acc + day.warnings, 0)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Warnings Issued</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-black dark:text-white">
                            {moderationHistory.filter(r => r.status === "blacklisted").length}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Users Restricted</p>
                    </CardContent>
                </Card>
            </div>

            {/* Blocked Words Management */}
            <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-black dark:text-white">Blocked Words Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2 mb-4">
                        <Input
                            value={newBlockedWord}
                            onChange={(e) => setNewBlockedWord(e.target.value)}
                            placeholder="Add new blocked word..."
                            className="flex-1 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg"
                        />
                        <Button
                            onClick={addBlockedWord}
                            className="bg-[#000000] dark:bg-white text-white dark:text-[#000000] border-2 border-white dark:border-black hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white rounded-lg"
                        >
                            Add Word
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {blockedWords.map((word: string) => (
                            <Badge key={word} className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-lg">
                                {word}
                                <button onClick={() => removeBlockedWord(word)} className="ml-2 text-red-500 hover:text-red-700">
                                    ×
                                </button>
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 7-Day Chat History */}
            <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-black dark:text-white flex items-center justify-between">
                        <span>Chat History (Last 7 Days)</span>
                        {selectedHistoryDays.length > 0 && (
                            <Button
                                onClick={deleteSelectedHistory}
                                className="bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm"
                            >
                                Delete Selected ({selectedHistoryDays.length})
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {chatHistory.map((day) => (
                            <div
                                key={day.date}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedHistoryDays.includes(day.date)
                                    ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                                    : "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedHistoryDays.includes(day.date)}
                                            onChange={() => toggleHistorySelection(day.date)}
                                            className="w-4 h-4"
                                        />
                                        <div onClick={() => viewDayHistory(day.date, day.dayName)} className="flex-1 hover:underline">
                                            <div className="font-semibold text-black dark:text-white">
                                                {day.date} ({day.dayName})
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {day.messageCount} messages • {day.activeUsers} active users
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {day.warnings > 0 && <span className="text-red-500">{day.warnings} warnings</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* User Moderation Table */}
            <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-black dark:text-white">User Moderation History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-300 dark:border-gray-600">
                                    <th className="text-left p-3 text-black dark:text-white">User</th>
                                    <th className="text-left p-3 text-black dark:text-white">Action</th>
                                    <th className="text-left p-3 text-black dark:text-white">Reason</th>
                                    <th className="text-left p-3 text-black dark:text-white">Date</th>
                                    <th className="text-left p-3 text-black dark:text-white">Status</th>
                                    <th className="text-left p-3 text-black dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {moderationHistory.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-200 dark:border-gray-700">
                                        <td className="p-3 font-mono text-sm text-black dark:text-white">{record.userAddress}</td>
                                        <td className="p-3">
                                            <Badge
                                                className={`${record.action === "warned"
                                                    ? "bg-yellow-500 text-white"
                                                    : record.action === "restricted"
                                                        ? "bg-red-500 text-white"
                                                        : "bg-gray-500 text-white"
                                                    } rounded-lg`}
                                            >
                                                {record.action}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm text-gray-700 dark:text-gray-300">{record.reason}</td>
                                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{record.date}</td>
                                        <td className="p-3">
                                            <Badge
                                                className={`${record.status === "active" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                                    } rounded-lg`}
                                            >
                                                {record.status}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            {record.status === "blacklisted" && (
                                                <Button
                                                    onClick={() => unblacklistUser(record.userAddress)}
                                                    className="bg-green-600 text-white hover:bg-green-700 rounded-lg text-xs px-3 py-1"
                                                >
                                                    Unblacklist
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
