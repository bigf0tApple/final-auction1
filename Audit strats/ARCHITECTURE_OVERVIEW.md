# ARPO Studio - System Architecture Overview

**Date:** December 18, 2025

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│  app/page.tsx           │  app/admin-panel.tsx                  │
│  - Main auction view    │  - Admin controls                     │
│  - Bidding interface    │  - Mint new auctions                  │
│  - Chat panel           │  - Analytics dashboard                │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  auction-chat.tsx    │  mint-flow-modal.tsx  │  site-header.tsx │
│  auction-calendar    │  wallet-connect-modal │  chat-button     │
│  demo-charts.tsx     │  search-modal.tsx     │  display-name    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        STATE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  hooks/use-auction-state.ts  │  hooks/use-chat-pinned.ts       │
│  - Auction state machine     │  - Chat panel position           │
│  - Bid management            │                                  │
│  - Timer logic               │  hooks/use-user-profile.ts       │
│                              │  - User data & badges            │
│  auction-context.tsx         │                                  │
│  - React context provider    │  hooks/use-supabase-chat.ts      │
│                              │  - Real-time messages            │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│       WEB3 LAYER             │ │        DATABASE LAYER        │
├──────────────────────────────┤ ├──────────────────────────────┤
│  lib/contracts.ts            │ │  lib/supabase.ts             │
│  - Wallet connection         │ │  - User profiles             │
│  - Contract interactions     │ │  - Auction records           │
│  - Event listeners           │ │  - Chat messages             │
│                              │ │  - Bid history               │
│  Chain: Base Sepolia         │ │                              │
│  Contract: AuctionHouse      │ │  lib/schema.sql              │
│  Token: ETH / USDC           │ │  - Table definitions         │
└──────────────────────────────┘ └──────────────────────────────┘
                    │                         │
                    ▼                         ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│     SMART CONTRACTS          │ │       SUPABASE               │
├──────────────────────────────┤ ├──────────────────────────────┤
│  contracts/AuctionHouse.sol  │ │  - PostgreSQL database       │
│  - ARPOAuctionHouse          │ │  - Real-time subscriptions   │
│  - ARPONFT (ERC-721)         │ │  - Row Level Security        │
│  - V4 Hooks interface        │ │  - Edge Functions            │
└──────────────────────────────┘ └──────────────────────────────┘
```

---

## Data Flow Diagrams

### Bidding Flow
```
User clicks "Place Bid"
        │
        ▼
┌─────────────────┐
│ Check wallet    │
│ connected?      │
└────────┬────────┘
         │ Yes
         ▼
┌─────────────────┐
│ Validate bid    │
│ amount (min/max)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Demo Mode?     │    Production?    │
│  (no contract)  │    (on-chain)     │
│        │        │         │         │
│        ▼        │         ▼         │
│  placeBid()     │  placeBidOnChain()│
│  (local state)  │  (smart contract) │
│        │        │         │         │
│        ▼        │         ▼         │
│  Update UI      │  Wait for tx      │
│                 │  Update Supabase  │
└─────────────────────────────────────┘
```

### Chat Message Flow
```
User sends message
        │
        ▼
┌─────────────────┐
│ Rate limit      │
│ check           │
└────────┬────────┘
         │ OK
         ▼
┌─────────────────┐
│ Blocked words   │
│ filter          │
└────────┬────────┘
         │ Pass
         ▼
┌─────────────────┐      ┌─────────────────┐
│ Send to         │─────▶│ Supabase        │
│ Supabase        │      │ saves message   │
└─────────────────┘      └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Real-time       │
                         │ broadcast       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ All clients     │
                         │ receive message │
                         └─────────────────┘
```

---

## Key State Stores

| Store | Type | Persistence | Purpose |
|-------|------|-------------|---------|
| Auction State | React State | Memory | Current auction data |
| User Profile | React State + Supabase | DB | Display name, badges |
| Chat Messages | React State + Supabase | DB | Real-time chat |
| Bid Count | localStorage | Local | Tier progression |
| Theme | localStorage | Local | Dark/light mode |
| Chat Position | React State | Memory | Pinned left/right |

---

## External Dependencies

| Service | Purpose | Config Location |
|---------|---------|-----------------|
| Supabase | Database, Real-time | `.env.local` |
| Base Sepolia | Blockchain network | `lib/contracts.ts` |
| IPFS (Pinata) | NFT metadata storage | Future |
| Vercel | Hosting | `.vercel/` |

---

## File Organization

```
/
├── app/                    # Next.js pages
│   ├── page.tsx           # Main auction page (1090 lines)
│   └── admin-panel.tsx    # Admin dashboard (2136 lines)
│
├── components/            # React components (35 files)
│   ├── ui/               # shadcn/ui primitives (50 files)
│   └── bidding/          # Bidding-specific components (4 files)
│
├── hooks/                 # Custom React hooks (10 files)
│
├── lib/                   # Utilities & configs (5 files)
│   ├── contracts.ts      # Web3 integration
│   ├── supabase.ts       # Database client
│   └── auction-data.ts   # Demo/mock data
│
├── contracts/            # Solidity contracts (4 files)
│
└── Audit strats/         # Documentation (70+ files)
```
