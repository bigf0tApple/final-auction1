"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, Loader2, ExternalLink, AlertCircle, RefreshCw } from "lucide-react"

type TransactionStatus = "pending" | "confirming" | "success" | "error"

interface TransactionModalProps {
    isOpen: boolean
    onClose: () => void
    isDark: boolean
    status: TransactionStatus
    title: string
    description?: string
    txHash?: string
    errorMessage?: string
    onRetry?: () => void
}

export default function TransactionModal({
    isOpen,
    onClose,
    isDark,
    status,
    title,
    description,
    txHash,
    errorMessage,
    onRetry,
}: TransactionModalProps) {
    if (!isOpen) return null

    const explorerUrl = `https://sepolia.basescan.org/tx/${txHash}`

    const statusConfig = {
        pending: {
            icon: <Loader2 className="h-16 w-16 animate-spin" />,
            iconColor: isDark ? "text-white" : "text-black",
            heading: "Waiting for confirmation...",
            subtext: "Please confirm the transaction in your wallet",
        },
        confirming: {
            icon: <Loader2 className="h-16 w-16 animate-spin" />,
            iconColor: isDark ? "text-white" : "text-black",
            heading: "Transaction submitted",
            subtext: "Waiting for blockchain confirmation...",
        },
        success: {
            icon: <CheckCircle className="h-16 w-16" />,
            iconColor: "text-green-500",
            heading: "Transaction confirmed!",
            subtext: "Your transaction was successful",
        },
        error: {
            icon: <AlertCircle className="h-16 w-16" />,
            iconColor: "text-red-500",
            heading: "Transaction failed",
            subtext: errorMessage || "Something went wrong",
        },
    }

    const config = statusConfig[status]

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
                className={`${isDark ? "bg-black text-white border-white" : "bg-white text-black border-black"
                    } border-2 rounded-2xl max-w-md w-full p-6`}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{title}</h2>
                    {(status === "success" || status === "error") && (
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            className={`p-1 ${isDark ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Status Icon */}
                <div className="flex flex-col items-center text-center py-8">
                    <div className={config.iconColor}>{config.icon}</div>
                    <h3 className="text-lg font-semibold mt-4">{config.heading}</h3>
                    <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {config.subtext}
                    </p>
                    {description && (
                        <p className={`text-sm mt-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {description}
                        </p>
                    )}
                </div>

                {/* Transaction Hash */}
                {txHash && (
                    <div
                        className={`p-3 rounded-lg mb-4 ${isDark ? "bg-gray-900 border border-gray-700" : "bg-gray-100 border border-gray-200"
                            }`}
                    >
                        <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} mb-1`}>
                            Transaction Hash
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-mono ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                {txHash.slice(0, 10)}...{txHash.slice(-8)}
                            </span>
                            <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1 text-xs ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                                    }`}
                            >
                                View on Basescan
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {status === "error" && onRetry && (
                        <Button
                            onClick={onRetry}
                            className={`flex-1 ${isDark
                                    ? "bg-white text-black hover:bg-gray-200"
                                    : "bg-black text-white hover:bg-gray-800"
                                }`}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    )}
                    {(status === "success" || status === "error") && (
                        <Button
                            onClick={onClose}
                            className={`flex-1 border-2 ${isDark
                                    ? "bg-black text-white border-white hover:bg-white hover:text-black"
                                    : "bg-white text-black border-black hover:bg-black hover:text-white"
                                }`}
                        >
                            {status === "success" ? "Done" : "Close"}
                        </Button>
                    )}
                </div>

                {/* Pending state helper text */}
                {(status === "pending" || status === "confirming") && (
                    <p className={`text-xs text-center mt-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {status === "pending"
                            ? "Check your wallet for a pending transaction"
                            : "This usually takes 1-2 seconds on Base Sepolia"}
                    </p>
                )}
            </div>
        </div>
    )
}
