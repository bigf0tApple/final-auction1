"use client"

import { useState, useEffect, useCallback } from "react"

interface NotificationOptions {
    title: string
    body: string
    icon?: string
    tag?: string
    requireInteraction?: boolean
}

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>("default")
    const [isSupported, setIsSupported] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)

    // Check if notifications are supported
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setIsSupported(true)
            setPermission(Notification.permission)
        }

        // Load sound preference from localStorage
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("arpo_sound_enabled")
            if (saved !== null) {
                setSoundEnabled(JSON.parse(saved))
            }
        }
    }, [])

    // Request permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) return false

        try {
            const result = await Notification.requestPermission()
            setPermission(result)
            return result === "granted"
        } catch (error) {
            console.error("Error requesting notification permission:", error)
            return false
        }
    }, [isSupported])

    // Send a notification
    const sendNotification = useCallback(
        (options: NotificationOptions): Notification | null => {
            if (!isSupported || permission !== "granted") {
                return null
            }

            try {
                const notification = new Notification(options.title, {
                    body: options.body,
                    icon: options.icon || "/arpo-logo.png",
                    tag: options.tag,
                    requireInteraction: options.requireInteraction || false,
                })

                // Play sound if enabled
                if (soundEnabled) {
                    playNotificationSound()
                }

                return notification
            } catch (error) {
                console.error("Error sending notification:", error)
                return null
            }
        },
        [isSupported, permission, soundEnabled]
    )

    // Toggle sound
    const toggleSound = useCallback(() => {
        const newValue = !soundEnabled
        setSoundEnabled(newValue)
        if (typeof window !== "undefined") {
            localStorage.setItem("arpo_sound_enabled", JSON.stringify(newValue))
        }
    }, [soundEnabled])

    // Play notification sound
    const playNotificationSound = useCallback(() => {
        if (typeof window === "undefined") return

        try {
            // Create a simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.value = 800 // Hz
            oscillator.type = "sine"
            gainNode.gain.value = 0.1 // Volume

            oscillator.start()
            oscillator.stop(audioContext.currentTime + 0.15) // Duration
        } catch (error) {
            console.warn("Could not play notification sound:", error)
        }
    }, [])

    // Specific notification helpers
    const notifyOutbid = useCallback(
        (auctionName: string, newBid: string) => {
            return sendNotification({
                title: "You've been outbid!",
                body: `Someone bid ${newBid} on ${auctionName}`,
                tag: "outbid",
                requireInteraction: true,
            })
        },
        [sendNotification]
    )

    const notifyAuctionEnding = useCallback(
        (auctionName: string, minutesLeft: number) => {
            return sendNotification({
                title: "Auction ending soon!",
                body: `${auctionName} ends in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}`,
                tag: "auction-ending",
            })
        },
        [sendNotification]
    )

    const notifyWinner = useCallback(
        (auctionName: string) => {
            return sendNotification({
                title: "🎉 Congratulations! You won!",
                body: `You are the winner of ${auctionName}`,
                tag: "auction-won",
                requireInteraction: true,
            })
        },
        [sendNotification]
    )

    const notifyBidPlaced = useCallback(
        (amount: string, symbol: string) => {
            return sendNotification({
                title: "Bid confirmed!",
                body: `Your bid of ${amount} ${symbol} was placed successfully`,
                tag: "bid-placed",
            })
        },
        [sendNotification]
    )

    return {
        isSupported,
        permission,
        soundEnabled,
        requestPermission,
        sendNotification,
        toggleSound,
        playNotificationSound,
        notifyOutbid,
        notifyAuctionEnding,
        notifyWinner,
        notifyBidPlaced,
    }
}
