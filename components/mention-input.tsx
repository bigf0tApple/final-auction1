"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"

interface UserSuggestion {
    wallet: string
    username: string | null
    avatar: string | null
}

interface MentionInputProps {
    value: string
    onChange: (value: string) => void
    onKeyPress: (e: React.KeyboardEvent) => void
    isDark: boolean
    disabled?: boolean
    placeholder?: string
    className?: string
}

export default function MentionInput({
    value,
    onChange,
    onKeyPress,
    isDark,
    disabled = false,
    placeholder = "Type a message...",
    className = "",
}: MentionInputProps) {
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
    const [mentionQuery, setMentionQuery] = useState("")
    const [mentionStart, setMentionStart] = useState(-1)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    // Search for users when @ is typed
    const searchUsers = useCallback((query: string): UserSuggestion[] => {
        if (!query || query.length < 1) return []

        try {
            const existingUsers = JSON.parse(localStorage.getItem("arpo_users") || "{}")
            const lowerQuery = query.toLowerCase()

            return Object.values(existingUsers)
                .filter((user: unknown) => {
                    const u = user as UserSuggestion
                    return (
                        u.username?.toLowerCase().includes(lowerQuery) ||
                        u.wallet.toLowerCase().includes(lowerQuery)
                    )
                })
                .slice(0, 5) as UserSuggestion[]
        } catch {
            return []
        }
    }, [])

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        const cursorPos = e.target.selectionStart || 0

        // Check if we're in a mention context
        const textBeforeCursor = newValue.slice(0, cursorPos)
        const atIndex = textBeforeCursor.lastIndexOf("@")

        if (atIndex !== -1) {
            // Check if @ is at start or after a space
            const charBefore = atIndex > 0 ? textBeforeCursor[atIndex - 1] : " "
            if (charBefore === " " || atIndex === 0) {
                const query = textBeforeCursor.slice(atIndex + 1)
                // Only show suggestions if there's no space after @
                if (!query.includes(" ")) {
                    setMentionQuery(query)
                    setMentionStart(atIndex)
                    const results = searchUsers(query)
                    setSuggestions(results)
                    setShowSuggestions(results.length > 0 || query.length > 0)
                    setSelectedIndex(0)
                } else {
                    setShowSuggestions(false)
                }
            } else {
                setShowSuggestions(false)
            }
        } else {
            setShowSuggestions(false)
        }

        onChange(newValue)
    }

    // Handle keyboard navigation in suggestions
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault()
                setSelectedIndex((prev) => (prev + 1) % suggestions.length)
                return
            }
            if (e.key === "ArrowUp") {
                e.preventDefault()
                setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
                return
            }
            if (e.key === "Tab" || e.key === "Enter") {
                if (suggestions[selectedIndex]) {
                    e.preventDefault()
                    selectSuggestion(suggestions[selectedIndex])
                    return
                }
            }
            if (e.key === "Escape") {
                e.preventDefault()
                setShowSuggestions(false)
                return
            }
        }

        // Only call parent onKeyPress if not handling suggestions
        if (!showSuggestions || suggestions.length === 0) {
            onKeyPress(e)
        }
    }

    // Select a suggestion
    const selectSuggestion = (user: UserSuggestion) => {
        const displayName = user.username || `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}`
        const before = value.slice(0, mentionStart)
        const after = value.slice(mentionStart + mentionQuery.length + 1)
        const newValue = `${before}@${displayName} ${after}`

        onChange(newValue)
        setShowSuggestions(false)
        setMentionQuery("")
        setMentionStart(-1)

        // Focus input after selection
        setTimeout(() => {
            inputRef.current?.focus()
        }, 0)
    }

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowSuggestions(false)
        document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
    }, [])

    return (
        <div className="relative flex-1">
            <Input
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={className}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div
                    className={`absolute bottom-full left-0 right-0 mb-1 rounded-lg border-2 shadow-lg overflow-hidden max-h-48 ${isDark ? "bg-black border-white" : "bg-white border-black"
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {suggestions.length === 0 ? (
                        <div className={`px-3 py-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            No users found matching &quot;{mentionQuery}&quot;
                        </div>
                    ) : (
                        suggestions.map((user, index) => (
                            <button
                                key={user.wallet}
                                onClick={() => selectSuggestion(user)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${index === selectedIndex
                                        ? isDark
                                            ? "bg-white text-black"
                                            : "bg-black text-white"
                                        : isDark
                                            ? "text-white hover:bg-white/10"
                                            : "text-black hover:bg-black/5"
                                    }`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-100"
                                        }`}
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs">
                                            {(user.username || user.wallet)[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {user.username || `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}`}
                                    </div>
                                    {user.username && (
                                        <div className={`text-xs truncate ${index === selectedIndex
                                                ? isDark ? "text-black/60" : "text-white/60"
                                                : isDark ? "text-gray-500" : "text-gray-400"
                                            }`}>
                                            {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

// Helper function to render message with highlighted @mentions
export function renderMessageWithMentions(
    message: string,
    isDark: boolean,
    onMentionClick?: (username: string) => void
): React.ReactNode {
    // Match @username patterns
    const mentionRegex = /@([a-zA-Z0-9_]+|0x[a-fA-F0-9]{4,}\.{3}[a-fA-F0-9]{4})/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(message)) !== null) {
        // Add text before mention
        if (match.index > lastIndex) {
            parts.push(message.slice(lastIndex, match.index))
        }

        // Add highlighted mention
        const username = match[1]
        parts.push(
            <span
                key={match.index}
                onClick={() => onMentionClick?.(username)}
                className={`px-1 rounded cursor-pointer font-medium ${isDark
                        ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
            >
                @{username}
            </span>
        )

        lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < message.length) {
        parts.push(message.slice(lastIndex))
    }

    return parts.length > 0 ? parts : message
}
