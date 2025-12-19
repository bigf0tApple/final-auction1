"use client"

import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatPinned } from '@/hooks/use-chat-pinned'

interface TermsPageProps {
  onClose: () => void
  isDark: boolean
}

export default function TermsPage({ onClose, isDark }: TermsPageProps) {
  const { isChatPinnedLeft, isChatPinnedRight } = useChatPinned()

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isChatPinnedLeft ? 'modal-with-chat-left' : isChatPinnedRight ? 'modal-with-chat-right' : ''
      }`}>
      <div className={`${isDark ? 'bg-black text-white border-white' : 'bg-white text-black border-black'} border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-4 sm:p-6 border-b ${isDark ? 'border-white' : 'border-black'}`}>
          <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Terms & Conditions</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            className={`p-2 bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-none ${isDark ? "text-white" : "text-black"
              }`}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-8">

            {/* Testnet Notice */}
            <section className={`p-4 rounded-lg border-2 ${isDark ? 'bg-yellow-900/20 border-yellow-600' : 'bg-yellow-50 border-yellow-400'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>⚠️ Testnet Notice</h3>
              <p className={`${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
                ARPO Studio is currently operating on <strong>Base Sepolia testnet</strong>. All transactions use test ETH with no real monetary value.
                This will change when we launch on mainnet.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>1. Acceptance of Terms</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                By accessing and using ARPO Studio NFT auction platform, you accept and agree to be bound by these terms.
                If you do not agree to these terms, do not use the platform.
              </p>
            </section>

            {/* Platform Description */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>2. Platform Description</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-3`}>
                ARPO Studio is a decentralized marketplace for Non-Fungible Tokens (NFTs) that enables users to:
              </p>
              <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} ml-4`}>
                <li>Participate in timed on-chain auctions for digital art</li>
                <li>Place bids directly from their connected wallet</li>
                <li>View auction histories and results</li>
                <li>Chat with other users during live auctions</li>
              </ul>
            </section>

            {/* On-Chain Bidding */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>3. On-Chain Bidding</h3>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed space-y-3`}>
                <p><strong>All bids are blockchain transactions.</strong> When you place a bid:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>ETH is transferred from your wallet to the smart contract</li>
                  <li>You pay network gas fees for the transaction</li>
                  <li>Bids cannot be cancelled or reversed</li>
                  <li>If outbid, your funds are held in the contract for you to claim</li>
                </ul>
              </div>
            </section>

            {/* Auction Rules */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>4. Auction Rules</h3>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed space-y-3`}>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>All bids are binding</strong> and cannot be withdrawn</li>
                  <li><strong>Minimum bid increment:</strong> 1% above current bid</li>
                  <li><strong>Maximum bid (final 10 seconds):</strong> 10% above current bid</li>
                  <li><strong>Anti-sniping:</strong> Bids in final 10 seconds extend auction by 10 seconds</li>
                  <li>The highest valid bid at auction close wins the NFT</li>
                  <li>Settlement transfers the NFT to winner and ETH to artist</li>
                </ul>
              </div>
            </section>

            {/* Gas Fees */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>5. Gas Fees</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                Users are responsible for all blockchain network fees (gas) associated with their transactions, including:
                placing bids, claiming refunds, and any other contract interactions. Gas fees are paid to network
                validators, not ARPO Studio.
              </p>
            </section>

            {/* Refunds */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>6. Refunds</h3>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed space-y-3`}>
                <p>When you are outbid:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your bid amount is held in the smart contract</li>
                  <li>You can claim your refund at any time</li>
                  <li>Refunds do not include the gas fees paid for bidding</li>
                  <li>Claiming a refund requires a transaction (with its own gas fee)</li>
                </ul>
              </div>
            </section>

            {/* Platform Fees */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>7. Platform Fees</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                ARPO Studio charges a <strong>5% platform fee</strong> on all successful auction sales. This fee is
                deducted from the final sale price before payment is transferred to the artist. There are no fees
                for bidding or claiming refunds (except network gas).
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>8. User Responsibilities</h3>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed space-y-3`}>
                <p>Users are responsible for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the security of their wallet and private keys</li>
                  <li>Ensuring they have sufficient funds for bids and gas fees</li>
                  <li>Verifying they are connected to the correct network</li>
                  <li>Complying with all applicable laws and regulations</li>
                  <li>All bids placed from their connected wallet</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>9. Intellectual Property</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                Purchasing an NFT grants ownership of the token on the blockchain. This does NOT automatically
                transfer copyright or commercial rights to the underlying artwork unless explicitly stated by the
                artist. Each NFT may have different licensing terms set by its creator.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>10. Limitation of Liability</h3>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed space-y-3`}>
                <p>ARPO Studio provides the platform "as is" without warranties. We are not liable for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Loss of funds due to user error or compromised wallets</li>
                  <li>Smart contract bugs or exploits</li>
                  <li>Blockchain network congestion or failures</li>
                  <li>Fluctuations in cryptocurrency value</li>
                  <li>Artist misrepresentation of artworks</li>
                </ul>
              </div>
            </section>

            {/* Privacy */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>11. Privacy</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                Wallet addresses and transaction data are publicly visible on the blockchain. We collect minimal
                additional data necessary for platform operation. Personal information is never sold to third
                parties. Chat messages may be stored for moderation purposes.
              </p>
            </section>

            {/* Modifications */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>12. Modifications</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                These terms may be updated periodically. Major changes will be announced on the platform.
                Continued use of ARPO Studio after changes constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>13. Contact</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                For questions about these terms or the platform, please contact us through the Contact page
                or use the live chat during auction hours.
              </p>
            </section>

            {/* Last Updated */}
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} pt-8 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              Last updated: December 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
