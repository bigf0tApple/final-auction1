# Auction page — button map

Primary file: `app/page.tsx`

Supporting components referenced by handlers:

- `components/wallet-connect-modal.tsx`
- `components/reminder-modal.tsx`
- `components/max-pain-modal.tsx`
- `components/navigation-dropdown.tsx`
- `components/mobile-menu.tsx`
- `components/bid-notification.tsx`
- `hooks/use-auction-state.ts` (via `useAuction()`)

## Core state / sources of truth

- Auction state + actions: `useAuction()`
  - `auctionState.currentBid`, `auctionState.highestBidder`, `auctionState.userPools`, `auctionState.maxPainSettings`
  - actions: `placeBid`, `setMaxPain`, `cancelMaxPain`, `getMinBid`, `getMaxBid`, `getUserPool`, `withdrawFromPool`, `completeAuction`
- UI state in `AuctionSiteContent`:
  - Theme: `isDark` + `document.documentElement.classList` + `localStorage['isDark']`
  - Wallet: `connectedWallet` (session-only; explicitly NOT persisted)
  - Modals/panels: `showWalletModal`, `showMaxPainModal`, `showAdminPanel`, `showCalendar`, `showSoldRecent`, `showTeam`, `showWhy`, `showContact`, `showTerms`, `showAllSold`, `selectedAuctionForReminder`
  - Bid UX: `pendingBids`, `rateLimitCooldown`, `bidCount`
  - Schedule: `activeAuction`, `nextAuction`, `upcomingQueue`, `timeLeft`, `isFinalTenSeconds`
- Global DOM interaction:
  - Chat pinning read via `useChatPinned()` which observes body classes

## Click targets and handler wiring

### A) Header controls (desktop + mobile)

1) Theme toggle button (desktop + mobile)

- Handler: `toggleTheme()`
- Effects:
  - `setIsDark(!isDark)`
  - toggles `document.documentElement.classList` (`dark`)
  - persists `localStorage['isDark']`

2) Connect wallet button (desktop + mobile)

- Handler: `connectWallet()` → `setShowWalletModal(true)`
- Opens: `WalletConnectModal`

3) Disconnect wallet button (desktop + mobile)

- Handler: `disconnectWallet()`
- Effects:
  - `setConnectedWallet('')`
  - clears `localStorage['connectedWallet']` if present (prevents auto-reconnect)

4) Admin panel button (desktop)

- Visible when `isAdmin` (wallet address matches hardcoded admin address)
- Handler: `() => setShowAdminPanel(true)`

5) Desktop navigation dropdowns

- Component: `NavigationDropdown`
- Click targets:
  - Dropdown title button toggles internal `isOpen`
  - Backdrop click closes dropdown
  - Each dropdown item button calls the item `onClick` passed from `app/page.tsx`, then closes dropdown
- Items and targets in `app/page.tsx`:
  - Sold → Recent: `setShowSoldRecent(true)`
  - Sold → ALL SOLD: `setShowAllSold(true)`
  - Next → Calendar: `setShowCalendar(true)`
  - Next → What's up next: `scrollToUpcoming()`
  - About → Team: `setShowTeam(true)`
  - About → WHY: `setShowWhy(true)`
  - About → Contact Us: `setShowContact(true)`
  - About → T&Cs: `setShowTerms(true)`

6) Mobile menu

- Component: `MobileMenu` (Sheet)
- Click targets:
  - Sheet trigger button (hamburger)
  - Menu item buttons call the passed callback (e.g., `onShowCalendar`) and then close the sheet
  - Admin Panel button (only if `isAdmin`) calls `onAdminClick()` and closes
- Note: Mobile menu currently includes Sold→Recent but not ALL SOLD.

### B) Live auction bidding panel

1) “Connect Wallet to Bid” button

- Rendered only when `!connectedWallet`
- Handler: `connectWallet()` → opens wallet modal

2) Min bid (1%) button

- Handler: `handleBid('min')`
- Guardrails:
  - `disabled={pendingBids.onePercent || (activeAuction && isFinalTenSeconds)}`
  - Handler also blocks when `bidType === 'min' && isFinalTenSeconds && activeAuction` (shows notification)
  - Rate limit: if `rateLimitCooldown > 0` → blocks with notification
  - Wallet required: blocks with notification
- Effects:
  - Computes amount via `getMinBid()`
  - Marks optimistic pending: `setPendingBids({onePercent:true})`
  - Calls `placeBid(amount, connectedWallet)` immediately (optimistic UI)
  - Sets success notification
  - After 2s: clears pending and posts confirmation notification

