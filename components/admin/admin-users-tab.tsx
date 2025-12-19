"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Ban, Award, UserPlus } from "lucide-react"

interface MockUser {
    address: string
    ens: string | null
    displayName: string | null
    bids: number
    spent: string
    won: number
    tier: string
    status: string
    joinDate: string
    verified: boolean
}

interface AdminUsersTabProps {
    isDark: boolean
    searchTerm: string
    setSearchTerm: (term: string) => void
    filteredUsers: MockUser[]
    toggleUserStatus: (address: string) => void
}

export default function AdminUsersTab({
    isDark,
    searchTerm,
    setSearchTerm,
    filteredUsers,
    toggleUserStatus,
}: AdminUsersTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-black dark:text-white">User Management</h2>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            className="pl-10 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg"
                        />
                    </div>
                </div>
            </div>

            <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-2xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-black dark:text-white">All Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">User</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Display Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Total Bids</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Auctions Won</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tier</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => (
                                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-mono text-black dark:text-white">{user.address}</span>
                                                {user.ens && (
                                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                                                        {user.ens}
                                                    </Badge>
                                                )}
                                                {user.verified && (
                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                                                        ✓ Verified
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-black dark:text-white">
                                            {user.displayName || <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-black dark:text-white">{user.bids}</td>
                                        <td className="py-3 px-4 text-sm text-black dark:text-white">{user.spent}</td>
                                        <td className="py-3 px-4 text-sm text-black dark:text-white">{user.won}</td>
                                        <td className="py-3 px-4">
                                            <Badge
                                                className={`text-xs ${user.tier === "Diamond"
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                        : user.tier === "Gold"
                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                            : user.tier === "Silver"
                                                                ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                                : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                                    }`}
                                            >
                                                {user.tier === "Diamond" && <Award className="h-3 w-3 mr-1" />}
                                                {user.tier}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge
                                                className={`text-xs ${user.status === "active"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                        : user.status === "warned"
                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                    }`}
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleUserStatus(user.address)}
                                                    className="bg-white dark:bg-[#000000] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                                >
                                                    <Ban className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* User Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                                <p className="text-xl font-bold text-black dark:text-white">
                                    {filteredUsers.filter((u) => u.status === "active").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Warned Users</p>
                                <p className="text-xl font-bold text-black dark:text-white">
                                    {filteredUsers.filter((u) => u.status === "warned").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Blacklisted</p>
                                <p className="text-xl font-bold text-black dark:text-white">
                                    {filteredUsers.filter((u) => u.status === "blacklisted").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-[#000000] border-black dark:border-white rounded-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Diamond Tier</p>
                                <p className="text-xl font-bold text-black dark:text-white">
                                    {filteredUsers.filter((u) => u.tier === "Diamond").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
