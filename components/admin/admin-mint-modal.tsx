"use client"

import { Button } from "@/components/ui/button"

interface MintFormData {
    title: string
    artistName: string
    startingPrice: string
    acceptedTokenMode: string
    customTokenAddress: string
    royaltyPercent: string
    auctionDate: string
    auctionTime: string
    auctionContractAddress: string
}

interface AdminMintConfirmationModalProps {
    mintForm: MintFormData
    formatTokenLabel: () => string
    onCancel: () => void
    onConfirm: () => void
}

/**
 * Mint Confirmation Modal
 * Displays mint details and confirmation/cancel buttons
 */
export function AdminMintConfirmationModal({
    mintForm,
    formatTokenLabel,
    onCancel,
    onConfirm,
}: AdminMintConfirmationModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#000000] border border-black dark:border-white rounded-2xl p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-black dark:text-white mb-4">Confirm Mint</h3>
                <div className="space-y-3 mb-6">
                    <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Title:</span>
                        <p className="font-semibold text-black dark:text-white">{mintForm.title}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Artist:</span>
                        <p className="font-semibold text-black dark:text-white">{mintForm.artistName}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Starting Price:</span>
                        <p className="font-semibold text-black dark:text-white">{mintForm.startingPrice} {formatTokenLabel()}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Accepted Token:</span>
                        <p className="font-semibold text-black dark:text-white">
                            {formatTokenLabel()}
                            {mintForm.acceptedTokenMode === "CUSTOM" && mintForm.customTokenAddress.trim() ? (
                                <span className="block font-mono text-xs text-gray-600 dark:text-gray-400">{mintForm.customTokenAddress.trim()}</span>
                            ) : null}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Royalty:</span>
                        <p className="font-semibold text-black dark:text-white">{mintForm.royaltyPercent}%</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Auction Start:</span>
                        <p className="font-semibold text-black dark:text-white">
                            {mintForm.auctionDate} at {mintForm.auctionTime}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">On-chain Recipient:</span>
                        <p className="font-semibold text-black dark:text-white font-mono text-xs break-all">{mintForm.auctionContractAddress || "-"}</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        className="flex-1 bg-white dark:bg-[#000000] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="flex-1 bg-[#000000] dark:bg-white text-white dark:text-[#000000] border-2 border-white dark:border-black hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white rounded-lg"
                    >
                        Confirm Mint
                    </Button>
                </div>
            </div>
        </div>
    )
}

export type { MintFormData, AdminMintConfirmationModalProps }
