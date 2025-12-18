"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    X,
    Upload,
    Image as ImageIcon,
    CheckCircle,
    AlertCircle,
    Loader2,
    Copy,
    ExternalLink,
    ArrowRight,
} from "lucide-react"

interface MintFlowModalProps {
    isOpen: boolean
    onClose: () => void
    isDark: boolean
    onMintComplete?: (tokenId: string, txHash: string) => void
}

type MintStep = "upload" | "metadata" | "preview" | "minting" | "success"

interface MintMetadata {
    name: string
    description: string
    artist: string
    startingPrice: string
    duration: string
}

export default function MintFlowModal({
    isOpen,
    onClose,
    isDark,
    onMintComplete,
}: MintFlowModalProps) {
    const [currentStep, setCurrentStep] = useState<MintStep>("upload")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [metadata, setMetadata] = useState<MintMetadata>({
        name: "",
        description: "",
        artist: "",
        startingPrice: "0.1",
        duration: "24",
    })
    const [mintResult, setMintResult] = useState<{ tokenId: string; txHash: string } | null>(null)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)
            setError(null)
        }
    }

    const handleImageDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith("image/")) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)
            setError(null)
        }
    }, [])

    const simulateUpload = async () => {
        setIsUploading(true)
        setUploadProgress(0)

        // Simulate IPFS upload progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise((r) => setTimeout(r, 200))
            setUploadProgress(i)
        }

        setIsUploading(false)
        setCurrentStep("metadata")
    }

    const simulateMint = async () => {
        setCurrentStep("minting")
        setError(null)

        try {
            // Simulate minting process
            await new Promise((r) => setTimeout(r, 2000))

            // Mock success result
            const result = {
                tokenId: "42",
                txHash: "0x" + Math.random().toString(16).slice(2, 66),
            }

            setMintResult(result)
            setCurrentStep("success")
            onMintComplete?.(result.tokenId, result.txHash)
        } catch {
            setError("Failed to mint NFT. Please try again.")
            setCurrentStep("preview")
        }
    }

    const resetFlow = () => {
        setCurrentStep("upload")
        setImageFile(null)
        setImagePreview(null)
        setUploadProgress(0)
        setMetadata({
            name: "",
            description: "",
            artist: "",
            startingPrice: "0.1",
            duration: "24",
        })
        setMintResult(null)
        setError(null)
    }

    const steps = [
        { key: "upload", label: "Upload" },
        { key: "metadata", label: "Details" },
        { key: "preview", label: "Preview" },
        { key: "minting", label: "Mint" },
    ]

    const baseClasses = isDark ? "bg-black text-white border-white" : "bg-white text-black border-black"
    const inputClasses = `w-full p-3 rounded-lg border ${isDark ? "bg-black text-white border-white" : "bg-white text-black border-black"
        }`

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${baseClasses} border-2 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className={`flex justify-between items-center p-6 border-b ${isDark ? "border-white" : "border-black"}`}>
                    <h2 className="text-xl font-bold">Mint New NFT</h2>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className={`p-1 ${isDark ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Progress Steps */}
                {currentStep !== "success" && (
                    <div className="flex items-center justify-center gap-2 p-4 border-b border-opacity-20">
                        {steps.map((step, index) => {
                            const isActive = steps.findIndex((s) => s.key === currentStep) >= index
                            const isCurrent = step.key === currentStep
                            return (
                                <React.Fragment key={step.key}>
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isActive
                                                ? isDark
                                                    ? "bg-white text-black"
                                                    : "bg-black text-white"
                                                : isDark
                                                    ? "bg-gray-800 text-gray-500"
                                                    : "bg-gray-200 text-gray-400"
                                                } ${isCurrent ? `ring-2 ring-offset-2 ring-opacity-50 ${isDark ? "ring-white" : "ring-black"}` : ""}`}
                                        >
                                            {index + 1}
                                        </div>
                                        <span className={`text-xs mt-1 ${isActive ? "" : "text-gray-500"}`}>{step.label}</span>
                                    </div>
                                    {
                                        index < steps.length - 1 && (
                                            <ArrowRight className={`h-4 w-4 ${isActive ? "" : "text-gray-400"}`} />
                                        )
                                    }
                                </React.Fragment>
                            )
                        })}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Upload Image */}
                    {currentStep === "upload" && (
                        <div className="space-y-6">
                            <div
                                onDrop={handleImageDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDark
                                    ? "border-gray-600 hover:border-white"
                                    : "border-gray-300 hover:border-black"
                                    }`}
                            >
                                {imagePreview ? (
                                    <div className="space-y-4">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-64 mx-auto rounded-lg object-contain"
                                        />
                                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                            {imageFile?.name}
                                        </p>
                                        <Button
                                            onClick={() => {
                                                setImageFile(null)
                                                setImagePreview(null)
                                            }}
                                            variant="outline"
                                            className={`${isDark
                                                ? "border-white text-white hover:bg-white hover:text-black"
                                                : "border-black text-black hover:bg-black hover:text-white"
                                                }`}
                                        >
                                            Remove Image
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <ImageIcon className={`h-16 w-16 mx-auto ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                                        <div>
                                            <p className="font-medium">Drag and drop your artwork here</p>
                                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                                or click to browse (PNG, JPG, GIF, max 50MB)
                                            </p>
                                        </div>
                                        <label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                            <span
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${isDark
                                                    ? "bg-white text-black hover:bg-gray-200"
                                                    : "bg-black text-white hover:bg-gray-800"
                                                    }`}
                                            >
                                                <Upload className="h-4 w-4" />
                                                Browse Files
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Upload Progress */}
                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Uploading to IPFS...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className={`h-2 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                                        <div
                                            className={`h-full rounded-full transition-all ${isDark ? "bg-white" : "bg-black"}`}
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Next Button */}
                            <Button
                                onClick={simulateUpload}
                                disabled={!imageFile || isUploading}
                                className={`w-full ${isDark
                                    ? "bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500"
                                    : "bg-black text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-500"
                                    }`}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Continue to Details"
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Metadata */}
                    {currentStep === "metadata" && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">NFT Name *</label>
                                    <Input
                                        value={metadata.name}
                                        onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                                        placeholder="Enter artwork name"
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={metadata.description}
                                        onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                                        placeholder="Describe your artwork..."
                                        rows={3}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Artist Name *</label>
                                    <Input
                                        value={metadata.artist}
                                        onChange={(e) => setMetadata({ ...metadata, artist: e.target.value })}
                                        placeholder="Artist name or ENS"
                                        className={inputClasses}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Starting Price (ETH)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={metadata.startingPrice}
                                            onChange={(e) => setMetadata({ ...metadata, startingPrice: e.target.value })}
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                                        <Input
                                            type="number"
                                            value={metadata.duration}
                                            onChange={(e) => setMetadata({ ...metadata, duration: e.target.value })}
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setCurrentStep("upload")}
                                    variant="outline"
                                    className={`flex-1 ${isDark
                                        ? "border-white text-white hover:bg-white hover:text-black"
                                        : "border-black text-black hover:bg-black hover:text-white"
                                        }`}
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setCurrentStep("preview")}
                                    disabled={!metadata.name || !metadata.artist}
                                    className={`flex-1 ${isDark
                                        ? "bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500"
                                        : "bg-black text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-500"
                                        }`}
                                >
                                    Preview Mint
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {currentStep === "preview" && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Image Preview */}
                                <div className="w-full md:w-1/2">
                                    {imagePreview && (
                                        <img
                                            src={imagePreview}
                                            alt="NFT Preview"
                                            className="w-full rounded-xl object-cover aspect-square"
                                        />
                                    )}
                                </div>

                                {/* Metadata Preview */}
                                <div className="w-full md:w-1/2 space-y-4">
                                    <h3 className="text-xl md:text-2xl font-bold">{metadata.name}</h3>
                                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                        by {metadata.artist}
                                    </p>
                                    {metadata.description && (
                                        <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                            {metadata.description}
                                        </p>
                                    )}
                                    <div className={`p-4 rounded-lg ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                                Starting Price
                                            </span>
                                            <span className="font-bold">{metadata.startingPrice} ETH</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                                Duration
                                            </span>
                                            <span className="font-bold">{metadata.duration} hours</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setCurrentStep("metadata")}
                                    variant="outline"
                                    className={`flex-1 ${isDark
                                        ? "border-white text-white hover:bg-white hover:text-black"
                                        : "border-black text-black hover:bg-black hover:text-white"
                                        }`}
                                >
                                    Edit Details
                                </Button>
                                <Button
                                    onClick={simulateMint}
                                    className={`flex-1 ${isDark
                                        ? "bg-white text-black hover:bg-gray-200"
                                        : "bg-black text-white hover:bg-gray-800"
                                        }`}
                                >
                                    Confirm & Mint
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Minting */}
                    {currentStep === "minting" && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Loader2 className={`h-16 w-16 animate-spin mb-6 ${isDark ? "text-white" : "text-black"}`} />
                            <h3 className="text-xl font-bold mb-2">Minting your NFT...</h3>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                Please wait while we create your auction on the blockchain
                            </p>
                        </div>
                    )}

                    {/* Step 5: Success */}
                    {currentStep === "success" && mintResult && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
                            <h3 className="text-2xl font-bold mb-2">NFT Minted Successfully!</h3>
                            <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                Your artwork is now live on ARPO Studio
                            </p>

                            {/* NFT Preview Card */}
                            <div
                                className={`w-full max-w-sm p-4 rounded-xl border-2 ${isDark ? "border-white bg-gray-900" : "border-black bg-gray-100"
                                    }`}
                            >
                                {imagePreview && (
                                    <img src={imagePreview} alt="Minted NFT" className="w-full rounded-lg mb-4" />
                                )}
                                <h4 className="font-bold">{metadata.name}</h4>
                                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    Token ID: #{mintResult.tokenId}
                                </p>
                            </div>

                            {/* Transaction Details */}
                            <div
                                className={`w-full max-w-sm mt-4 p-3 rounded-lg ${isDark ? "bg-gray-900" : "bg-gray-100"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                        {mintResult.txHash.slice(0, 10)}...{mintResult.txHash.slice(-8)}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(mintResult.txHash)}
                                            className={`p-1 rounded ${isDark ? "hover:bg-white/10" : "hover:bg-black/10"}`}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        <a
                                            href={`https://sepolia.basescan.org/tx/${mintResult.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`p-1 rounded ${isDark ? "hover:bg-white/10" : "hover:bg-black/10"}`}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 w-full max-w-sm mt-6">
                                <Button
                                    onClick={resetFlow}
                                    variant="outline"
                                    className={`flex-1 ${isDark
                                        ? "border-white text-white hover:bg-white hover:text-black"
                                        : "border-black text-black hover:bg-black hover:text-white"
                                        }`}
                                >
                                    Mint Another
                                </Button>
                                <Button
                                    onClick={onClose}
                                    className={`flex-1 ${isDark
                                        ? "bg-white text-black hover:bg-gray-200"
                                        : "bg-black text-white hover:bg-gray-800"
                                        }`}
                                >
                                    View Auction
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}
