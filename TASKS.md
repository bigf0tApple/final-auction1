# ARPO Studio - Task Tracker

**Updated:** December 17, 2025, 9:20 PM  
**Version:** V4 (Extensible Hooks)

---

## 🎮 TESTING MODE ACTIVE

**Dev Server:** http://localhost:3001 (or your local network IP)

### Quick Test Setup:
1. **Demo Mode** is ON by default - 10 ETH test credits
2. **4 Quick Auctions** running back-to-back (5 mins each)
3. **Refill Credits** button in the purple banner
4. Connect any wallet to test bidding

---

## 🔥 Most Recent Changes (This Session)

### Smart Contract V4 Upgrade
- [x] Created `IHooks` interface (`contracts/interfaces/IHooks.sol`)
- [x] Integrated V4 hooks into `ARPOAuctionHouse.sol`
- [x] Added `setHooks()` admin function
- [x] **FIXED:** Bid amount capped to max 10% above current (was unlimited)
- [x] Updated ABI in `lib/contracts.ts` with hooks

### Supabase Integration
- [x] `AdminPanel.confirmMint()` now creates auctions in Supabase
- [x] `AuctionChat` uses Supabase real-time with fallback
- [x] `useClientAuctions` hybrid hook (Supabase → localStorage)

### Frontend Refactoring
- [x] Extracted `SiteHeader` from `page.tsx`
- [x] Extracted `UpcomingAuctions` from `page.tsx`
- [x] Dynamic image binding for live/upcoming auctions
- [x] Lazy loading for `AdminPanel`, `SearchModal`, `SettingsModal`

---

## 🔨 Currently Working On

- [x] **TASKS.md Cleanup** - This document update
- [x] **Build Fix** - Supabase graceful fallback for production build

---

## 📋 Still To Do

### User Actions Required
- [ ] Create Supabase project
- [ ] Run `lib/schema.sql` in SQL Editor
- [ ] Add `.env.local` credentials (Supabase URL + Key)
- [ ] Deploy `ARPONFT` to Base Sepolia
- [ ] Deploy `ARPOAuctionHouse` to Base Sepolia
- [ ] Call `ARPONFT.setAuctionHouse()` with AuctionHouse address

### Development Tasks
- [x] Example hook contracts (Allowlist, Rewards) - `contracts/examples/`
- [ ] Hooks status display in AdminPanel
- [x] `beforeSettle` / `afterSettle` hooks added to contract
- [ ] Cross-browser testing
- [ ] Real device mobile testing

---

## 🔍 AUDIT STRATEGY

### Smart Contracts (`contracts/`)

| Component | File | Check | Status |
|-----------|------|-------|--------|
| NFT Minting | `AuctionHouse.sol:388-392` | Only AuctionHouse can mint | ⬜ TO CHECK |
| Bid Increment | `AuctionHouse.sol:297-302` | Min 1%, Max 10% enforced | ✅ FIXED |
| Bid Pool Math | `AuctionHouse.sol:127-132` | userBalance/lockedBalance correct | ✅ VERIFIED |
| Anti-Snipe | `AuctionHouse.sol:100-101` | 10s window, 10s extension | ✅ VERIFIED |
| V4 Hooks | `AuctionHouse.sol:268-272` | beforeBid can reject | ⬜ TO TEST |
| Settlement | `AuctionHouse.sol:399-414` | 10% fee, rest to artist | ⬜ TO CHECK |
| Withdrawal | `AuctionHouse.sol:359-369` | Cannot withdraw locked funds | ⬜ TO CHECK |
| Reentrancy | All payable functions | nonReentrant modifier | ⬜ TO CHECK |
| Pausable | Admin functions | whenNotPaused modifier | ⬜ TO CHECK |

### Frontend Components (`components/`)

| Component | File | Check | Status |
|-----------|------|-------|--------|
| Bid Submission | `page.tsx` | Correct amount sent | ⬜ TO CHECK |
| Wallet Connection | `page.tsx` | Handles disconnect gracefully | ⬜ TO CHECK |
| Chat Messages | `auction-chat.tsx` | Supabase fallback works | ⬜ TO CHECK |
| Admin Panel | `admin-panel.tsx` | Creates auction in Supabase | ⬜ TO CHECK |
| Profile Save | `use-user-profile.ts` | Hybrid Supabase/localStorage | ⬜ TO CHECK |
| Search | `search-modal.tsx` | Searches both users & auctions | ⬜ TO CHECK |

### Hooks (`hooks/`)

| Hook | File | Check | Status |
|------|------|-------|--------|
| useClientAuctions | `use-client-auctions.ts` | Supabase → localStorage fallback | ⬜ TO CHECK |
| useSupabaseAuctions | `use-supabase-auctions.ts` | Connection check works | ⬜ TO CHECK |
| useUserProfile | `use-user-profile.ts` | Hybrid system works | ⬜ TO CHECK |
| useNotifications | `use-notifications.ts` | Permission handling | ⬜ TO CHECK |

### Supabase (`lib/`)

| Function | File | Check | Status |
|----------|------|-------|--------|
| createAuction | `supabase.ts` | Inserts correctly | ⬜ TO CHECK |
| sendChatMessage | `supabase.ts` | Real-time broadcast | ⬜ TO CHECK |
| subscribeToChatMessages | `supabase.ts` | Subscription works | ⬜ TO CHECK |
| checkSupabaseConnection | `supabase.ts` | Returns false when not configured | ⬜ TO CHECK |

### Security Checklist

| Item | Status |
|------|--------|
| No raw ETH transfers (uses Bid Pool) | ✅ |
| ReentrancyGuard on all payable | ⬜ TO VERIFY |
| Ownable for admin functions | ✅ |
| Pausable for emergencies | ✅ |
| Input validation on all functions | ⬜ TO VERIFY |
| No hardcoded addresses | ⬜ TO VERIFY |
| Environment variables for secrets | ✅ |

---

## ✅ Completed Phases

### Phase 1-8: Foundation ✅
All UI components, notifications, settings, mint flow complete.

### Phase 9: Supabase Integration ✅
- `lib/supabase.ts` - Full CRUD
- `lib/schema.sql` - Database schema
- Hybrid hooks for graceful fallback

### Phase 10: V4 Smart Contract ✅
- `IHooks` interface
- `beforePlaceBid` / `afterPlaceBid` hooks
- Bid increment capping (1-10%)

---

## Quick Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npx tsc --noEmit      # TypeScript check
npx hardhat compile   # Contract compilation
```

---

## Key Files Reference

| Purpose | File |
|---------|------|
| Main App | `app/page.tsx` |
| Smart Contracts | `contracts/AuctionHouse.sol` |
| Contract Logic Docs | `CONTRACT_LOGIC.md` |
| Deployment Guide | `DEPLOYMENT.md` |
| Supabase Client | `lib/supabase.ts` |
| Database Schema | `lib/schema.sql` |
| Contract ABI | `lib/contracts.ts` |
