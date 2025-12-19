# USE AUCTION STATE (HOOK) FLOW MAP

Scope:
- Core engine hook only: `hooks/use-auction-state.ts`
- Context wrapper is documented elsewhere (`components/auction-context.tsx`).

Purpose:
- Describe the internal state, mutators, timing side effects, and invariants of `useAuctionState()`.
- Identify which rules are enforced centrally vs. must be enforced by callers.

---

## Exports

File: `hooks/use-auction-state.ts`

Types:
- `Bid`
- `UserPool`
- `MaxPainSettings`
- `AuctionState`

Hook:
- `useAuctionState()`

Return shape:
- `auctionState: AuctionState`
- `bidHistory: Bid[]`
- `placeBid(amount, bidder) => Bid`
- `setMaxPain(maxAmount, bidder) => void`
- `cancelMaxPain() => void`
- `getMinBid() => number`
- `getMaxBid() => number`
- `getUserPool(bidder) => UserPool | null`
- `withdrawFromPool(bidder) => number`
- `completeAuction() => Promise<void>`

---

## Core state model

### `auctionState` (single object)
Initialized once on mount:
- `currentBid: 1.1`
- `highestBidder: ""`
- `bids: []`
- `userPools: new Map()`
- `maxPainSettings: null`
- `isEnded: false`
- `winner: null`
- `endTime: null`

Notes:
- `userPools` is a `Map<string, UserPool>` stored inside React state.
- `bids` (inside `auctionState`) and `bidHistory` are kept in parallel.

### `bidHistory` (parallel list)
- Appended in `placeBid()`.
- Also appended in `handleMaxPainBid()` (auto-bids).

---

## Mutator flow maps

### 1) `placeBid(amount, bidder)`

Inputs:
- `amount: number`
- `bidder: string`

Constructs:
- `newBid: Bid`
  - `id = Date.now().toString()`
  - `timestamp = new Date()`
  - `isMaxPain = false`

State updates (transaction-style via `setAuctionState(prev => ...)`):
1) Clone pools: `newUserPools = new Map(prev.userPools)`
2) Update the bidder’s pool:
   - If existing: add `amount` to `totalAmount`, increment `bidCount`, update `lastBidTime`.
   - Else: create `{ bidder, totalAmount: amount, bidCount: 1, lastBidTime: now, isActive: true }`.
3) Update auction leader only if `amount > prev.currentBid`:
   - `currentBid = amount`
   - `highestBidder = bidder`
   Otherwise, both remain unchanged.
4) Append `newBid` to:
   - `auctionState.bids`
   - `bidHistory`

Side effects:
- Calls `handleMaxPainBid(amount, bidder)` after scheduling state updates.

Central rules enforced here:
- Pools are always updated/created regardless of whether the bid is “competitive” vs `currentBid`.
- Leader changes only on strict greater-than (`>`), not greater-or-equal.

Not enforced here (caller responsibility today):
- Prevent bids after `auctionState.isEnded`.
- Prevent bids during “final 10 seconds” windows.
- Prevent bids below min / above max.
- Rate limiting / cooldown.
- Bidder identity/wallet connection.

### 2) `handleMaxPainBid(newBid, newBidder)` (auto-bid)

Trigger:
- Called by `placeBid()`.

Guards:
- Requires `auctionState.maxPainSettings?.isActive`.
- No-op if `newBidder === maxPainBidder`.
- No-op if `newBid >= maxAmount`.
- Computes `nextBid = round(newBid * 1.01, 2)`.
- No-op if `nextBid > maxAmount`.

Timing side effect:
- Uses `setTimeout(..., 1000)` to apply the auto-bid 1 second later.

State updates inside timeout:
- Creates `autoBid: Bid` with `isMaxPain: true`.
- Updates:
  - `currentBid = nextBid`
  - `highestBidder = maxPainBidder`
  - append to `auctionState.bids`
  - append to `bidHistory`

Central rules enforced here:
- Auto-bids are always +1% (rounded to 2 decimals).
- Auto-bids never exceed `maxAmount`.

