# AUCTION CONTEXT + STATE FLOW MAP

Scope:
- Global provider/wiring: `app/layout.tsx`
- Context API: `components/auction-context.tsx`
- Core state machine + rules: `hooks/use-auction-state.ts`
- Key callers:
  - Home page bidding/MAX PAIN/withdraw/completion: `app/page.tsx`
  - Chat quick-bid: `components/auction-chat.tsx`

## Mental model (single source of truth)

- The app mounts a single `AuctionProvider` at the root layout (`app/layout.tsx`).
- `AuctionProvider` exposes the return value of `useAuctionState()` as a context value.
- Any component calling `useAuction()` gets direct access to:
  - current auction state (`auctionState`, `bidHistory`)
  - mutators (`placeBid`, `setMaxPain`, `cancelMaxPain`, `withdrawFromPool`, `completeAuction`)
  - helpers (`getMinBid`, `getMaxBid`, `getUserPool`)

This means **business rules enforced inside `useAuctionState` apply everywhere** (home page, chat, admin, etc). Rules enforced only in UI call sites apply only where that UI is used.

## Root wiring
File: `app/layout.tsx`
- `AuctionProvider` wraps all pages/components:
  - `children` render inside `<AuctionProvider>{children}</AuctionProvider>`

Impact:
- `useAuction()` is valid anywhere under the App Router tree.

## Context API surface
File: `components/auction-context.tsx`

Exports:
- `<AuctionProvider>`: mounts `useAuctionState()` and provides it.
- `useAuction()`:
  - `useContext(AuctionContext)`
  - throws if used outside provider.

Exposed context methods (from `useAuctionState`):
- `placeBid(amount, bidder) => Bid`
- `setMaxPain(maxAmount, bidder)`
- `cancelMaxPain()`
- `getMinBid() => number`
- `getMaxBid() => number`
- `getUserPool(bidder) => UserPool | null`
- `withdrawFromPool(bidder) => number`
- `completeAuction() => Promise<void>`

## Core state shape
File: `hooks/use-auction-state.ts`

### `AuctionState`
- `currentBid: number`
- `highestBidder: string`
- `bids: Bid[]`
- `userPools: Map<string, UserPool>`
- `maxPainSettings: { isActive, maxAmount, bidder } | null`
- `isEnded: boolean`
- `winner: string | null`
- `endTime: Date | null`

Plus a separate UI-friendly list:
- `bidHistory: Bid[]` (parallel list of bids)

## Action flows (what mutates state)

### 1) `placeBid(amount, bidder)`
File: `hooks/use-auction-state.ts`

Inputs:
- `amount` (the bid amount passed by callers)
- `bidder` (wallet/address string)

State updates:
- Creates `newBid` with `{ id: Date.now().toString(), bidder, amount, timestamp, isMaxPain: false }`.
- Updates/creates a **personal pool** for this bidder:
  - Existing pool: increments `totalAmount`, `bidCount`, sets `lastBidTime`, leaves `isActive` true.
  - New pool: creates `{ totalAmount: amount, bidCount: 1, isActive: true }`.
- Updates auction leader:
  - If `amount > prev.currentBid`:
    - `currentBid = amount`
    - `highestBidder = bidder`
  - Else:
    - `currentBid` and `highestBidder` remain unchanged.
- Appends `newBid` to `auctionState.bids` and `bidHistory`.

Side effects:
- Calls `handleMaxPainBid(amount, bidder)` after placing the bid.

Important enforcement notes:
- There is **no guard** inside `placeBid` for:
  - `auctionState.isEnded`
  - “final 10 seconds” restrictions
  - wallet connection / identity
  - rate limiting

Those constraints are currently enforced (if at all) by **callers** (e.g. `app/page.tsx`, `components/auction-chat.tsx`).

### 2) `handleMaxPainBid(newBid, newBidder)` (auto-bid)
File: `hooks/use-auction-state.ts`

