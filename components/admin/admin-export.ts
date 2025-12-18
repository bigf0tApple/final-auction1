/**
 * Admin Export Utilities
 * Functions for exporting chat history and other data
 */

interface ChatHistoryMessage {
    date: string
    dayName: string
    userAddress: string
    username: string
    message: string
    timestamp: string
    userBadge: string
    messageType: string
    warningLevel: string
    actionTaken: string
    ipAddress: string
    sessionId: string
}

interface ChatHistoryDay {
    date: string
    dayName: string
    messageCount: number
}

/**
 * Generate sample messages for export (mock data)
 * In production, this would fetch from Supabase
 */
function generateSampleMessages(date: string, dayName: string): ChatHistoryMessage[] {
    return [
        {
            date,
            dayName,
            userAddress: "0x1234...5678",
            username: "CryptoArt_Fan",
            message: "This artwork is absolutely stunning! Love the neon aesthetic.",
            timestamp: "08:15:30",
            userBadge: "Eager Bidder",
            messageType: "normal",
            warningLevel: "0",
            actionTaken: "none",
            ipAddress: "192.168.1.100",
            sessionId: "sess_abc123"
        },
        {
            date,
            dayName,
            userAddress: "artlover.eth",
            username: "Digital_Dreams",
            message: "When does the bidding end? Want to place my final bid.",
            timestamp: "10:22:45",
            userBadge: "Pro Bidder",
            messageType: "normal",
            warningLevel: "0",
            actionTaken: "none",
            ipAddress: "10.0.0.25",
            sessionId: "sess_def456"
        },
        {
            date,
            dayName,
            userAddress: "0x9876...4321",
            username: "Spam_User",
            message: "Check out my private key sharing site!",
            timestamp: "14:10:15",
            userBadge: "New Bidder",
            messageType: "flagged",
            warningLevel: "3",
            actionTaken: "banned_24h",
            ipAddress: "203.45.67.89",
            sessionId: "sess_ghi789"
        },
        {
            date,
            dayName,
            userAddress: "0x5555...9999",
            username: "Whale_Collector",
            message: "Placing MAX PAIN - going all in on this one!",
            timestamp: "16:35:20",
            userBadge: "Legendary Bidder",
            messageType: "max_pain",
            warningLevel: "0",
            actionTaken: "none",
            ipAddress: "172.16.0.10",
            sessionId: "sess_jkl012"
        },
        {
            date,
            dayName,
            userAddress: "0x7777...3333",
            username: "Profanity_User",
            message: "This is amazing art!",
            timestamp: "18:45:10",
            userBadge: "Active Bidder",
            messageType: "warning",
            warningLevel: "1",
            actionTaken: "warned",
            ipAddress: "192.168.50.75",
            sessionId: "sess_mno345"
        }
    ]
}

/**
 * Export chat history to CSV file
 * @param selectedDays Array of date strings to export
 * @param chatHistory Full chat history data
 */
export function exportChatHistoryToCSV(
    selectedDays: string[],
    chatHistory: ChatHistoryDay[]
): void {
    if (selectedDays.length === 0) {
        alert("Please select days to export")
        return
    }

    const csvHeaders = [
        "Date",
        "Day_Name",
        "User_Address",
        "Username",
        "Message",
        "Timestamp",
        "User_Badge",
        "Message_Type",
        "Warning_Level",
        "Action_Taken",
        "IP_Address",
        "Session_ID"
    ]

    const csvRows = selectedDays.flatMap((date) => {
        const dayData = chatHistory.find(day => day.date === date)
        if (!dayData) return []

        const messages = generateSampleMessages(date, dayData.dayName)

        return messages.map(msg => [
            msg.date,
            msg.dayName,
            msg.userAddress,
            msg.username,
            `"${msg.message.replace(/"/g, '""')}"`,
            msg.timestamp,
            msg.userBadge,
            msg.messageType,
            msg.warningLevel,
            msg.actionTaken,
            msg.ipAddress,
            msg.sessionId
        ].join(","))
    })

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ARPO_Chat_Export_${selectedDays.length}_Days_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    alert(`Successfully exported chat history for ${selectedDays.length} selected days to CSV file.`)
}

/**
 * Export users data to CSV
 * @param users Array of user data to export
 */
export function exportUsersToCSV(users: { address: string; totalBids: number; status: string }[]): void {
    const csvHeaders = ["Address", "Total_Bids", "Status"]
    const csvRows = users.map(u => [u.address, u.totalBids, u.status].join(","))
    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ARPO_Users_Export_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    alert(`Successfully exported ${users.length} users to CSV file.`)
}