Not enforced here (caller responsibility today):
- Prevent auto-bids after `auctionState.isEnded`.
- Prevent auto-bids during “final 10 seconds”.

Implementation nuance (audit risk):
- The callback depends on `[auctionState.maxPainSettings]`, but reads other `auctionState` values (e.g., `maxPainSettings` only is safe for guards; however, the timeout can fire after state changes). If rules must respect the latest `isEnded`/schedule gates, those checks must exist inside the timeout using current state.

### 3) `setMaxPain(maxAmount, bidder)`

Effect:
- Sets `auctionState.maxPainSettings = { isActive: true, maxAmount, bidder }`.

Not enforced here:
- Validation of `maxAmount` (e.g., >= current bid, numeric bounds) is not done in the hook.

### 4) `cancelMaxPain()`

Effect:
- Sets `auctionState.maxPainSettings = null`.

### 5) `getMinBid()`

Pure helper:
- Returns `round(auctionState.currentBid * 1.01, 2)`.

### 6) `getMaxBid()`

Pure helper:
- Returns `round(auctionState.currentBid * 1.1, 2)`.

### 7) `getUserPool(bidder)`

Pure helper:
- Returns `auctionState.userPools.get(bidder) || null`.

### 8) `withdrawFromPool(bidder)`

Guards:
- If `bidder === auctionState.highestBidder` AND `!auctionState.isEnded`:
  - throws `Error("Cannot withdraw: you are the highest bidder")`
- If no pool exists or pool `isActive` is false:
  - throws `Error("No active pool found for this user")`

Effect:
- Marks the pool inactive: `isActive: false` (does not delete the pool).
- Returns `userPool.totalAmount`.

Not enforced here:
- Does not adjust `currentBid` / `highestBidder`.
- Does not clear/refund the pool amount (caller/UI must decide what “withdraw” means beyond toggling `isActive`).

### 9) `completeAuction()`

Guard:
- If `auctionState.isEnded` is already true: returns `Promise.resolve()`.

Effect (immediate state change):
- Captures:
  - `winner = auctionState.highestBidder`
  - `winningBid = auctionState.currentBid`
- Sets:
  - `isEnded: true`
  - `winner`
  - `endTime: new Date()`

Refund simulation:
- Builds an array of Promises (`refundPromises`).
- For each pool where:
  - bidder != winner
  - pool.isActive
  - pool.totalAmount > 0
  - schedules a `setTimeout(..., 1000)` that resolves.
- If max pain is active and the max pain bidder is the winner:
  - computes `maxPainRefund = maxAmount - winningBid`
  - if positive, schedules a `setTimeout(..., 1500)`.

Return:
- `Promise.all(refundPromises).then(() => {})` (resolves when all simulated refunds finish).

Not enforced / not performed here:
- Does not deactivate or reset pools.
- Does not clear bids/bidHistory.
- Does not persist results.

---

## Global invariants (current behavior)

- `auctionState.bids` and `bidHistory` are appended together for both user bids and auto-bids.
- `currentBid` only increases when a placed bid exceeds the previous `currentBid`.
- User pools accumulate total contributions even when bids don’t change the leader.

---

## Side effects & storage

- Uses `setTimeout` in:
  - `handleMaxPainBid` (auto-bid delay)
  - `completeAuction` (refund simulation)
- No `localStorage` usage.
- No network calls (refunds are simulated with timeouts only).

---

## Audit checklist (hook-level)

Central-logic questions:
- Should `placeBid()` reject when `auctionState.isEnded` is true?
- Should `handleMaxPainBid()` also respect auction end / final-10s restrictions?
- Should `completeAuction()` also reset pools/bids (or should reset live elsewhere)?

Correctness/consistency questions:
- Should `bidHistory` exist separately from `auctionState.bids` (or should there be one source)?
- Are time-based IDs (`Date.now().toString()`) acceptable for uniqueness across fast calls?

UX/guard alignment:
- Verify every UI entrypoint that calls `placeBid()` enforces the intended rules (min/max, end-state, final-10s, rate limits) if they are not enforced in the hook.
