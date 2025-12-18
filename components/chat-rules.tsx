"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Clock, Shield, Users, Gavel, AlertTriangle, Mail } from "lucide-react"

interface ChatRulesProps {
  onClose: () => void
  isDark: boolean
}

export default function ChatRules({ onClose, isDark }: ChatRulesProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${isDark ? "bg-[#000000] border-white" : "bg-white border-black"} border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${isDark ? "border-white" : "border-black"}`}>
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Chat Guidelines</h2>
          <Button onClick={onClose} variant="ghost" className={`p-2 ${isDark ? "text-white" : "text-black"}`}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rate Limiting */}
          <Card className={`${isDark ? "bg-yellow-900 border-yellow-600" : "bg-yellow-50 border-yellow-400"} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                <Clock className="h-5 w-5" />
                <span>Rate Limiting</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700 dark:text-yellow-300">
              <p className="text-sm">
                Maximum 5 messages per 5 seconds to maintain quality conversation and prevent spam.
              </p>
            </CardContent>
          </Card>

          {/* General Rules */}
          <Card className={`${isDark ? "bg-[#000000] border-white" : "bg-white border-black"} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center space-x-2 ${isDark ? "text-white" : "text-black"}`}>
                <Users className="h-5 w-5" />
                <span>General Rules</span>
              </CardTitle>
            </CardHeader>
            <CardContent className={`text-sm space-y-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              <p>• Be respectful to all members</p>
              <p>• Keep discussions auction-relevant</p>
              <p>• No spam or repetitive messages</p>
              <p>• 42 character limit per message</p>
              <p>• Use appropriate language only</p>
            </CardContent>
          </Card>

          {/* Prohibited Content */}
          <Card className={`${isDark ? "bg-red-900 border-red-600" : "bg-red-50 border-red-400"} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                <Shield className="h-5 w-5" />
                <span>Prohibited Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-red-700 dark:text-red-300 text-sm space-y-2">
              <p>• No harassment or personal attacks</p>
              <p>• No external links or promotions</p>
              <p>• No competitor discussions</p>
              <p>• No personal information sharing</p>
              <p>• No price manipulation talks</p>
            </CardContent>
          </Card>

          {/* Auction Etiquette */}
          <Card className={`${isDark ? "bg-green-900 border-green-600" : "bg-green-50 border-green-400"} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <Gavel className="h-5 w-5" />
                <span>Auction Etiquette</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700 dark:text-green-300 text-sm space-y-2">
              <p>• Congratulate winners</p>
              <p>• Ask thoughtful questions</p>
              <p>• Share constructive feedback</p>
              <p>• Bid responsibly</p>
              <p>• Support artists and community</p>
            </CardContent>
          </Card>

          {/* Violations */}
          <Card className={`${isDark ? "bg-orange-900 border-orange-600" : "bg-orange-50 border-orange-400"} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
                <AlertTriangle className="h-5 w-5" />
                <span>Violation Consequences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-700 dark:text-orange-300 text-sm space-y-2">
              <p>• 1st offense: Warning issued</p>
              <p>• 2nd offense: 10s chat restriction</p>
              <p>• 3rd offense: 20s chat restriction</p>
              <p>• Severe: Platform suspension</p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className={`${isDark ? "bg-blue-900 border-blue-600" : "bg-blue-50 border-blue-400"} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                <Mail className="h-5 w-5" />
                <span>Need Help?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 dark:text-blue-300 text-sm space-y-2">
              <p>Report violations or contact moderators:</p>
              <p className="font-mono">ArpoStudio@proton.me</p>
              <p className="text-xs opacity-75">All messages are monitored for compliance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
