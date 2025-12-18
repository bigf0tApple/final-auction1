"use client"

import { Button } from "@/components/ui/button"
import { Sun, Moon, Wallet, User, Search, Settings, LayoutDashboard } from "lucide-react"
import NavigationDropdown from "./navigation-dropdown"
import MobileMenu from "./mobile-menu"
import { UserProfile } from "@/hooks/use-user-profile"

interface SiteHeaderProps {
    isDark: boolean
    toggleTheme: () => void
    isAdmin: boolean
    connectedWallet: string | null
    userProfile: UserProfile | null
    onConnect: () => void
    onDisconnect: () => void
    onOpenAdmin: () => void
    onOpenSoldRecent: () => void
    onOpenCalendar: () => void
    onScrollToUpcoming: () => void
    onOpenTeam: () => void
    onOpenWhy: () => void
    onOpenContact: () => void
    onOpenTerms: () => void
    onOpenSettings: () => void
    onOpenSearch: () => void
    onOpenProfile: () => void
    onOpenAllSold: () => void
}

export default function SiteHeader({
    isDark,
    toggleTheme,
    isAdmin,
    connectedWallet,
    userProfile,
    onConnect,
    onDisconnect,
    onOpenAdmin,
    onOpenSoldRecent,
    onOpenCalendar,
    onScrollToUpcoming,
    onOpenTeam,
    onOpenWhy,
    onOpenContact,
    onOpenTerms,
    onOpenSettings,
    onOpenSearch,
    onOpenProfile,
    onOpenAllSold,
}: SiteHeaderProps) {
    return (
        <header className="border-b border-gray-300 dark:border-white bg-white dark:bg-[#000000] sticky top-0 z-50">
            <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#000000] dark:bg-white rounded-lg flex items-center justify-center">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white dark:bg-[#000000] rounded-sm"></div>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-black dark:text-white">Arpo Studio</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-6">
                        <NavigationDropdown
                            title="Sold"
                            isDark={isDark}
                            items={[
                                { label: "Recent", onClick: onOpenSoldRecent },
                                { label: "ALL SOLD", onClick: onOpenAllSold },
                            ]}
                        />
                        <NavigationDropdown
                            title="Next"
                            isDark={isDark}
                            items={[
                                { label: "Calendar", onClick: onOpenCalendar },
                                { label: "What's up next", onClick: onScrollToUpcoming },
                            ]}
                        />

                        <NavigationDropdown
                            title="About"
                            isDark={isDark}
                            items={[
                                { label: "Team", onClick: onOpenTeam },
                                { label: "WHY", onClick: onOpenWhy },
                                { label: "Contact Us", onClick: onOpenContact },
                                { label: "T&Cs", onClick: onOpenTerms },
                            ]}
                        />
                    </div>

                    {/* Mobile Menu & Controls */}
                    <div className="flex lg:hidden items-center space-x-2">
                        <MobileMenu
                            isDark={isDark}
                            isAdmin={isAdmin}
                            onAdminClick={onOpenAdmin}
                            onShowSoldRecent={onOpenSoldRecent}
                            onShowCalendar={onOpenCalendar}
                            onScrollToUpcoming={onScrollToUpcoming}
                            onShowTeam={onOpenTeam}
                            onShowWhy={onOpenWhy}
                            onShowContact={onOpenContact}
                            onShowTerms={onOpenTerms}
                            onShowSettings={onOpenSettings}
                        />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            className="p-2 bg-white dark:bg-[#000000] border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg"
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                        {connectedWallet ? (
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs px-2 py-1 text-black dark:text-white border border-black dark:border-white rounded-lg"
                                >
                                    {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onDisconnect}
                                    className="text-xs px-1 py-1 text-red-600 dark:text-red-400 border-2 border-red-600 dark:border-red-400 rounded-lg hover:bg-red-600 hover:text-white dark:hover:bg-red-400 dark:hover:text-black"
                                >
                                    <span className="font-bold text-lg">×</span>
                                </Button>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                onClick={onConnect}
                                className="text-xs px-2 py-1 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white rounded-lg"
                            >
                                <Wallet className="h-3 w-3 mr-1" />
                                Connect
                            </Button>
                        )}
                    </div>

                    {/* Desktop Controls */}
                    <div className="hidden lg:flex items-center space-x-3">
                        {isAdmin && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onOpenAdmin}
                                className="p-2 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                                title="Admin Panel"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                            </Button>
                        )}

                        {/* General Settings */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onOpenSettings}
                            className="p-2 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg"
                            title="Settings"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleTheme}
                            className="p-2 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg"
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>

                        {/* Search Button */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onOpenSearch}
                            className="p-2 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg"
                            title="Search users and auctions"
                        >
                            <Search className="h-4 w-4" />
                        </Button>

                        {connectedWallet ? (
                            <div className="flex items-center space-x-2">
                                {/* Profile Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onOpenProfile}
                                    className="text-sm px-3 py-2 text-black dark:text-white border border-black dark:border-white rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center gap-2"
                                >
                                    {userProfile?.avatar ? (
                                        <img src={userProfile.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                    ) : (
                                        <User className="h-4 w-4" />
                                    )}
                                    <span className="hidden sm:inline">
                                        {userProfile?.username || `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}`}
                                    </span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onDisconnect}
                                    className="text-sm px-2 py-2 text-red-600 dark:text-red-400 border-2 border-red-600 dark:border-red-400 rounded-lg hover:bg-red-600 hover:text-white dark:hover:bg-red-400 dark:hover:text-black"
                                >
                                    <span className="font-bold text-lg">×</span>
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={onConnect}
                                className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white rounded-lg"
                            >
                                <Wallet className="h-4 w-4 mr-2" />
                                Connect Wallet
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
