# AUCTION HOME PAGE (MAIN) FLOW MAP

Scope:
- Main page container: `app/page.tsx`
- Auction context state/actions: `components/auction-context.tsx` + `hooks/use-auction-state.ts`
- Schedule helpers/data: `lib/auction-data.ts`
- Embedded cross-surfaces (rendered here): navigation menus, modals, calendar, sold pages, and floating chat.

Related docs (do not duplicate):
- Button inventory: `AUCTION_PAGE_BUTTON_MAP.md`
- Schedule mechanics: `AUCTION_SCHEDULE_LOGIC_MAP.md`
- Auction context + hook API: `AUCTION_CONTEXT_AND_STATE_FLOW_MAP.md`, `USE_AUCTION_STATE_HOOK_FLOW_MAP.md`
- Chat behaviors: `AUCTION_CHAT_QUICK_BID_FLOW_MAP.md`, `CHAT_BUTTON_AND_PINNING_FLOW_MAP.md`
- Ethereum provider guard: `ETHEREUM_FIX_FLOW_MAP.md`

---

## Entry / Exit

Entry:
- App Router route `app/page.tsx` exports `AuctionSite()`.

Top-level render structure:
- `<EthereumFix />` (prevents runtime `Cannot redefine property: ethereum`)
- `<AuctionSiteContent />` (the main UI)

Exit paths (UI switches):
- If `showAdminPanel` is true, the entire page returns `<AdminPanel ... />` and skips rendering the main auction view.

---

## External dependencies / imports

UI primitives:
- shadcn: `Button`, `Card`, `Badge`
- `next/image` `Image`
- icons: `lucide-react`

Cross-surface components mounted from the home page:
- Navigation: `NavigationDropdown`, `MobileMenu`
- Modals/pages: `WalletConnectModal`, `MaxPainModal`, `ReminderModal`, `AuctionCalendar`, `SoldRecentPage`, `AllSoldPage`, `TeamPage`, `WhyPage`, `ContactPage`, `TermsPage`
- Notification: `BidNotification`
- Floating chat: `ChatButton`

Core state:
- `useAuction()` from `components/auction-context.tsx`
- `useChatPinned()` from `hooks/use-chat-pinned`

Schedule/data:
- `upcomingAuctions`, `currentLiveAuction`, `resolveAuctionSchedule`, `getTimeRemaining`, `getAuctionStatusWithTime`

---

## Home page state (React)

### Auction context (global)
From `useAuction()`:
- `auctionState`
- actions: `placeBid`, `setMaxPain`, `cancelMaxPain`, `getMinBid`, `getMaxBid`, `getUserPool`, `withdrawFromPool`, `completeAuction`

### Local UI state
Theme and identity:
- `isDark: boolean` (persisted in `localStorage` key `isDark`)
- `connectedWallet: string` (not persisted; cleared on disconnect)

Top-level view toggles:
- `showAdminPanel`
- `showMaxPainModal`, `showWalletModal`
- `showCalendar`, `showSoldRecent`, `showAllSold`, `showTeam`, `showWhy`, `showContact`, `showTerms`

Notifications:
- `notification: { message; type: "success" | "error" } | null` rendered via `BidNotification`

Reminder flow:
- `selectedAuctionForReminder: { id; title; artist; startingBid; status } | null`

Bidding UX enhancements (caller-level, not in hook):
- `pendingBids: { onePercent: boolean; tenPercent: boolean }`
- `rateLimitCooldown: number`
- `bidCount: number` (progressive rate limit trigger)
- `isFinalTenSeconds: boolean` and `hasShownFinalTenNotice: boolean`

Schedule / timing state:
- `currentTime: Date` (initializes to `new Date(0)`)
- `activeAuction: AuctionEvent | null`
- `nextAuction: AuctionEvent | null`
- `upcomingQueue: AuctionEvent[]`
- `timeLeft: { days; hours; minutes; seconds }` (countdown display)

Refs:
- `lastCompletedAuctionId` used to ensure completion triggers once per auction id
- `hasLoggedOverlap` used to rate-limit overlap warnings in non-production

