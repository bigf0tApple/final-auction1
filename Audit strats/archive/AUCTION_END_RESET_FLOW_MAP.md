# Auction end + reset flow map

This map documents what happens when an auction ends, how the app prevents duplicate “end” triggers, and how chat history resets differently for normal users vs admins.

## Primary trigger: 1-second schedule tick

Location: `app/page.tsx`

- A `setInterval` tick runs every 1000ms.
- Each tick:
  - Computes `schedule = resolveAuctionSchedule(upcomingAuctions, now)`.
  - Chooses a countdown `target` (`activeAuction.endTime` → `bufferedNextStart` → `nextAuction.startTime`).
  - Computes `remaining = getTimeRemaining(target, now)`.

### End-of-auction gate (anti-double-fire)

Location: `app/page.tsx`

The “auction ended” branch runs only when all of these are true:

- `remaining.totalSeconds === 0`
- `schedule.activeAuction` exists
- `lastCompletedAuctionId.current !== schedule.activeAuction.id`

When it runs:

- Sets `lastCompletedAuctionId.current = schedule.activeAuction.id`
- Sets `lastEndedAuctionId` state to the ended auction id
- Emits a notification: `"Auction has ended!"`
- Calls `completeAuction()` (async)
- After it resolves, schedules another notification 2 seconds later:
  - Winner + winning bid message, or
  - A “Congratulations” message if current user is winner

Reset behavior:

- When a new `activeAuction` appears with a different id, the code clears the ref:
  - If `schedule.activeAuction` exists and `lastCompletedAuctionId.current` is set but does not match, then `lastCompletedAuctionId.current = null`.

Audit note:

- This reset is crucial so the next auction can trigger its own end event.

## Completion side-effects in auction state

Location: `hooks/use-auction-state.ts` (`completeAuction`)

`completeAuction()`:

- Early-return: if `auctionState.isEnded` is already `true`, returns `Promise.resolve()`.
- Captures:
  - `winner = auctionState.highestBidder`
  - `winningBid = auctionState.currentBid`
- Updates state:
  - `isEnded = true`
  - `winner = winner`
  - `endTime = new Date()`
- Simulates refunds:
  - Creates time-delayed promises for each non-winning bidder pool.
  - If winner had Max Pain active, simulates a “max pain refund” promise.

Audit note:

- `completeAuction()` does not reset bids/pools for a subsequent auction; the per-auction state model is simulated and appears globally scoped.

## UI: completion feedback surfaces

### Toast/notification

Location: `app/page.tsx` + `components/bid-notification.tsx`

- End-of-auction feedback is shown via `BidNotification` (not via `AuctionCompletionModal`).
- Two notifications occur:
  1. Immediate: `"Auction has ended!"`
  2. After `completeAuction()` resolves + 2 seconds: winner message

### AuctionCompletionModal status

Location: `components/auction-completion-modal.tsx`

- A standalone component exists, auto-closes after 8 seconds.
- No active usage found in the current code paths.

Audit note:

- If you expect a completion modal, verify whether it’s intentionally unused or should be wired back in.

## Chat reset & history behavior

Chat entrypoint:

- `app/page.tsx` passes these props into `ChatButton`:
  - `activeAuctionId={activeAuction?.id ?? null}`
  - `lastEndedAuctionId={lastEndedAuctionId}`
  - `isFinalTenSeconds={isFinalTenSeconds}`
- `ChatButton` passes them through to `AuctionChat`.

### Per-auction history for admins

Location: `components/auction-chat.tsx`

Data structures:

- `messages` state: current chat messages displayed.
- `messagesByAuction` ref: `Record<string, Message[]>` cache keyed by auction id string.
- `previousAuctionId` ref: tracks the previously active auction id.

Behavior on `activeAuctionId` changes:

- Before switching:
  - If `previousAuctionId.current` exists and `messages.length > 0`, store current messages into `messagesByAuction[currentId]`.
- If there is no `activeAuctionId`:
  - `previousAuctionId.current = null`
  - If NOT admin: `setMessages([])`
- If there is an `activeAuctionId`:
  - `previousAuctionId.current = activeAuctionId`
  - If admin and cache exists for this auction id: restore cached messages
  - Else if NOT admin: clear messages (`setMessages([])`)

Interpretation:

- Admins keep per-auction history across auction switches.
- Non-admins always see a fresh chat when the active auction changes.

### Clear-on-auction-end for non-admins

Location: `components/auction-chat.tsx`

- On `lastEndedAuctionId` change:
  - If `lastEndedAuctionId` is truthy and user is NOT admin: `setMessages([])`

Interpretation:

- When an auction ends, normal users’ chat clears even if the active auction id hasn’t changed yet.
- Admin chat is not cleared on auction end.

## Final-10-seconds enforcement (chat quick-bid)

Location: `components/auction-chat.tsx`

- `handleQuickBid("min")` checks `isFinalTenSeconds`:
  - If true, adds a system warning message and returns without bidding.
- `handleQuickBid("max")` proceeds normally.

## Audit checklist

- Verify end-of-auction trigger runs once per auction id:
  - Keep the page open as countdown hits `0` and ensure the “ended” notification does not repeat.
- Verify `lastCompletedAuctionId` resets when a new auction becomes active.
- Verify non-admin chat clears:
  - on active auction change
  - on `lastEndedAuctionId` update
- Verify admin chat retains per-auction history:
  - switch auctions, then switch back, history should restore
- Verify completion state changes:
  - `auctionState.isEnded` flips to true
  - refunds are simulated (time-delayed promises)
- Verify quick-bid rules in chat:
  - min-bid blocked in final 10 seconds
  - max-bid allowed
