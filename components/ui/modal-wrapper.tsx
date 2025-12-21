"use client"

import { ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModalWrapperProps {
    /** Modal content */
    children: ReactNode
    /** Close handler */
    onClose: () => void
    /** Modal title (optional) */
    title?: string
    /** Show close button (default: true) */
    showCloseButton?: boolean
    /** Max width class (default: max-w-4xl) */
    maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl" | "max-w-2xl" | "max-w-3xl" | "max-w-4xl" | "max-w-5xl" | "max-w-6xl" | "max-w-7xl"
    /** Max height class (default: max-h-[90vh]) */
    maxHeight?: string
    /** Additional className for content wrapper */
    className?: string
    /** Z-index (default: z-50) */
    zIndex?: "z-40" | "z-50" | "z-60"
    /** Whether clicking backdrop closes modal (default: true) */
    closeOnBackdropClick?: boolean
}

/**
 * Reusable Modal Wrapper Component
 * Provides consistent modal styling across the application
 */
export default function ModalWrapper({
    children,
    onClose,
    title,
    showCloseButton = true,
    maxWidth = "max-w-4xl",
    maxHeight = "max-h-[90vh]",
    className = "",
    zIndex = "z-50",
    closeOnBackdropClick = true,
}: ModalWrapperProps) {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${zIndex}`}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div
                className={`
                    bg-white dark:bg-[#000000] 
                    border border-black dark:border-white 
                    rounded-2xl 
                    ${maxWidth} w-full mx-4 
                    ${maxHeight} overflow-y-auto
                    ${className}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with title and close button */}
                {(title || showCloseButton) && (
                    <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
                        {title && (
                            <h2
                                id="modal-title"
                                className="text-xl sm:text-2xl font-bold text-black dark:text-white"
                            >
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <Button
                                onClick={onClose}
                                variant="outline"
                                size="icon"
                                className="bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg ml-auto"
                                aria-label="Close modal"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className={title || showCloseButton ? "p-3 sm:p-4" : ""}>
                    {children}
                </div>
            </div>
        </div>
    )
}

/**
 * Simpler modal without header - just backdrop and card
 */
export function SimpleModal({
    children,
    onClose,
    maxWidth = "max-w-4xl",
    className = "",
    closeOnBackdropClick = true,
}: Omit<ModalWrapperProps, "title" | "showCloseButton" | "maxHeight" | "zIndex">) {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div
                className={`
                    bg-white dark:bg-[#000000] 
                    border border-black dark:border-white 
                    rounded-2xl p-4
                    ${maxWidth} w-full mx-4
                    ${className}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    )
}
