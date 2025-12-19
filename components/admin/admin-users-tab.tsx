"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Ban, Award } from "lucide-react"
import type { MockUser } from "./admin-data"

interface AdminUsersTabProps {
    isDark: boolean
    searchTerm: string
    setSearchTerm: (term: string) => void
    filteredUsers: MockUser[]
    toggleUserStatus: (address: string) => void
}

export default function AdminUsersTab({
    searchTerm,
    setSearchTerm,
    filteredUsers,
    toggleUserStatus,
}: AdminUsersTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-black dark:text-white">User Management</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                        placeholder="Search wallet addresses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg"
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filteredUsers.map((user) => (
                    <Card
                        key={user.address}
                        className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl"
                    >
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-mono text-lg font-bold text-black dark:text-white">{user.address}</span>
                                        <Badge
                                            className={`${user.status === "active"
                                                ? "bg-white dark:bg-white text-black border border-black"
                                                : "bg-[#000000] dark:bg-[#000000] text-white border border-white"
                                                } rounded-lg`}
                                        >
                                            {user.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Total Bids:</span>
                                            <div className="font-bold text-black dark:text-white">{user.totalBids}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Auctions Won:</span>
                                            <div className="font-bold text-black dark:text-white flex items-center">
                                                <Award className="h-3 w-3 mr-1" />
                                                {user.auctionsWon}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Total Spent:</span>
                                            <div className="font-bold text-black dark:text-white">{user.totalSpent}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Reputation:</span>
                                            <div className="font-bold text-black dark:text-white">{user.reputation ?? 100}%</div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 text-xs text-gray-600 dark:text-gray-400">
                                        <span>Joined: {user.joinDate}</span>
                                        <span>Last Active: {user.lastActive}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => toggleUserStatus(user.address)}
                                    className={`${user.status === "active"
                                        ? "bg-[#000000] text-white border-2 border-white hover:bg-white hover:text-black hover:border-black"
                                        : "bg-white text-black border-2 border-black hover:bg-black hover:text-white hover:border-white"
                                        } rounded-lg`}
                                >
                                    <Ban className="h-4 w-4 mr-2" />
                                    {user.status === "active" ? "Blacklist" : "Unblock"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

