"use client"


import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, User, Camera, Check, Twitter, Instagram } from "lucide-react"

interface UserProfileModalProps {
    isDark: boolean
    connectedWallet: string
    currentUsername?: string
    currentAvatar?: string
    currentBio?: string
    currentTwitter?: string
    currentInstagram?: string
    onSave: (username: string, avatarUrl: string | null, bio?: string, twitter?: string, instagram?: string) => void
    onClose: () => void
    isFirstTime?: boolean
}

export default function UserProfileModal({
    isDark,
    connectedWallet,
    currentUsername = "",
    currentAvatar,
    currentBio = "",
    currentTwitter = "",
    currentInstagram = "",
    onSave,
    onClose,
    isFirstTime = false,
}: UserProfileModalProps) {
    const [username, setUsername] = useState(currentUsername)
    const [bio, setBio] = useState(currentBio)
    const [twitter, setTwitter] = useState(currentTwitter)
    const [instagram, setInstagram] = useState(currentInstagram)

    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatar || null)
    const [error, setError] = useState<string | null>(null)
    const [isChecking, setIsChecking] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Username validation
    const validateUsername = (name: string): string | null => {
        if (name.length < 3) return "Username must be at least 3 characters"
        if (name.length > 20) return "Username must be 20 characters or less"
        if (!/^[a-zA-Z0-9_]+$/.test(name)) return "Only letters, numbers, and underscores allowed"
        return null
    }

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setUsername(value)
        if (value) {
            const validationError = validateUsername(value)
            setError(validationError)
        } else {
            setError(null)
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError("Image must be less than 2MB")
                return
            }
            // Validate file type
            if (!file.type.startsWith("image/")) {
                setError("Please select an image file")
                return
            }

            // Create preview URL
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
                setError(null)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        if (!username) {
            setError("Username is required")
            return
        }

        const validationError = validateUsername(username)
        if (validationError) {
            setError(validationError)
            return
        }

        setIsChecking(true)

        // Simulate checking username availability (will be real API later)
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check localStorage for existing usernames
        const existingUsers = JSON.parse(localStorage.getItem("arpo_users") || "{}")
        const usernameExists = Object.values(existingUsers).some(
            (user: unknown) => (user as { username: string }).username?.toLowerCase() === username.toLowerCase()
                && (user as { wallet: string }).wallet?.toLowerCase() !== connectedWallet.toLowerCase()
        )

        if (usernameExists) {
            setError("Username already taken")
            setIsChecking(false)
            return
        }

        // Save to localStorage (will be Supabase later)
        // Hook handles the actual saving logic now

        setIsChecking(false)
        onSave(username, avatarPreview, bio, twitter, instagram)
    }

    const shortWallet = `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}`

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-10">
            <div
                className={`relative w-full max-w-md mx-4 p-6 rounded-2xl border-2 shadow-2xl ${isDark ? "bg-black border-white" : "bg-white border-black"
                    }`}
            >
                {/* Close button */}
                {!isFirstTime && (
                    <button
                        onClick={onClose}
                        className={`absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 ${isDark ? "text-white" : "text-black"
                            }`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                        {isFirstTime ? "Welcome to ARPO Studio!" : "Edit Profile"}
                    </h2>
                    <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {isFirstTime
                            ? "Set up your profile to get started"
                            : `Connected: ${shortWallet}`}
                    </p>
                </div>

                {/* Avatar Section */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <button
                            onClick={handleAvatarClick}
                            className={`w-24 h-24 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all hover:scale-105 ${isDark ? "border-white bg-gray-900" : "border-black bg-gray-100"
                                }`}
                        >
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className={`h-12 w-12 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                            )}
                        </button>
                        <div
                            className={`absolute bottom-0 right-0 p-1.5 rounded-full border-2 ${isDark ? "bg-white text-black border-black" : "bg-black text-white border-white"
                                }`}
                        >
                            <Camera className="h-3 w-3" />
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Username Input */}
                <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-black"}`}>
                        Username
                    </label>
                    <Input
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder="Enter your username"
                        maxLength={20}
                        className={`${isDark
                            ? "bg-gray-900 border-white text-white placeholder-gray-500"
                            : "bg-gray-50 border-black text-black placeholder-gray-400"
                            } ${error ? "border-red-500" : ""}`}
                    />
                    <div className="flex justify-between mt-1">
                        <span className={`text-xs ${error ? "text-red-500" : isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {error || "Letters, numbers, and underscores only"}
                        </span>
                        <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {username.length}/20
                        </span>
                    </div>
                </div>

                {/* Bio Input */}
                <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-black"}`}>
                        Bio
                    </label>
                    <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        maxLength={160}
                        className={`resize-none h-24 ${isDark
                            ? "bg-gray-900 border-white text-white placeholder-gray-500"
                            : "bg-gray-50 border-black text-black placeholder-gray-400"
                            }`}
                    />
                    <div className="flex justify-end mt-1">
                        <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {bio.length}/160
                        </span>
                    </div>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className={`block text-sm font-medium mb-2 flex items-center gap-1 ${isDark ? "text-white" : "text-black"}`}>
                            <Twitter className="h-3 w-3" /> Twitter
                        </label>
                        <Input
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            placeholder="@username"
                            className={`${isDark
                                ? "bg-gray-900 border-white text-white placeholder-gray-500"
                                : "bg-gray-50 border-black text-black placeholder-gray-400"
                                }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 flex items-center gap-1 ${isDark ? "text-white" : "text-black"}`}>
                            <Instagram className="h-3 w-3" /> Instagram
                        </label>
                        <Input
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="@username"
                            className={`${isDark
                                ? "bg-gray-900 border-white text-white placeholder-gray-500"
                                : "bg-gray-50 border-black text-black placeholder-gray-400"
                                }`}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {!isFirstTime && (
                        <Button
                            onClick={onClose}
                            className={`flex-1 py-3 border-2 ${isDark
                                ? "bg-black text-white border-white hover:bg-white hover:text-black"
                                : "bg-white text-black border-black hover:bg-black hover:text-white"
                                }`}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={!username || !!error || isChecking}
                        className={`flex-1 py-3 border-2 disabled:opacity-50 ${isDark
                            ? "bg-white text-black border-black hover:bg-black hover:text-white hover:border-white"
                            : "bg-black text-white border-white hover:bg-white hover:text-black hover:border-black"
                            }`}
                    >
                        {isChecking ? (
                            "Checking..."
                        ) : (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                {isFirstTime ? "Create Profile" : "Save Changes"}
                            </>
                        )}
                    </Button>
                </div>

                {/* First time skip option */}
                {isFirstTime && (
                    <button
                        onClick={onClose}
                        className={`w-full mt-4 text-sm ${isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-black"}`}
                    >
                        Skip for now
                    </button>
                )}
            </div>
        </div>
    )
}