Pinned chat layout state:
- `useChatPinned()` provides `isChatPinnedLeft`, `isChatPinnedRight`.

Derived values:
- `isAdmin`: address equality check against a hard-coded admin wallet
- `isHighestBidder`: `auctionState.highestBidder === connectedWallet`
- `hasMaxPainActive`: `auctionState.maxPainSettings` belongs to the connected wallet

---

## Core lifecycle effects

### 1) Schedule tick (1s interval)
Effect: `useEffect(..., [auctionState.currentBid, auctionState.highestBidder, completeAuction, connectedWallet])`

On each tick:
1) `now = new Date()`
2) `setCurrentTime(now)`
3) `schedule = resolveAuctionSchedule(upcomingAuctions, now)`
4) Overlap warning behavior:
   - If `schedule.hasOverlap` and not production and `hasLoggedOverlap` false:
     - `console.warn(...)` once, then `hasLoggedOverlap.current = true`
   - If overlap resolves, resets `hasLoggedOverlap.current = false`
5) Writes schedule outputs to state:
   - `setActiveAuction(schedule.activeAuction)`
   - `setNextAuction(schedule.nextAuction)`
   - `setUpcomingQueue(schedule.upcomingQueue)`
6) Picks countdown target (in priority order):
   - active auction end time
   - buffered next start
   - next auction start
   - else `null`
7) Computes remaining time via `getTimeRemaining(target, now)` and writes into `timeLeft`

Auction completion trigger:
- If `remaining.totalSeconds === 0` and there is an `activeAuction` and `lastCompletedAuctionId.current !== activeAuction.id`:
  - sets `lastCompletedAuctionId.current = activeAuction.id`
  - sets `lastEndedAuctionId` state (passed into `ChatButton`)
  - shows notification: `"Auction has ended!"`
  - calls `completeAuction()`
  - after 2s, shows another notification with either:
    - winner summary (based on `auctionState.highestBidder`/`auctionState.currentBid`)
    - or winner congratulations if `winner === connectedWallet`

Nuance / audit risk:
- The completion follow-up notification uses `auctionState` values from the closure at the time the effect runs; confirm this matches intended “final” winner/bid values.

### 2) Final-10s tracking and notice
Effect recalculates total seconds from `timeLeft` and sets:
- `isFinalTenSeconds = totalSeconds > 0 && totalSeconds <= 10`
- When entering final-10s, fires a one-time notification:
  - `"Only 10% bids are accepted in the final 10 seconds."`

Reset behavior:
- If `activeAuction` becomes null, resets `isFinalTenSeconds` and `hasShownFinalTenNotice`.

### 3) Theme hydration and persistence
- On `isDark` change, toggles `document.documentElement.classList` (`dark` class).
- On mount, reads `localStorage.getItem('isDark')` and JSON parses it.

---

## Core user flows

### A) Theme toggle
Handler: `toggleTheme()`
- flips `isDark`
- updates `document.documentElement` class
- writes `localStorage.isDark`

### B) Wallet connect / disconnect
Connect:
- `connectWallet()` sets `showWalletModal = true`

Modal callback:
- `handleWalletConnect(address)` sets `connectedWallet = address` and hides modal
- explicit note: does not persist wallet connection

Disconnect:
- `disconnectWallet()` clears `connectedWallet`
- removes `localStorage.connectedWallet` (even though the page does not set it)

### C) Admin panel entry
If `connectedWallet` matches the hard-coded admin address:
- shows settings icon (desktop) / admin option (mobile menu)
- toggles `showAdminPanel` which switches the entire page to `<AdminPanel ... />`

### D) Scroll to “What’s up next”
Handler: `scrollToUpcoming()`
- `document.querySelector('[data-section="upcoming-auctions"]')`
- `scrollIntoView({ behavior: 'smooth' })`

### E) Bidding (caller-level guards + optimistic UX)
Handler: `handleBid(bidType: "min" | "max")`

