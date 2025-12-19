"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, X } from "lucide-react"

interface ToastNotificationProps {
    message: string
    type: "success" | "error" | "info"
    onClose: () => void
    duration?: number
}

export default function ToastNotification({
    message,
    type,
    onClose,
    duration = 3000
}: ToastNotificationProps) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onClose, 200)
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const iconMap = {
        success: <CheckCircle className="h-4 w-4 text-green-500" />,
        error: <AlertCircle className="h-4 w-4 text-red-500" />,
        info: <CheckCircle className="h-4 w-4 text-blue-500" />,
    }

    const bgMap = {
        success: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700",
        error: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700",
        info: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700",
    }

    return (
        <div
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60] transition-all duration-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
        >
            <div
                className={`
                    ${bgMap[type]}
                    border rounded-lg px-4 py-2.5 shadow-lg
                    flex items-center gap-2.5
                    text-sm font-medium
                    text-gray-800 dark:text-gray-100
                    min-w-[180px] max-w-[320px]
                `}
            >
                {iconMap[type]}
                <span className="flex-1">{message}</span>
                <button
                    onClick={() => {
                        setIsVisible(false)
                        setTimeout(onClose, 200)
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}
