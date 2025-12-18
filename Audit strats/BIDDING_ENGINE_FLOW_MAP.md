# Bidding Engine — Flow map

Scope: `components/bidding/bidding-engine.tsx`.

Status note:
- No imports/usages found in the current app routing/UI. Treat as experimental/unwired unless intentionally planned to be integrated.

## Purpose
- Provide a self-contained bidding widget with:
  - Countdown timer display
  - Two bid buttons (+1% and +10%)
  - “Final 10 seconds” auto-extension signal (via `onTimerReset()` callback)
  - A simple rate limiter for rapid bids
  - Optimistic UI for 1% bids (immediate price update + pending state)

## Entry / Exit
- Entry: parent renders `<BiddingEngine ... />`.
- Exit: unmount.

## Inputs / Props
- `currentPrice: number`
- `auctionEndTime: Date`
- `isActive: boolean`
- `userAddress?: string`
- `onBid(amount: number, type: '1%' | '10%'): Promise<boolean>`
- `onTimerReset(): void`
- `isHighestBidder: boolean`
- `hasMaxPainActive: boolean`

## Internal State (React)
- `displayPrice: number` (initial: `currentPrice`)
- `timeLeft: number` seconds (initial: `0`)
- `pendingBids: PendingBid[]`
  - `PendingBid = { id, amount, type, timestamp, confirmed, userId }`
- `isProcessing: { onePercent: boolean; tenPercent: boolean }`
- `lastConfirmedPrice: number` (initial: `currentPrice`)
- Rate limiting:
  - `bidCooldown: number` seconds
  - `bidCount: number`
  - `cooldownActive: boolean`

## Side effects
- Timer interval:
  - `setInterval` every 1s recomputes `timeLeft = max(0, end-now)`.
- Cooldown timer:
  - When `bidCooldown > 0`, a `setTimeout` decrements it every 1s.
  - When it reaches `0` while `cooldownActive`, clears `cooldownActive` and resets `bidCount`.
- Toasts:
  - Uses `sonner` toasts for bid feedback and timer extension messaging.

## Derived values
- `onePercentBid = round(displayPrice * 1.01, 2dp)`
- `tenPercentBid = round(displayPrice * 1.10, 2dp)`
- Ending thresholds:
  - `isEndingSoon = timeLeft <= 60`
  - `isCritical = timeLeft <= 10`

## Core flows

### 1) External price sync
Trigger: `useEffect([currentPrice])`
- Sets:
  - `displayPrice = currentPrice`
  - `lastConfirmedPrice = currentPrice`

Nuance:
- Any optimistic display price is overwritten when parent updates `currentPrice`.

### 2) Timer display
Trigger: `useEffect([auctionEndTime])`
- Every second:
  - `remainingMs = max(0, auctionEndTime - now)`
  - `timeLeft = floor(remainingMs / 1000)`

### 3) Timer reset signal (final 10s)
Helper: `resetTimerIfNeeded()`
- If `0 < timeLeft <= 10`:
  - Calls `onTimerReset()`
  - Shows toast: “Timer extended to 10 seconds!”

Important note:
- This component does not modify `auctionEndTime`; it only signals the parent.

### 4) Rate limiting
Helper: `checkRateLimit()`
- Increments `bidCount`.
- For bids 1–3: allows.
- On bid 4+:
  - If not already active, enables cooldown:
    - `cooldownActive = true`
    - `bidCooldown = 3`
  - Returns `false` (bid should be blocked)

### 5) +1% bid (optimistic)
Handler: `handleOnePercentBid()`

Guards (no-op return):
- `!userAddress`
- `isProcessing.onePercent`
- `isHighestBidder`
- `cooldownActive`

Rate limit gate:
- If `checkRateLimit()` returns `false`:
  - Toast error “Rate limited! Please wait 3 seconds.”
  - Return.

Optimistic UI:
- `isProcessing.onePercent = true`
- `displayPrice = onePercentBid`
- `resetTimerIfNeeded()`
- Append `pendingBid` (confirmed: `false`)
- Toast info: “Bid placed at …”

Async transaction:
- `success = await onBid(newPrice, '1%')`

On success:
- Marks the pending bid `confirmed = true`
- `lastConfirmedPrice = newPrice`
- Toast success: “1% bid confirmed: …”

On failure / catch:
- Attempts rollback **only** if there are no newer pending bids than this bid’s timestamp.
- Removes this bid from `pendingBids`.
- Toast error.

Nuance / potential sharp edge:
- “Newer bids” are computed using `pendingBids` from the closure; depending on timing, this may not include the latest pending list.

Finally:
- `isProcessing.onePercent = false`

### 6) +10% bid (confirm-then-update)
Handler: `handleTenPercentBid()`

Guards (no-op return):
- `!userAddress`
- `isProcessing.tenPercent`
- `isHighestBidder`

Flow:
- `isProcessing.tenPercent = true`
- Toast info: “Confirming 10% bid: …”
- `success = await onBid(tenPercentBid, '10%')`

On success:
- Updates only after confirmation:
  - `displayPrice = newPrice`
  - `lastConfirmedPrice = newPrice`
  - `resetTimerIfNeeded()`
- Toast success.

On failure/catch:
- Toast error.

Finally:
- `isProcessing.tenPercent = false`

## Rendering rules (high level)
- Buttons render only when `isActive && timeLeft > 0`.
- +1% button disabled when:
  - processing, no wallet, highest bidder, or cooldown active.
- +10% button disabled when:
  - processing, no wallet, or highest bidder.
- Shows a “cooldown” warning banner when `cooldownActive`.
- Shows a “MAX PAIN ACTIVE” badge when `hasMaxPainActive`.

## Audit checklist
- Confirm parent integration points:
  - `onBid` resolves true/false correctly and updates parent `currentPrice`.
  - `onTimerReset` actually extends the auction end time (if required by product rules).
- Validate guard parity with main bidding:
  - This component blocks bidding if `isHighestBidder`, whereas `app/page.tsx` may allow bidding while leading.
- Validate rate limiting UX:
  - Bid 4 triggers a 3-second cooldown; verify intended behavior.
- Validate optimistic rollback:
  - Ensure rollback cannot “jump back” incorrectly if multiple rapid bids are pending.
