"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
    getAuctionChat,
    sendChatMessage,
    subscribeToChatMessages,
    checkSupabaseConnection,
    type ChatMessage,
} from "@/lib/supabase"

interface UseSupabaseChatResult {
    // Data
    messages: ChatMessage[]
    isLoading: boolean
    isConnected: boolean

    // Actions
    sendMessage: (message: string) => Promise<boolean>
    refreshMessages: () => Promise<void>
}

export function useSupabaseChat(
    auctionId: number | null,
    userWallet: string | null,
    displayName: string
): UseSupabaseChatResult {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isConnected, setIsConnected] = useState(false)
    const subscriptionRef = useRef<ReturnType<typeof subscribeToChatMessages> | null>(null)

    // Check connection and load messages
    useEffect(() => {
        async function init() {
            const connected = await checkSupabaseConnection()
            setIsConnected(connected)

            if (connected && auctionId) {
                await loadMessages(auctionId)
            } else {
                setIsLoading(false)
            }
        }
        init()
    }, [auctionId])

    // Subscribe to real-time messages
    useEffect(() => {
        if (!isConnected || !auctionId) return

        // Clean up previous subscription
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe()
        }

        // Subscribe to new messages
        subscriptionRef.current = subscribeToChatMessages(auctionId, (newMessage) => {
            setMessages((prev) => {
                // Avoid duplicates
                if (prev.some((m) => m.id === newMessage.id)) {
                    return prev
                }
                return [...prev, newMessage]
            })
        })

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe()
            }
        }
    }, [isConnected, auctionId])

    const loadMessages = async (id: number) => {
        setIsLoading(true)
        try {
            const chatMessages = await getAuctionChat(id)
            setMessages(chatMessages)
        } catch (error) {
            console.error("Error loading chat messages:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const refreshMessages = useCallback(async () => {
        if (isConnected && auctionId) {
            await loadMessages(auctionId)
        }
    }, [isConnected, auctionId])

    const sendMessage = useCallback(
        async (message: string): Promise<boolean> => {
            if (!isConnected || !auctionId || !userWallet) {
                console.warn("Cannot send message: not connected or missing data")
                return false
            }

            try {
                const result = await sendChatMessage(auctionId, userWallet, displayName, message)
                return result !== null
            } catch (error) {
                console.error("Error sending message:", error)
                return false
            }
        },
        [isConnected, auctionId, userWallet, displayName]
    )

    return {
        messages,
        isLoading,
        isConnected,
        sendMessage,
        refreshMessages,
    }
}
