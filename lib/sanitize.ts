/**
 * XSS Sanitization Utilities
 * Prevents cross-site scripting attacks in user-generated content
 */

/**
 * Sanitize a string to prevent XSS attacks
 * Escapes HTML entities and removes dangerous patterns
 * @param input The untrusted user input
 * @returns Sanitized string safe for display
 */
export function sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
        return ''
    }

    // Escape HTML entities
    const htmlEntities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
    }

    let sanitized = input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char)

    // Remove common XSS attack patterns
    sanitized = sanitized
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+=/gi, '') // Remove onclick=, onerror=, etc.

    return sanitized
}

/**
 * Sanitize a chat message
 * Allows some formatting but prevents XSS
 * @param message The chat message to sanitize
 * @returns Sanitized message
 */
export function sanitizeChatMessage(message: string): string {
    if (!message || typeof message !== 'string') {
        return ''
    }

    // First apply basic sanitization
    let sanitized = sanitizeText(message)

    // Trim to reasonable length (prevent spam)
    const MAX_MESSAGE_LENGTH = 500
    if (sanitized.length > MAX_MESSAGE_LENGTH) {
        sanitized = sanitized.substring(0, MAX_MESSAGE_LENGTH) + '...'
    }

    // Allow some safe emoji patterns to pass through
    // (they were escaped by sanitizeText but are safe)

    return sanitized.trim()
}

/**
 * Sanitize a username/display name
 * More restrictive than chat messages
 * @param name The username to sanitize
 * @returns Sanitized username
 */
export function sanitizeUsername(name: string): string {
    if (!name || typeof name !== 'string') {
        return 'Anonymous'
    }

    // Remove all HTML/special chars, keep alphanumeric, spaces, underscores
    let sanitized = sanitizeText(name)

    // Only allow safe characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9_\-.\s]/g, '')

    // Trim length
    const MAX_USERNAME_LENGTH = 30
    if (sanitized.length > MAX_USERNAME_LENGTH) {
        sanitized = sanitized.substring(0, MAX_USERNAME_LENGTH)
    }

    return sanitized.trim() || 'Anonymous'
}

/**
 * Sanitize a wallet address
 * Validates Ethereum address format
 * @param address The wallet address
 * @returns Sanitized address or empty string if invalid
 */
export function sanitizeWalletAddress(address: string): string {
    if (!address || typeof address !== 'string') {
        return ''
    }

    // Ethereum addresses: 0x followed by 40 hex chars
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/

    const trimmed = address.trim()
    if (ethAddressRegex.test(trimmed)) {
        return trimmed.toLowerCase() // Normalize to lowercase
    }

    return ''
}
