import type { Metadata } from 'next'
import './globals.css'
import { AuctionProvider } from '@/components/auction-context'

export const metadata: Metadata = {
  title: 'Arpo Studio | Digital Art Auctions',
  description: 'Premier destination for digital art auctions and NFT collections',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <AuctionProvider>
          {children}
        </AuctionProvider>
      </body>
    </html>
  )
}
