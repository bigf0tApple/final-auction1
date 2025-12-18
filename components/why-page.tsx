"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Shield, Globe, Zap, Users, TrendingUp, Heart } from "lucide-react"

interface WhyPageProps {
  onClose: () => void
  isDark: boolean
}

export default function WhyPage({ onClose, isDark }: WhyPageProps) {
  // Check if chat is pinned by looking at body classes
  const isChatPinnedLeft = typeof document !== 'undefined' && document.body.classList.contains('chat-pinned-left')
  const isChatPinnedRight = typeof document !== 'undefined' && document.body.classList.contains('chat-pinned-right')

  const reasons = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Transparent & Trustworthy",
      description:
        "Every 1% or 10% bid is executed via decentralized smart contracts on the blockchain, making transactions publicly auditable and tamper-proof. This eliminates middlemen, ensures true ownership via NFTs, and builds a reliable space where users know the rules are enforced fairly—no black boxes, just verifiable fairness.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Democratize Access and Foster Global Inclusivity",
      description:
        "High barriers like geography or complex banking shouldn&apos;t exclude anyone from exciting auctions. Our Web3 setup welcomes anyone with a crypto wallet to bid on NFTs, digital art, or tokenized assets from anywhere, with our simple 1% or 10% options making it easy for newcomers to join without intimidation. We&apos;re breaking down walls, empowering underserved creators and collectors to thrive in a borderless, inclusive community.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Drive Innovation and Sustainable Growth",
      description:
        "Auctions have stagnated for too long, but we&apos;re changing that with features like automated royalties for creators and gamified bidding that rewards thoughtful participation. By focusing on energy-efficient blockchains (e.g., Proof-of-Stake), we deliver fast, low-fee transactions while minimizing environmental impact—pairing this with our anti-manipulation mechanics to create a platform that&apos;s not just innovative, but built for long-term, community-led evolution.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community-First Approach",
      description:
        "We believe that the best platforms are built by and for their communities. Our governance model gives users a voice in platform decisions, from fee structures to new features. Every auction strengthens our ecosystem, creating value that flows back to creators, collectors, and the broader community.",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Empowering Creators",
      description:
        "Artists and creators deserve fair compensation for their work, not just at the point of sale but throughout the lifecycle of their creations. Our automated royalty system ensures creators continue to benefit as their work appreciates in value, fostering a sustainable creative economy.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Passion for Art & Innovation",
      description:
        "We&apos;re not just building a marketplace—we&apos;re cultivating a movement. Every feature, from our intuitive bidding system to our comprehensive chat moderation, is designed with love for both the art and the technology that makes it possible. We&apos;re here to celebrate creativity while pushing the boundaries of what&apos;s possible in digital commerce.",
    },
  ]

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
      isChatPinnedLeft ? 'modal-with-chat-left' : isChatPinnedRight ? 'modal-with-chat-right' : ''
    }`}>
      <div
        className={`${isDark ? "bg-black border-white" : "bg-white border-black"} border-2 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-4 sm:p-6 border-b ${isDark ? "border-white" : "border-black"}`}>
          <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Why Arpo Studio?</h2>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            className={`p-2 bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-none ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h3 className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-white" : "text-black"} mb-4`}>
              Revolutionizing Auctions Through Blockchain Innovation
            </h3>
            <p className={`text-base sm:text-lg ${isDark ? "text-gray-300" : "text-gray-700"} max-w-4xl mx-auto leading-relaxed`}>
              At Arpo Studio, we&apos;re not just creating another auction platform—we&apos;re building the future of fair,
              transparent, and accessible digital commerce. Our mission is to democratize the auction experience while
              empowering creators and collectors worldwide.
            </p>
          </div>

          {/* Reasons Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {reasons.map((reason, index) => (
              <Card
                key={index}
                className={`${isDark ? "bg-[#000000] border-white" : "bg-white border-black"} border rounded-2xl`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-lg ${isDark ? "bg-white text-black" : "bg-black text-white"} flex-shrink-0`}
                    >
                      {reason.icon}
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold ${isDark ? "text-white" : "text-black"} mb-3`}>
                        {reason.title}
                      </h4>
                      <p className={`${isDark ? "text-gray-300" : "text-gray-700"} leading-relaxed`}>
                        {reason.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vision Statement */}
          <Card className={`${isDark ? "bg-[#000000] border-white" : "bg-white border-black"} border rounded-2xl mb-8`}>
            <CardContent className="p-8 text-center">
              <h4 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"} mb-4`}>Our Vision</h4>
              <p
                className={`text-lg ${isDark ? "text-gray-300" : "text-gray-700"} max-w-4xl mx-auto leading-relaxed mb-6`}
              >
                We envision a world where creativity knows no borders, where artists are fairly compensated, and where
                collectors can participate in a transparent, trustworthy marketplace. Through blockchain technology and
                community-driven innovation, we&apos;re making this vision a reality—one auction at a time.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className={`px-4 py-2 rounded-lg ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                  <span className="font-semibold">10,000+</span> Successful Auctions
                </div>
                <div className={`px-4 py-2 rounded-lg ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                  <span className="font-semibold">500+</span> Active Artists
                </div>
                <div className={`px-4 py-2 rounded-lg ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                  <span className="font-semibold">50+</span> Countries Served
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <h4 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"} mb-4`}>
              Ready to Experience the Future of Auctions?
            </h4>
            <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-700"} mb-6`}>
              Join Arpo Studio today—explore live listings, place your first 1% bid, and own a piece of the future.
            </p>
            <Button
              onClick={onClose}
              className={`${isDark ? "bg-white text-black hover:bg-black hover:text-white" : "bg-black text-white hover:bg-white hover:text-black"} rounded-lg px-8 py-3 text-lg font-semibold`}
            >
              Start Bidding Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
