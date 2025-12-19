"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Eye, Download, Trash2 } from "lucide-react"

interface ChatHistoryDay {
    date: string
    dayName: string
    messageCount: number
    activeUsers: number
    warnings: number
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
}

export default function AdminChatTab({
    isDark,
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
}: AdminChatTabProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black dark:text-white">Chat Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Blocked Words */}
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-black dark:text-white">Blocked Words</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex space-x-2">
                            <Input
                                value={newBlockedWord}
                                onChange={(e) => setNewBlockedWord(e.target.value)}
                                placeholder="Add blocked word..."
                                className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        addBlockedWord()
                                    }
                                }}
                            />
                            <Button
                                onClick={addBlockedWord}
                                className="bg-[#000000] dark:bg-white text-white dark:text-[#000000] hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg"
                            >
                                Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                            {blockedWords.map((word, index) => (
                                <Badge
                                    key={index}
                                    className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 flex items-center space-x-1"
                                >
                                    <span>{word}</span>
                                    <button
                                        onClick={() => removeBlockedWord(word)}
                                        className="ml-1 hover:text-red-600 dark:hover:text-red-300"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Messages containing these words will trigger warnings. Users with 3+ warnings get restricted.
                        </p>
                    </CardContent>
                </Card>

                {/* Chat History */}
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-black dark:text-white">Chat History</CardTitle>
                        <div className="flex space-x-2">
                            {selectedHistoryDays.length > 0 && (
                                <>
                                    <Button
                                        onClick={exportSelectedHistory}
                                        variant="outline"
                                        size="sm"
                                        className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        Export ({selectedHistoryDays.length})
                                    </Button>
                                    <Button
                                        onClick={deleteSelectedHistory}
                                        variant="outline"
                                        size="sm"
                                        className="bg-white dark:bg-[#000000] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {chatHistory.map((day, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border ${selectedHistoryDays.includes(day.date)
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-gray-200 dark:border-gray-700"
                                        } cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900`}
                                    onClick={() => toggleHistorySelection(day.date)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedHistoryDays.includes(day.date)}
                                                onChange={() => { }}
                                                className="h-4 w-4"
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-black dark:text-white">{day.dayName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{day.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs">
                                            <span className="text-gray-600 dark:text-gray-400">{day.messageCount} msgs</span>
                                            <span className="text-gray-600 dark:text-gray-400">{day.activeUsers} users</span>
                                            {day.warnings > 0 && (
                                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                    {day.warnings} warnings
                                                </Badge>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    viewDayHistory(day.date, day.dayName)
                                                }}
                                                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                                            >
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Moderation Quick Stats */}
            <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-black dark:text-white">Moderation Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-2xl font-bold text-black dark:text-white">
                                {chatHistory.reduce((acc, day) => acc + day.messageCount, 0)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages (7d)</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-2xl font-bold text-black dark:text-white">
                                {Math.max(...chatHistory.map((d) => d.activeUsers))}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Peak Active Users</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">
                                {chatHistory.reduce((acc, day) => acc + day.warnings, 0)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Warnings</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{blockedWords.length}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Blocked Words</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
