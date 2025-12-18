# Bid Pool Manager — Flow map

Scope: `components/bidding/bid-pool-manager.tsx`.

Status note:
- No imports/usages found in the current app routing/UI. Treat as experimental/unwired unless intentionally planned to be integrated.

Related docs:
- High-level Max Pain + pools overview: `MAX_PAIN_AND_BID_POOLS_FLOW_MAP.md`

## Purpose
- Render a per-user “pool” panel showing:
  - Whether the user is leading, their position, and pool total
  - A list of the user’s bids (leading and non-leading)
  - Withdraw affordances for bids marked withdrawable
  - Quick “Add 1% / Add 10%” actions
  - A bulk withdraw (“I’m Out”) action for eligible bids

## Inputs / Props
- `userAddress?: string`
- `userBids: UserBid[]`
- `currentLeader: string`
- `totalParticipants: number`
- `userPoolTotal: number`
- `maxPainLimit?: number`

Actions (parent-owned):
- `onWithdraw(bidId: string): Promise<boolean>`
- `onWithdrawAll(): Promise<boolean>`
- `onAddToBid(type: '1%' | '10%'): void`

### `UserBid` model
- `id: string`
- `amount: number`
- `timestamp: number`
- `isLeading: boolean`
- `position: number`
- `canWithdraw: boolean`
- `type: '1%' | '10%' | 'MAX_PAIN'`

## Internal State
- `withdrawing: string | null`
  - Tracks a bid id being withdrawn, or `'all'` for bulk withdraw.
- `showAllBids: boolean`
  - Toggles between showing all bids vs the first 3.

## Side effects
- Toast notifications via `sonner`:
  - Success/failure messages for withdraw and withdraw-all.
- No direct storage writes.
- No direct network calls (delegated to parent via async props).

## Derived values
- `isUserLeading = userAddress === currentLeader`
- `leadingBid = userBids.find(b => b.isLeading)`
- `withdrawableBids = userBids.filter(b => b.canWithdraw)`

## Guardrails / Null rendering
- If `!userAddress` OR `userBids.length === 0` → returns `null` (component does not render at all).

## Core flows

### 1) Show/hide bids list
UI: **Show All / Hide** button
- Click toggles `showAllBids`.
- List renders:
  - If `showAllBids`: `userBids`
  - Else: `userBids.slice(0, 3)` plus a “+N more bids” hint when there are more.

### 2) Withdraw a single bid
UI: **Withdraw** button rendered only when `bid.canWithdraw`.

Handler: `handleWithdraw(bidId)`
- Sets `withdrawing = bidId`.
- Calls `await onWithdraw(bidId)`.
- Toasts:
  - success → “Bid withdrawn successfully”
  - failure → “Failed to withdraw bid”
  - catch → “Withdrawal failed”
- Finally clears `withdrawing`.

UI disable:
- The clicked bid’s withdraw button is disabled while `withdrawing === bid.id`.

### 3) Withdraw all eligible bids (“I’m Out”)
UI: destructive **I’m Out** button.

Enablement:
- Disabled if:
  - `withdrawing === 'all'` OR
  - `withdrawableBids.length === 0`

Handler: `handleWithdrawAll()`
- Sets `withdrawing = 'all'`.
- Calls `await onWithdrawAll()`.
- Toasts:
  - success → “All eligible bids withdrawn”
  - failure → “Failed to withdraw all bids”
  - catch → “Failed to withdraw all bids”
- Finally clears `withdrawing`.

### 4) Add bid actions
UI:
- **Add 1%** → `onAddToBid('1%')`
- **Add 10%** → `onAddToBid('10%')`

Note:
- These are synchronous calls; parent is responsible for any async bid placement and for updating `userBids` / `userPoolTotal`.

## UI/UX notes (behavioral)
- Leading state messaging:
  - If leading: shows “🏆 You’re winning!” and a green notice indicating withdraw is blocked while leading.
  - If not leading: shows a yellow warning encouraging withdrawal or adding more bids.
- Strategy summary counts:
  - Displays counts of 1% bids and 10% bids via filters.
  - Displays Max Pain as `1` if any bid has `type === 'MAX_PAIN'` (not a count).
- Optional Max Pain limit display:
  - When `maxPainLimit` exists, shows “(MAX: … ETH)” next to pool total.
- Suggestion hint:
  - If `userBids.length >= 3` and `!maxPainLimit`, shows a “Consider MAX PAIN” tip.

## Audit checklist
- Verify parent rules for `canWithdraw` and `isLeading` are consistent with core auction rules (e.g., cannot withdraw while leading).
- Confirm `onWithdraw(bidId)` semantics:
  - This component assumes per-bid withdrawals; some core logic elsewhere may withdraw by bidder/pool instead.
- Confirm `onWithdrawAll()` behavior matches UI copy “All eligible bids”.
- Ensure `currentLeader` and `userBids.position` are consistent with what “#position” means in the product.
