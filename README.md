# 🎨 ARPO Studio - NFT Auction House

> A next-generation NFT auction platform built on Base, featuring real-time bidding, live chat, and a stunning user experience.

![ARPO Studio](https://img.shields.io/badge/Built%20on-Base-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Supabase](https://img.shields.io/badge/Supabase-Realtime-green)

---

## ✨ Features

### 🎯 Core Functionality
- **Live Auctions** - Real-time bidding with countdown timers
- **Quick Bid System** - One-click min/max bidding from chat
- **MAX PAIN Mode** - Aggressive bidding strategy for whales
- **Bid Extensions** - Automatic 30-second extension in final moments

### 💬 Social Features
- **Live Auction Chat** - Real-time messaging during auctions
- **User Badges** - Tier system based on bid count
- **@Mentions** - Tag other users in chat
- **Display Names** - ENS support with 24h cooldown

### 🛡️ Security
- **XSS Prevention** - Message sanitization
- **Bid Validation** - Client and server-side checks
- **Rate Limiting** - Spam protection
- **RLS Policies** - Supabase row-level security

### 🎨 User Experience
- **Dark/Light Mode** - Full theme support
- **Responsive Design** - Mobile-first approach
- **Glassmorphism UI** - Modern aesthetic
- **Smooth Animations** - Polished interactions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/bigf0tApple/final-auction1.git
cd final-auction1

# Install dependencies
npm install

# Copy environment file
cp env.example.md .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Setup

Create `.env.local` with:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin Access
NEXT_PUBLIC_ADMIN_WALLET=0xYourWalletAddress

# Contracts (after deployment)
NEXT_PUBLIC_AUCTION_HOUSE_CONTRACT=0x...
NEXT_PUBLIC_NFT_CONTRACT=0x...

# Chain Config
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532
```

---

## 🗄️ Database Setup

1. Create a [Supabase](https://supabase.com) project
2. Run `lib/schema.sql` in the SQL Editor
3. Enable Realtime for `chat_messages` table

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Database** | Supabase, PostgreSQL |
| **Blockchain** | Ethereum, Base Sepolia |
| **Contracts** | Solidity 0.8.20, Hardhat |
| **IPFS** | Pinata (optional) |

---

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main auction page (953 lines)
│   └── admin-panel.tsx    # Admin dashboard (1269 lines)
├── components/            # React components (65+ files)
│   ├── admin/            # Extracted admin components
│   │   ├── admin-users-tab.tsx    # User management (108 lines)
│   │   ├── admin-chat-tab.tsx     # Chat moderation (275 lines)
│   │   ├── admin-analytics-tab.tsx # Analytics dashboard (69 lines)
│   │   ├── admin-charts.tsx       # Chart components
│   │   └── admin-data.ts          # Mock admin data
│   ├── bidding/          # Bidding components
│   │   └── max-pain-controller.tsx
│   ├── ui/               # Reusable UI components (shadcn)
│   └── *.tsx             # Feature components
├── contracts/            # Solidity contracts
│   ├── AuctionHouse.sol  # Main auction contract
│   ├── ARPONFT.sol       # NFT contract  
│   ├── interfaces/       # Contract interfaces
│   └── examples/         # V4 Hook examples
├── hooks/                # Custom React hooks (10 files)
│   ├── use-auction-state.ts    # Auction state machine (320 lines)
│   ├── use-user-profile.ts     # User data & badges
│   └── use-supabase-chat.ts    # Real-time chat
├── lib/                  # Utility libraries (7 files)
│   ├── supabase.ts       # Database client (513 lines)
│   ├── contracts.ts      # Blockchain interactions (475 lines)
│   ├── sanitize.ts       # XSS prevention
│   └── auction-data.ts   # Demo auction data
├── test/                 # Test suites
│   ├── lib/              # Unit tests
│   └── stress/           # Stress/load tests
└── scripts/              # Deployment scripts
```

---

## 🧪 Testing

### Frontend Tests (Vitest)
```bash
# Run all frontend tests
npm test

# Single run (CI mode)
npm run test:run

# With coverage report
npm run test:coverage
```

### Smart Contract Tests (Hardhat)
```bash
# Run contract tests
npx hardhat test

# Run with coverage
npm run coverage
```

### Test Coverage
- **Unit Tests**: sanitize.ts, auction-data.ts (32 tests)
- **Stress Tests**: Concurrent bidding, rate limiting (6 tests)
- **Total**: 38 passing tests ✓

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Smart Contracts (Base Sepolia)
```bash
# Add PRIVATE_KEY to .env.local first
npx hardhat run scripts/deploy.ts --network baseSepolia
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├────────────────────────┬────────────────────────────────────────┤
│    React Components    │           State Management              │
│  • Auction Display     │  • useAuction (bid state)              │
│  • Chat Interface      │  • useUserProfile (profiles)           │
│  • Admin Panel         │  • useChatPinned (chat position)       │
└────────────────────────┴────────────────────────────────────────┘
            │                              │
            ▼                              ▼
┌─────────────────────┐       ┌─────────────────────────────────┐
│   Supabase          │       │       Base Sepolia              │
│  • chat_messages    │       │  • ARPOAuctionHouse.sol         │
│  • users            │       │  • ARPONFT.sol                  │
│  • auctions         │       │  • Bidding & Settlement          │
│  • Real-time sync   │       │                                 │
└─────────────────────┘       └─────────────────────────────────┘
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🔗 Links

- **Live Site**: https://arpo-auction-house.vercel.app
- **GitHub**: https://github.com/bigf0tApple/final-auction1
- **Base Sepolia Explorer**: https://sepolia.basescan.org

---

Built with ❤️ by ARPO Studio