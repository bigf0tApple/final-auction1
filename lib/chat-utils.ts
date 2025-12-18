/**
 * Chat Message Utilities
 * Helper functions for creating system messages and chat operations
 */

export interface ChatMessage {
    id: string
    user: string
    message: string
    timestamp: Date
    userBadge: string
    badgeColor: string
}

/**
 * Create a system message object
 * @param message The message text
 * @param type The message type (success, error, warning, info)
 */
export function createSystemMessage(
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
): ChatMessage {
    const colorMap = {
        success: "bg-green-500",
        error: "bg-red-500",
        warning: "bg-yellow-500",
        info: "bg-gray-500",
    }

    return {
        id: Date.now().toString(),
        user: "System",
        message,
        timestamp: new Date(),
        userBadge: "System",
        badgeColor: colorMap[type],
    }
}

/**
 * Create a user message object
 * @param user Username
 * @param message The message text
 * @param badge User badge text
 * @param badgeColor Badge background color class
 */
export function createUserMessage(
    user: string,
    message: string,
    badge: string = "User",
    badgeColor: string = "bg-blue-500"
): ChatMessage {
    return {
        id: Date.now().toString(),
        user,
        message,
        timestamp: new Date(),
        userBadge: badge,
        badgeColor,
    }
}

/**
 * User badge tiers based on bid count
 */
export const USER_BADGE_TIERS = [
    { minBids: 0, badge: "New Bidder", color: "bg-gray-500" },
    { minBids: 3, badge: "Eager Bidder", color: "bg-blue-500" },
    { minBids: 10, badge: "Active Bidder", color: "bg-green-500" },
    { minBids: 25, badge: "Pro Bidder", color: "bg-purple-500" },
    { minBids: 50, badge: "Legendary Bidder", color: "bg-yellow-500" },
] as const

/**
 * Get user badge based on bid count
 * @param bidCount Number of bids placed
 */
export function getUserBadgeForBidCount(bidCount: number): { badge: string; color: string } {
    for (let i = USER_BADGE_TIERS.length - 1; i >= 0; i--) {
        if (bidCount >= USER_BADGE_TIERS[i].minBids) {
            return {
                badge: USER_BADGE_TIERS[i].badge,
                color: USER_BADGE_TIERS[i].color
            }
        }
    }
    return { badge: "New Bidder", color: "bg-gray-500" }
}

/**
 * Blocked words list for content filtering
 * These words will trigger warnings when used in chat
 */
export const BLOCKED_WORDS = [
    "nsfw",
    "xxx",
    "porn",
    "sex",
    "nude",
    "naked",
    "onlyfans",
    "cock",
    "dick",
    "pussy",
    "penis",
    "vagina",
    "asshole",
    "bitch",
    "cunt",
    "slut",
    "whore",
    "nigger",
    "nigga",
    "faggot",
    "retard",
    "kys",
    "kill yourself",
    "suicide",
]

/**
 * Check if a message contains blocked content
 * @param message The message to check
 * @returns Object with isBlocked and reason
 */
export function checkBlockedContent(message: string): { isBlocked: boolean; reason?: string } {
    const lowerMessage = message.toLowerCase()

    for (const word of BLOCKED_WORDS) {
        if (lowerMessage.includes(word)) {
            return { isBlocked: true, reason: `Detected blocked word: "${word}"` }
        }
    }

    return { isBlocked: false }
}

/**
 * Format a timestamp for display
 * @param date The date to format
 */
export function formatChatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/**
 * Rate limiting constants
 */
export const RATE_LIMIT = {
    MAX_MESSAGES_PER_MINUTE: 5,
    COOLDOWN_SECONDS: 60,
} as const
