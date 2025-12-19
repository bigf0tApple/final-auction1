import { describe, it, expect } from 'vitest'
import {
    getTimeRemaining,
    getAuctionStatusWithTime,
    resolveAuctionSchedule,
    type AuctionEvent,
} from '@/lib/auction-data'
import { DEFAULT_ACCEPTED_TOKEN } from '@/types/accepted-token'

// Helper to create test auctions
const createAuction = (overrides: Partial<AuctionEvent> & { id: number }): AuctionEvent => ({
    title: 'Test Auction',
    artist: 'Test Artist',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    startingBid: '1 ETH',
    status: 'upcoming',
    acceptedToken: DEFAULT_ACCEPTED_TOKEN,
    ...overrides,
})

describe('getTimeRemaining', () => {
    it('should return positive time for future end time', () => {
        const endTime = new Date(Date.now() + 60000) // 1 minute from now
        const result = getTimeRemaining(endTime)
        expect(result.totalSeconds).toBeGreaterThan(0)
        expect(result.seconds).toBeGreaterThanOrEqual(0)
        expect(result.minutes).toBeGreaterThanOrEqual(0)
    })

    it('should return zero for past end time', () => {
        const endTime = new Date(Date.now() - 60000) // 1 minute ago
        const result = getTimeRemaining(endTime)
        expect(result.totalSeconds).toBe(0)
        expect(result.seconds).toBe(0)
        expect(result.minutes).toBe(0)
        expect(result.hours).toBe(0)
        expect(result.days).toBe(0)
    })

    it('should correctly calculate hours', () => {
        const now = new Date()
        const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
        const result = getTimeRemaining(endTime, now)
        expect(result.hours).toBe(2)
    })

    it('should correctly calculate days', () => {
        const now = new Date()
        const endTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
        const result = getTimeRemaining(endTime, now)
        expect(result.days).toBe(3)
    })
})

describe('getAuctionStatusWithTime', () => {
    it('should return "Ended" for past auction', () => {
        const auction = createAuction({
            id: 1,
            startTime: new Date(Date.now() - 7200000), // 2 hours ago
            endTime: new Date(Date.now() - 3600000),   // 1 hour ago
            status: 'ended',
        })
        const result = getAuctionStatusWithTime(auction)
        expect(result).toBe('Ended')
    })

    it('should return time-based status for upcoming auction', () => {
        const auction = createAuction({
            id: 1,
            startTime: new Date(Date.now() + 3600000), // 1 hour from now
            endTime: new Date(Date.now() + 7200000),   // 2 hours from now
            status: 'upcoming',
        })
        const result = getAuctionStatusWithTime(auction)
        expect(result).toContain('Starting')
    })

    it('should show live status when auction is active', () => {
        const now = new Date()
        const auction = createAuction({
            id: 1,
            startTime: new Date(now.getTime() - 1800000), // 30 min ago
            endTime: new Date(now.getTime() + 1800000),   // 30 min from now
            status: 'live',
        })
        const result = getAuctionStatusWithTime(auction, now, auction.id)
        expect(result).toContain('Live')
    })
})

describe('resolveAuctionSchedule', () => {
    it('should find active auction', () => {
        const now = new Date()
        const auctions = [
            createAuction({
                id: 1,
                startTime: new Date(now.getTime() - 1800000), // 30 min ago
                endTime: new Date(now.getTime() + 1800000),   // 30 min from now
                status: 'live',
            }),
        ]
        const result = resolveAuctionSchedule(auctions, now)
        expect(result.activeAuction).not.toBeNull()
        expect(result.activeAuction?.id).toBe(1)
    })

    it('should detect overlapping auctions', () => {
        const now = new Date()
        const auctions = [
            createAuction({
                id: 1,
                startTime: new Date(now.getTime() + 3600000),  // 1 hour
                endTime: new Date(now.getTime() + 7200000),    // 2 hours
            }),
            createAuction({
                id: 2,
                startTime: new Date(now.getTime() + 3700000),  // Overlaps with first (within buffer)
                endTime: new Date(now.getTime() + 10800000),
            }),
        ]
        const result = resolveAuctionSchedule(auctions, now)
        expect(result.hasOverlap).toBe(true)
    })

    it('should handle empty array', () => {
        const result = resolveAuctionSchedule([])
        expect(result.activeAuction).toBeNull()
        expect(result.nextAuction).toBeNull()
        expect(result.upcomingQueue).toEqual([])
    })

    it('should return null activeAuction when no auction is live', () => {
        const now = new Date()
        const auctions = [
            createAuction({
                id: 1,
                title: 'Past',
                startTime: new Date(now.getTime() - 7200000),
                endTime: new Date(now.getTime() - 3600000),
                status: 'ended',
            }),
        ]
        const result = resolveAuctionSchedule(auctions, now)
        expect(result.activeAuction).toBeNull()
    })
})