3) Max bid (10%) button

- Handler: `handleBid('max')`
- Guardrails:
  - `disabled={pendingBids.tenPercent}`
  - Wallet required + rate limit check
  - No final-10s restriction (10% is allowed)
- Effects:
  - Computes amount via `getMaxBid()`
  - Sets `pendingBids.tenPercent=true`
  - After 3s: calls `placeBid(amount, connectedWallet)`, clears pending, posts confirmation notification

4) MAX PAIN button (toggles)

- Handler: `handleMaxPain()`
- Guardrails:
  - Wallet required
- Behavior:
  - If `hasMaxPainActive`: calls `cancelMaxPain()` and posts notification
  - Else: opens modal `setShowMaxPainModal(true)`

5) “I’m Out, Thanks” (withdraw)

- Handler: `handleOptOut()`
- Guardrails:
  - Wallet required
  - Blocks if user is highest bidder
  - Blocks if no active user pool (`getUserPool(wallet)` missing/inactive)
- Effects:
  - Cancels MAX PAIN if active
  - Calls `withdrawFromPool(wallet)` and posts success/error notification

### C) Upcoming auctions list

1) “Set Reminder” button (per auction card)

- Handler: `handleSetReminder(auction)` → `setSelectedAuctionForReminder(auction)`
- Opens: `ReminderModal` (controlled by `selectedAuctionForReminder`)

### D) Global notifications and modals

1) Notification close

- Component: `BidNotification`
- Handler: `onClose={() => setNotification(null)}`

2) WalletConnectModal

- Close `X`: `onCancel={() => setShowWalletModal(false)}`
- MetaMask button: calls `window.ethereum.request('eth_requestAccounts')` and then `onConnect(address)`
- WalletConnect button: simulates a connect and calls `onConnect(mockAddress)`
- Demo admin button: calls `onConnect(adminAddress)`
- Page-level `onConnect` handler: `handleWalletConnect(address)`
  - Effects: `setConnectedWallet(address)`, closes modal

3) MaxPainModal

- Close/cancel buttons: call `onCancel()` → `setShowMaxPainModal(false)`
- Quick option buttons (native `<button>`): set the max amount field (disabled when current bid already exceeds option)
- Confirm button: validates amount and calls `onConfirm(amount)`
- Page-level confirm: `handleMaxPainConfirm(maxAmount)`
  - Effects: `setMaxPain(maxAmount, connectedWallet)`, closes modal, posts notification

4) ReminderModal

- Close `X` and Cancel button: `onClose()` → `setSelectedAuctionForReminder(null)`
- “Set Reminder” button:
  - Requests Notification permission, computes reminder time, schedules `new Notification(...)` via `setTimeout`
  - Persists reminders to `localStorage['auctionReminders']`
  - Alerts success, then closes

5) Content modals opened by navigation

These are all “onClose → setShowX(false)” patterns:

- `AuctionCalendar`, `SoldRecentPage`, `TeamPage`, `WhyPage`, `ContactPage`, `TermsPage`, `AllSoldPage`

## Auction engine connection notes (from `use-auction-state.ts`)

- `placeBid(amount, bidder)`:
  - Updates per-user pool totals (`userPools` Map)
  - Only changes `currentBid` and `highestBidder` when `amount > currentBid`
  - Appends to `auctionState.bids` and separate `bidHistory`
- `withdrawFromPool(bidder)`:
  - Throws if bidder is highest bidder and auction not ended
  - Marks pool inactive and returns withdrawn amount
- `cancelMaxPain()` clears `auctionState.maxPainSettings`

## Manual regression checklist (high value)

- Theme:
  - Toggle theme; refresh page; theme persists via `localStorage['isDark']`
- Wallet:
  - Connect via modal; disconnect; refresh; ensure no auto-reconnect
- Bidding:
  - Min bid shows processing state and blocks in final 10 seconds
  - Max bid shows confirming state and still works in final 10 seconds
  - Rate limit triggers after repeated bids
- MAX PAIN:
  - Open modal; quick options disabled appropriately; confirm validates min threshold; cancel closes
  - Activate then cancel using the same button
- Withdraw:
  - With active pool and not highest bidder → withdraw success
  - Highest bidder → blocked with notification
- Reminders:
  - Set reminder stores in `localStorage['auctionReminders']`
  - Permission denied path shows alert and does not store
