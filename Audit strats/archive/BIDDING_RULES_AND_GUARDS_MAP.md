# Bidding rules + guards map

This map documents every bid entrypoint and the guardrails that control whether a bid can be placed.

Scope:

- Main page bid buttons (1% / 10%)
- Chat “Quick Bid” buttons (1% / 10%)
- Auction-state bid mechanics (`useAuctionState.placeBid`, Max Pain auto-bid)
- Note: there is a separate, currently-unwired “bidding system” under `components/bidding/`.

## Canonical bid primitive

### `placeBid(amount, bidder)`

Location: `hooks/use-auction-state.ts`

What it does:

- Creates a `Bid` object and appends it to:
  - `auctionState.bids`
  - `bidHistory`
- Updates/creates a per-bidder pool in `auctionState.userPools` (a `Map`).
- Updates `currentBid` and `highestBidder` only if `amount > currentBid`.
- Triggers Max Pain auto-bid via `handleMaxPainBid(amount, bidder)`.

Important nuance:

- A “1% bid” is not inherently smaller; it is a *computed amount* produced by `getMinBid()`.
- Even if `amount <= currentBid`, the bid is still recorded and added to the bidder’s pool.

## Derived bid amounts

Location: `hooks/use-auction-state.ts`

- `getMinBid()` → `round(currentBid * 1.01, 2dp)`
- `getMaxBid()` → `round(currentBid * 1.10, 2dp)`

These functions are used by:

- `app/page.tsx` main bid buttons
- `components/auction-chat.tsx` quick-bid buttons

## Entrypoint: main page bid buttons

Location: `app/page.tsx`

### Buttons

- **Min Bid (1%)** → `onClick={() => handleBid("min")}`
- **Max Bid (10%)** → `onClick={() => handleBid("max")}`

### Pre-guards in `handleBid(bidType)`

1. Wallet required
   - If `!connectedWallet` → shows error notification and returns.
2. Rate limit cooldown
   - If `rateLimitCooldown > 0` → shows error notification and returns.
3. Final-10-seconds restriction (1% only)
   - If `bidType === "min" && isFinalTenSeconds && activeAuction` → shows error notification and returns.

### UI-level disabling

- Min (1%) button is disabled when:
  - `pendingBids.onePercent` OR
  - `activeAuction && isFinalTenSeconds`
- Max (10%) button is disabled when:
  - `pendingBids.tenPercent`

### Execution paths

#### 1% path (“optimistic”)

- `amount = getMinBid()`
- Sets `pendingBids.onePercent = true`
- Immediately calls `placeBid(amount, connectedWallet)`
- Shows a success notification (“Bid placed …”)
- After 2s, clears pending and shows “1% bid confirmed …”

Audit note:

- This is UI-simulated confirmation, not a real network/chain result.

#### 10% path (“confirmation-required”)

- `amount = getMaxBid()`
- Sets `pendingBids.tenPercent = true`
- Waits 3s, then calls `placeBid(amount, connectedWallet)`
- Clears pending and shows “10% bid confirmed …”

### Rate limiting behavior

Location: `app/page.tsx`

- `bidCount` increments per call.
- When `bidCount >= 3`, starts a 3-second `rateLimitCooldown` timer.

Audit nuance:

- Because `bidCount` is incremented via state and then checked using the pre-update value, the exact “when it starts” can feel off-by-one depending on React batching.

## Entrypoint: chat quick-bid buttons

Location: `components/auction-chat.tsx`

### Buttons

- **Min Bid (1%)** → `handleQuickBid("min")`
- **Max Bid (10%)** → `handleQuickBid("max")`

### UI-level disabling

- Both buttons disabled if:
  - `!connectedWallet` OR
  - `auctionState.highestBidder === connectedWallet` (leading bidder)
- Additionally, Min (1%) disabled if:
  - `isFinalTenSeconds`

### Pre-guards in `handleQuickBid(bidType)`

1. Wallet required
   - If `!connectedWallet` → adds a system chat message and returns.
2. Final-10-seconds restriction (1% only)
   - If `bidType === "min" && isFinalTenSeconds` → adds a system warning and returns.

### Execution

- `bidAmount = bidType === "min" ? getMinBid() : getMaxBid()`
- Calls `placeBid(bidAmount, connectedWallet)`
- Appends a system chat message describing the bid.

Important differences vs main page:

- No `rateLimitCooldown` logic.
- No “optimistic vs confirm” delay; both call `placeBid` immediately.
- Has an extra “leading bidder cannot quick-bid” disable.

## Max Pain auto-bidding

Location: `hooks/use-auction-state.ts` (`handleMaxPainBid`)

- When Max Pain is active and someone else bids:
  - Computes `nextBid = round(newBid * 1.01, 2dp)`
  - Schedules `placeBid`-equivalent state updates after 1 second.

Guardrails:

- Does nothing if:
  - Max Pain not active
  - New bidder is the Max Pain bidder
  - New bid is already >= max amount
  - Next bid would exceed max amount

## Unwired “bidding system” components

Folder: `components/bidding/`

- `components/bidding/bidding-engine.tsx`
  - Has its own timer reset-on-bid logic and its own rate limiter.
- `components/bidding/bid-pool-manager.tsx`
  - UI for managing a user’s pool and adding 1%/10% via `onAddToBid`.

Current status:

- No imports/usages found in the main app routing/UI.

Audit note:

- Treat these as experimental/legacy unless they are intentionally planned to be wired in.

## Audit checklist

- Verify final-10-seconds enforcement is consistent:
  - Main page: min-bid blocked and disabled only when `activeAuction` exists.
  - Chat: min-bid blocked regardless of `activeAuction` (only checks `isFinalTenSeconds`).
- Verify rate limiting scope:
  - Main page rate limit does not apply to chat quick-bid.
- Verify leading bidder constraints:
  - Chat disables quick-bid for leading bidder; main page allows bidding while leading.
- Verify bid accounting:
  - Even non-leading bids add to user pool; `currentBid` only increases on higher amounts.
- Verify Max Pain interplay:
  - A user placing bids may trigger auto-bids depending on Max Pain settings.
