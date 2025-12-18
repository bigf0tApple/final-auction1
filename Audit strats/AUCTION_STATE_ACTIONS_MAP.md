# Auction state — actions map

This map documents the **public auction actions** exposed via `useAuction()` and what they do internally.

If you’re auditing click targets, start with:
- `Audit strats/AUCTION_PAGE_BUTTON_MAP.md`
- `Audit strats/CHAT_BUTTON_MAP.md`

…and then use this document to trace where those UI events land in state.

## Sources (files)

- `components/auction-context.tsx`
- `hooks/use-auction-state.ts`
- UI entrypoints (for reference): `app/page.tsx`, `components/auction-chat.tsx`, `components/chat-button.tsx`

## Public API exposed to UI

`components/auction-context.tsx` exports `useAuction()` with:

- `auctionState: AuctionState`
- `bidHistory: Bid[]`
- `placeBid(amount, bidder) => Bid`
- `setMaxPain(maxAmount, bidder)`
- `cancelMaxPain()`
- `getMinBid() => number`
- `getMaxBid() => number`
- `getUserPool(bidder) => UserPool | null`
- `withdrawFromPool(bidder) => number`
- `completeAuction() => Promise<void>`

## State model

From `hooks/use-auction-state.ts`:

- `auctionState.currentBid: number`
- `auctionState.highestBidder: string`
- `auctionState.bids: Bid[]`
- `auctionState.userPools: Map<string, UserPool>`
- `auctionState.maxPainSettings: { isActive, maxAmount, bidder } | null`
- `auctionState.isEnded: boolean`
- `auctionState.winner: string | null`
- `auctionState.endTime: Date | null`

Additional derived state outside this hook (UI-level):
- Final-10s bid gating and rate limiting are enforced in `app/page.tsx` / chat UI, not inside `useAuctionState()`.

## Action: `placeBid(amount, bidder)`

Location: `hooks/use-auction-state.ts`

### What it does

- Creates a `Bid` record with:
  - `id: Date.now().toString()`
  - `bidder`, `amount`, `timestamp: new Date()`, `isMaxPain: false`

- Updates the bidder’s **personal pool** in `auctionState.userPools`:
  - If existing pool: increments `totalAmount`, `bidCount`, updates `lastBidTime`
  - Else: creates a pool `{ bidder, totalAmount, bidCount: 1, lastBidTime, isActive: true }`

- Updates global auction leaders only if this `amount` exceeds `prev.currentBid`:
  - `currentBid = max(prev.currentBid, amount)`
  - `highestBidder = bidder` only when `amount > prev.currentBid`

- Appends the bid to:
  - `auctionState.bids`
  - `bidHistory`

- Triggers Max Pain auto-bid logic via `handleMaxPainBid(amount, bidder)`.

### Invariants / audit notes

- This implementation explicitly allows the current highest bidder to keep bidding (no rejection on same bidder).
- The pool model is “sum of contributions” (not “replace bid”) — multiple bids accumulate.
- No time gating / rate limiting inside this action.
- No chain/network calls; it’s purely client state.

## Action: Max Pain auto-bid (`handleMaxPainBid(newBid, newBidder)`)

Location: `hooks/use-auction-state.ts`

### Trigger

- Called as a side effect of `placeBid`.

### Preconditions (returns early if)

- `maxPainSettings` is not active
- the new bidder is the max pain bidder (don’t outbid yourself)
- `newBid >= maxAmount` (already at/over threshold)

### Behavior

- Computes `nextBid` as ~1% higher and rounded to 2 decimals:
  - `nextBid = Math.round(newBid * 1.01 * 100) / 100`
- If `nextBid > maxAmount`, abort.
- Otherwise schedules an auto-bid after **1 second** (`setTimeout`):
  - creates an auto `Bid` with `isMaxPain: true`
  - sets `auctionState.currentBid = nextBid`, `highestBidder = maxPainBidder`
  - appends to `auctionState.bids` and `bidHistory`

### Invariants / audit notes

- Auto-bids are delayed; in rapid bid conditions, consider auditing for race/stale closure behavior.
- Uses a 2-decimal rounding model (ETH amounts elsewhere sometimes show 4 decimals in UI).

## Action: `setMaxPain(maxAmount, bidder)`

Location: `hooks/use-auction-state.ts`

- Sets `auctionState.maxPainSettings = { isActive: true, maxAmount, bidder }`.
- No validation here; validation happens in `components/max-pain-modal.tsx` before calling `onConfirm`.

## Action: `cancelMaxPain()`

Location: `hooks/use-auction-state.ts`

- Sets `auctionState.maxPainSettings = null`.

## Action: `getMinBid()` and `getMaxBid()`

Location: `hooks/use-auction-state.ts`

- `getMinBid()` returns current bid + 1% (rounded to 2 decimals)
  - `Math.round(auctionState.currentBid * 1.01 * 100) / 100`
- `getMaxBid()` returns current bid + 10% (rounded to 2 decimals)
  - `Math.round(auctionState.currentBid * 1.1 * 100) / 100`

Audit note:
- UI displays and other systems may format to different precision; confirm consistency when auditing.

## Action: `getUserPool(bidder)`

Location: `hooks/use-auction-state.ts`

- Returns the pool for the bidder from the `Map`, or `null`.

## Action: `withdrawFromPool(bidder)`

Location: `hooks/use-auction-state.ts`

### Guards

- Throws if bidder is highest bidder AND auction is not ended:
  - `Cannot withdraw: you are the highest bidder`
- Throws if no pool exists or pool is inactive:
  - `No active pool found for this user`

### Behavior

- Marks the user pool inactive (`isActive: false`) in the map.
- Returns `userPool.totalAmount` (the amount to withdraw).

Audit notes:
- The caller should handle thrown errors (UI typically shows a notification).
- Completing an auction does not automatically deactivate pools in this hook.

## Action: `completeAuction()`

Location: `hooks/use-auction-state.ts`

### Guard

- If already ended, returns `Promise.resolve()`.

### Behavior

- Computes:
  - `winner = auctionState.highestBidder`
  - `winningBid = auctionState.currentBid`
- Sets:
  - `auctionState.isEnded = true`
  - `auctionState.winner = winner`
  - `auctionState.endTime = new Date()`

- Builds an array of simulated refund promises for:
  - every non-winning bidder with `pool.isActive && pool.totalAmount > 0`
  - optional “Max Pain refund” when the winner had max pain active:
    - refund = `maxAmount - winningBid` if positive

- Resolves once all simulated refunds complete.

Audit notes:
- Refunds are simulated with `setTimeout`; no on-chain integration.
- Pools are not mutated to inactive during completion; only `isEnded/winner/endTime` are set.

## Cross-checks (what to verify in audits)

- UI-level guards match business rules:
  - final-10s gating (UI) vs. what `placeBid` will accept
  - disabled states for bid buttons / chat quick-bid
- State invariants after actions:
  - `currentBid` monotonically non-decreasing
  - `highestBidder` only changes on strictly higher bids
  - pools accumulate contributions; withdrawals mark pools inactive
- Max Pain behavior:
  - only triggers when another bidder bids below threshold
  - doesn’t outbid above threshold
  - auto-bid delay doesn’t cause surprising sequences