Guards (UI-level):
1) Requires `connectedWallet`
2) Requires `rateLimitCooldown === 0`
3) If `bidType === "min"` and in final-10s: reject with notification

Progressive rate limiting:
- increments `bidCount`
- if `bidCount >= 3`, sets `rateLimitCooldown = 3` and starts a 1s interval decrementer until 0

Bid amount:
- `min` => `getMinBid()` (1% increment)
- `max` => `getMaxBid()` (10% increment)

Optimistic 1% flow:
- sets `pendingBids.onePercent = true`
- calls `placeBid(amount, connectedWallet)` immediately
- notification: `Bid placed ...`
- after 2s timeout: clears pending and notifies `1% bid confirmed ...`

Confirm-then-place 10% flow:
- sets `pendingBids.tenPercent = true`
- after 3s timeout:
  - calls `placeBid(amount, connectedWallet)`
  - clears pending
  - notification: `10% bid confirmed ...`

Failure handling:
- clears pending
- notification from thrown error if any

Important alignment notes:
- These guards are **not** enforced in `useAuctionState.placeBid()`.
- `placeBid()` currently does not check `auctionState.isEnded`.

### F) MAX PAIN activation/cancel
Handler: `handleMaxPain()`
- requires connected wallet
- if active for this wallet: calls `cancelMaxPain()` and notifies
- else opens `MaxPainModal`

Modal confirm:
- `handleMaxPainConfirm(maxAmount)` calls `setMaxPain(maxAmount, connectedWallet)` and notifies

### G) “I’m Out, Thanks” (withdraw)
Handler: `handleOptOut()`
Guards:
- requires connected wallet
- rejects if `isHighestBidder`
- rejects if no active pool (`getUserPool()`)

Action:
- cancels MAX PAIN if active
- calls `withdrawFromPool(connectedWallet)`
- notifies withdrawn amount

### H) Reminder modal flow
- `handleSetReminder(auction)` sets `selectedAuctionForReminder`
- Renders `<ReminderModal ... />` until closed

### I) Secondary surface modals/pages
Toggle booleans to render full-screen/modal-like components:
- Calendar: `<AuctionCalendar ... />`
- Sold pages: `<SoldRecentPage ... />`, `<AllSoldPage ... />`
- About: `<TeamPage ... />`, `<WhyPage ... />`, `<ContactPage ... />`, `<TermsPage ... />`

---

## Schedule-driven display behavior

Displayed auction:
- `displayAuction = activeAuction ?? nextAuction`

Countdown label:
- if active: “Auction ending in”
- else if next: “Next auction starts in”
- else “No scheduled auctions”

Upcoming cards source:
- prefers `upcomingQueue` (schedule-aware, held by overlap buffering)
- falls back to `upcomingAuctions`
- slices to 3 cards

Status tag:
- computed per card via `getAuctionStatusWithTime(auction, currentTime, activeAuction?.id ?? null)`

---

## Layout / side effects

Pinned chat shifts:
- Applies `content-with-chat-left` / `content-with-chat-right` class based on `useChatPinned()`.

Floating chat:
- Always renders `<ChatButton ... />` and passes:
  - `connectedWallet`, `isAdmin`, `activeAuctionId`, `lastEndedAuctionId`, `isFinalTenSeconds`

---

## Audit checklist

- Verify schedule tick correctness:
  - overlap behavior and `bufferedNextStart` countdown
  - auction completion fires once per auction id
- Verify final-10s enforcement consistency:
  - 1% bid disabled and blocked
  - 10% bid remains allowed
  - MAX PAIN auto-bids are not centrally blocked (hook-level risk)
- Verify end-of-auction behavior:
  - `placeBid()` after end is not centrally blocked
  - completion notification uses intended final winner/bid values
- Verify rate limiting:
  - `bidCount` threshold behavior is as intended (current logic triggers cooldown after 3rd attempt)
- Verify theme behavior:
  - `isDark` localStorage parse failures are handled
  - `documentElement` `dark` class matches UI
- Verify view switches:
  - `showAdminPanel` replaces the home page completely
  - modals can be opened/closed without breaking countdown tick
