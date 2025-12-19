import { describe, it, expect } from 'vitest'
import { sanitizeChatMessage, sanitizeUsername, sanitizeText, sanitizeWalletAddress } from '@/lib/sanitize'

describe('sanitizeText', () => {
    it('should escape HTML angle brackets', () => {
        const input = '<script>alert("xss")</script>'
        const result = sanitizeText(input)
        expect(result).toContain('&lt;')
        expect(result).toContain('&gt;')
        expect(result).not.toContain('<script>')
    })

    it('should escape ampersand', () => {
        const input = '10 & 20'
        const result = sanitizeText(input)
        expect(result).toContain('&amp;')
    })

    it('should remove event handlers', () => {
        const input = 'onclick=alert(1)'
        const result = sanitizeText(input)
        expect(result).not.toContain('onclick=')
    })

    it('should remove javascript: protocol', () => {
        const input = 'javascript:alert(1)'
        const result = sanitizeText(input)
        expect(result).not.toContain('javascript:')
    })
})

describe('sanitizeChatMessage', () => {
    it('should escape HTML tags', () => {
        const input = '<script>alert("xss")</script>'
        const result = sanitizeChatMessage(input)
        expect(result).not.toContain('<script>')
        expect(result).toContain('&lt;')
    })

    it('should remove onerror= event handler', () => {
        const input = '<img src="x" onerror="alert(1)">'
        const result = sanitizeChatMessage(input)
        expect(result).not.toContain('onerror=')
    })

    it('should preserve alphanumeric text', () => {
        const input = 'Hello world 123'
        const result = sanitizeChatMessage(input)
        expect(result).toBe(input)
    })

    it('should escape special characters', () => {
        const input = 'Price is $100 & includes 10% tax'
        const result = sanitizeChatMessage(input)
        expect(result).toContain('&amp;')
    })

    it('should trim whitespace', () => {
        const input = '   Hello world   '
        const result = sanitizeChatMessage(input)
        expect(result).toBe('Hello world')
    })

    it('should handle empty strings', () => {
        const result = sanitizeChatMessage('')
        expect(result).toBe('')
    })

    it('should truncate very long messages', () => {
        const input = 'a'.repeat(600)
        const result = sanitizeChatMessage(input)
        expect(result.length).toBeLessThanOrEqual(503) // 500 + "..."
    })
})

describe('sanitizeUsername', () => {
    it('should preserve valid usernames', () => {
        const input = 'CryptoKing_123'
        const result = sanitizeUsername(input)
        expect(result).toBe(input)
    })

    it('should remove HTML tags from usernames', () => {
        const input = '<b>BoldUser</b>'
        const result = sanitizeUsername(input)
        // After escaping: &lt;b&gt;BoldUser&lt;/b&gt;
        // After alphanumeric filter: ltbgtBoldUserltbgt
        expect(result).not.toContain('<')
        expect(result).not.toContain('>')
        expect(result).toContain('BoldUser')
    })

    it('should handle wallet address format', () => {
        const input = '0x1234...5678'
        const result = sanitizeUsername(input)
        expect(result).toContain('0x1234')
    })

    it('should trim whitespace', () => {
        const input = '  Username  '
        const result = sanitizeUsername(input)
        expect(result).toBe('Username')
    })

    it('should return Anonymous for empty input', () => {
        const result = sanitizeUsername('')
        expect(result).toBe('Anonymous')
    })

    it('should limit username length', () => {
        const input = 'a'.repeat(50)
        const result = sanitizeUsername(input)
        expect(result.length).toBeLessThanOrEqual(30)
    })
})

describe('sanitizeWalletAddress', () => {
    it('should accept valid Ethereum addresses', () => {
        const input = '0x742d35Cc6634C0532925a3b844Bc9e7595f8bDeF'
        const result = sanitizeWalletAddress(input)
        expect(result).toBe(input.toLowerCase())
    })

    it('should reject invalid addresses', () => {
        const input = 'not-a-wallet'
        const result = sanitizeWalletAddress(input)
        expect(result).toBe('')
    })

    it('should reject short addresses', () => {
        const input = '0x1234'
        const result = sanitizeWalletAddress(input)
        expect(result).toBe('')
    })

    it('should return empty for empty input', () => {
        const result = sanitizeWalletAddress('')
        expect(result).toBe('')
    })
})
