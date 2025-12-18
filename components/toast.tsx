"use client"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info, Bell } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (message: string, type?: ToastType, duration?: number) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}

interface ToastProviderProps {
    children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((message: string, type: ToastType = "info", duration: number = 4000) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setToasts((prev) => [...prev, { id, message, type, duration }])
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

interface ToastContainerProps {
    toasts: Toast[]
    removeToast: (id: string) => void
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}

interface ToastItemProps {
    toast: Toast
    onRemove: () => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(onRemove, toast.duration)
            return () => clearTimeout(timer)
        }
    }, [toast.duration, onRemove])

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-400" />,
        error: <AlertCircle className="h-5 w-5 text-red-400" />,
        info: <Info className="h-5 w-5 text-blue-400" />,
        warning: <Bell className="h-5 w-5 text-yellow-400" />,
    }

    const colors = {
        success: "border-green-500/50 bg-green-950/90",
        error: "border-red-500/50 bg-red-950/90",
        info: "border-blue-500/50 bg-blue-950/90",
        warning: "border-yellow-500/50 bg-yellow-950/90",
    }

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg animate-in slide-in-from-right-5 ${colors[toast.type]}`}
            role="alert"
        >
            {icons[toast.type]}
            <p className="flex-1 text-sm text-white">{toast.message}</p>
            <button
                onClick={onRemove}
                className="text-white/60 hover:text-white transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}

// Standalone toast function for simple usage
let toastFn: ((message: string, type?: ToastType, duration?: number) => void) | null = null

export function setToastFunction(fn: typeof toastFn) {
    toastFn = fn
}

export function toast(message: string, type: ToastType = "info", duration: number = 4000) {
    if (toastFn) {
        toastFn(message, type, duration)
    } else {
        console.warn("Toast provider not initialized")
    }
}
