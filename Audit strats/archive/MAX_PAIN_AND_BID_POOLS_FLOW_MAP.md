# MAX PAIN + BID POOLS FLOW MAP

Scope:
- Max Pain UI: `components/max-pain-modal.tsx` (simple modal) and `components/bidding/max-pain-controller.tsx` (controller-style modal)
- Bid pool UI: `components/bidding/bid-pool-manager.tsx`
- Core state/logic: `hooks/use-auction-state.ts` exposed via `components/auction-context.tsx`
- Related entrypoints: `app/page.tsx` (home bidding + Max Pain open/close)

## Purpose
- MAX PAIN: user sets a maximum threshold; the system auto-places 1% counter-bids until the threshold.
- Bid pools: track each user’s contributed funds and let non-leading users withdraw.

## Core State (Auction)
File: `hooks/use-auction-state.ts`
- `auctionState.currentBid: number`
- `auctionState.highestBidder: string`
- `auctionState.userPools: Map<string, UserPool>` where `UserPool = { totalAmount, bidCount, lastBidTime, isActive }`
- `auctionState.maxPainSettings: { isActive, maxAmount, bidder } | null`

### `placeBid(amount, bidder)`
- Always appends a bid to `auctionState.bids` and `bidHistory`.
- Updates or creates `userPools[bidder]`:
  - `totalAmount += amount`, `bidCount += 1`, `lastBidTime = now`
- Updates market state only if `amount > currentBid`:
  - `currentBid = amount`, `highestBidder = bidder`
- Triggers MAX PAIN reaction:
  - Calls `handleMaxPainBid(amount, bidder)` after recording the bid.

### `setMaxPain(maxAmount, bidder)` / `cancelMaxPain()`
- `setMaxPain` sets `maxPainSettings = { isActive: true, maxAmount, bidder }`.
- `cancelMaxPain` sets `maxPainSettings = null`.
- No persistence (in-memory only).

### Auto-bid logic: `handleMaxPainBid(newBid, newBidder)`
- Runs only when `maxPainSettings?.isActive`.
- Guardrails:
  - If `newBidder === maxPainBidder` → do nothing.
  - If `newBid >= maxAmount` → do nothing.
- Computes next bid:
  - `nextBid = round(newBid * 1.01, 2 decimals)`
  - If `nextBid > maxAmount` → do nothing.
- Schedules auto-bid after 1s:
  - Appends a bid with `isMaxPain: true`
  - Sets `currentBid = nextBid`, `highestBidder = maxPainBidder`
  - Adds to `bidHistory`

## Withdraw Flow (Pools)
File: `hooks/use-auction-state.ts`

### `withdrawFromPool(bidder)`
Guards:
- If `auctionState.highestBidder === bidder && !auctionState.isEnded` → throws `"Cannot withdraw: you are the highest bidder"`.
- If no pool exists OR pool inactive → throws `"No active pool found for this user"`.

Action:
- Marks pool inactive: `userPools[bidder].isActive = false`.
- Returns `userPool.totalAmount` to caller (caller decides how to show/handle).

## MAX PAIN UI (Simple Modal)
File: `components/max-pain-modal.tsx`

Props:
- `isOpen`, `onConfirm(amount)`, `onCancel()`, `currentBid`, `launchPrice`, `isDark?`

Derived values:
- `minimumMaxPain = launchPrice * 2`.
- Quick options: 2x/3x/4x/5x launch, each disabled if `currentBid >= optionValue`.

Confirm (`handleConfirm`):
- Parses user input.
- Validation:
  - Must be a positive number.
  - Must be `> currentBid`.
  - Must be `>= minimumMaxPain`.
- On success calls `onConfirm(amount)`.

Notes:
- Contains explanatory copy: “Automatically places 1% counter-bids instantly” and “Stops when threshold reached or someone bids higher”.
- Mobile detection affects layout only.

## MAX PAIN UI (Controller Modal)
File: `components/bidding/max-pain-controller.tsx`

Props:
- `onConfirm(maxAmount): Promise<boolean>`
- `onDeactivate(): Promise<boolean>`
- `onCancel()`
- `currentBid`, `launchPrice`, `isDark`
- `isActive?`, `currentLimit?`

Confirm (`handleConfirm`):
- Validations:
  - amount is positive and `> currentBid`.
  - if `isActive && currentLimit` → amount must be `> currentLimit`.
- Calls `await onConfirm(amount)`; shows `toast.success`/`toast.error`.

Deactivate (`handleDeactivate`):
- Calls `await onDeactivate()`; shows toast.

Quick-set:
- Sets `maxAmount` to 2x / 3x / 5x launch.

Notes:
- This component is UI-only; actual activation/deactivation behavior depends on its parent wiring.

## Bid Pool UI
File: `components/bidding/bid-pool-manager.tsx`

Props:
- `userAddress?`, `userBids`, `currentLeader`, `totalParticipants`, `userPoolTotal`, `maxPainLimit?`
- Actions:
  - `onWithdraw(bidId): Promise<boolean>`
  - `onWithdrawAll(): Promise<boolean>`
  - `onAddToBid(type: '1%'|'10%')`

Behavior:
- If `!userAddress || userBids.length === 0` → renders nothing.
- Computes:
  - `isUserLeading = userAddress === currentLeader`
  - `withdrawableBids = userBids.filter(b => b.canWithdraw)`

Buttons:
- **Add 1%** → `onAddToBid('1%')`
- **Add 10%** → `onAddToBid('10%')`
- **I’m Out** → calls `handleWithdrawAll()` which wraps `onWithdrawAll()` with toasts
- Per-bid **Withdraw** button → calls `handleWithdraw(bid.id)` if `bid.canWithdraw`

UX notices:
- Shows a “Leading bid protection notice” when user is leading: cannot withdraw.
- Shows “Not currently winning” warning when not leading.
- Suggests MAX PAIN if user has 3+ bids and no maxPainLimit.

## Where the Rules Are Enforced
- Core pool withdraw guard is in `withdrawFromPool()` (cannot withdraw while leading).
- MAX PAIN auto-bid guardrails are in `handleMaxPainBid()`.
- UI components validate inputs and provide disable/feedback states, but activation and pool/bid identity mapping depends on parent wiring.

## Audit Checklist
- Confirm which Max Pain UI is used in the main flow (`MaxPainModal` vs `MaxPainController`).
- Verify how `onConfirm` maps to `setMaxPain(maxAmount, connectedWallet)` and whether it’s wallet-gated.
- Verify how pool-bid IDs map to `withdrawFromPool()` (hook currently withdraws the entire pool for a bidder, not an individual bid).
- Ensure “final 10 seconds” bidding constraints (if any) are consistent with MAX PAIN’s 1% auto-bids (hook currently does not check that rule).