Trigger:
- Called after any `placeBid(...)`.

Guards:
- Requires `auctionState.maxPainSettings?.isActive`.
- Returns early if `newBidder === maxPainBidder`.
- Returns early if `newBid >= maxAmount`.
- Computes `nextBid = round(newBid * 1.01, 2)`.
- Returns early if `nextBid > maxAmount`.

Action:
- After a 1s delay, appends an auto-bid:
  - Sets `currentBid = nextBid`, `highestBidder = maxPainBidder`.
  - Appends bid with `isMaxPain: true`.

Important enforcement notes:
- Auto-bids are **always 1% increments**.
- Auto-bids do **not** check “final 10 seconds” or `isEnded`.

### 3) `setMaxPain(maxAmount, bidder)`
File: `hooks/use-auction-state.ts`

- Sets `auctionState.maxPainSettings = { isActive: true, maxAmount, bidder }`.
- No validation at the hook level (any number can be passed).

Caller-level validation exists in UI components (see MAX PAIN map).

### 4) `cancelMaxPain()`
File: `hooks/use-auction-state.ts`
- Sets `auctionState.maxPainSettings = null`.

### 5) `withdrawFromPool(bidder)`
File: `hooks/use-auction-state.ts`

Guards:
- If `auctionState.highestBidder === bidder` AND `!auctionState.isEnded`:
  - throws `"Cannot withdraw: you are the highest bidder"`.
- If no pool or pool not active:
  - throws `"No active pool found for this user"`.

Action:
- Marks the pool inactive (`isActive: false`).
- Returns the withdrawn `totalAmount`.

Important notes:
- This does not adjust `currentBid` or `highestBidder`.
- The home page adds *extra* UI guards (e.g., requires wallet, may show more specific messages).

### 6) `completeAuction()`
File: `hooks/use-auction-state.ts`

Guards:
- If `auctionState.isEnded` already true: returns resolved Promise.

Action:
- Captures `winner = auctionState.highestBidder` and `winningBid = auctionState.currentBid`.
- Sets:
  - `isEnded = true`
  - `winner`
  - `endTime = new Date()`

Refund simulation:
- Builds a list of delayed Promises:
  - For each non-winning bidder with an active pool and `totalAmount > 0`, schedules a 1s timeout (simulated refund).
  - If winner had MAX PAIN active:
    - computes `maxPainRefund = maxAmount - winningBid`.
    - if positive, schedules a 1.5s timeout (simulated refund).
- Resolves when all Promises complete.

Important notes:
- Pools are not deactivated/reset here (refunds are simulated only).
- UI currently shows auction-end feedback via `BidNotification` on `app/page.tsx` (not via `AuctionCompletionModal`).

## Caller flows (where rules are enforced today)

### Home page (`app/page.tsx`)
- Enforces:
  - wallet connection (opens `WalletConnectModal`)
  - progressive rate limiting
  - “final 10 seconds”: disables 1% and blocks `handleBid('min')`
- Calls:
  - `placeBid(amount, connectedWallet)`
  - `setMaxPain(maxAmount, connectedWallet)` / `cancelMaxPain()`
  - `withdrawFromPool(connectedWallet)`
  - `completeAuction()` when schedule hits `remaining.totalSeconds === 0`

### Chat quick-bid (`components/auction-chat.tsx`)
- Enforces:
  - wallet connection
  - “final 10 seconds”: blocks 1% quick-bid
- Calls:
  - `placeBid(getMinBid()/getMaxBid(), connectedWallet)`

## Audit checklist (central vs caller-only rules)
- If a rule must apply everywhere, it must live in `useAuctionState` (not only in `app/page.tsx`/chat).
- Check for missing central guards:
  - block bids after `isEnded`
  - block 1% (including MAX PAIN auto-bids) during final 10s
- Confirm refund/pool reset expectations:
  - current `completeAuction()` does not reset pools; UI behavior may imply a reset.
