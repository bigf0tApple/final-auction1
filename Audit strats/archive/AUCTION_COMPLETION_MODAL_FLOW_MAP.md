# AUCTION COMPLETION MODAL FLOW MAP

Scope:
- Completion UI component: `components/auction-completion-modal.tsx`
- Related auction-end feedback currently used: `app/page.tsx` + `components/bid-notification.tsx`

## What this component is

`AuctionCompletionModal` is a small, toast-like completion surface positioned at `top-4 right-4`.

Key properties:
- Not a full-screen modal.
- Auto-closes after a fixed timeout.
- Intended to show winner + winning bid (and optional Max Pain refund for the current user).

## Usage status (as of this audit)

- No active imports/usages found outside its own file.
- Auction-end feedback on the home page uses `BidNotification` and string messages in `app/page.tsx`, not this component.

Related doc pointer:
- `Audit strats/AUCTION_END_RESET_FLOW_MAP.md` already notes this component appears unused.

## Props / caller contract

File: `components/auction-completion-modal.tsx`

Required props:
- `winner: string`
- `winningBid: number`
- `totalBidders: number` (currently unused; accepted for API compatibility)
- `onClose(): void`
- `isDark: boolean`
- `isCurrentUser: boolean`

Optional props:
- `maxPainRefund?: number`

Caller responsibilities:
- Provide valid `winner` string long enough to safely render `winner.slice(0, 6)` and `winner.slice(-4)`.
- Implement `onClose` to unmount the component (or hide it) when called.

## Flow A — Show completion modal

### Entry
Caller conditionally renders `<AuctionCompletionModal ... />`.

### Render outcome
- A fixed-position container appears at the top-right.
- Content shows:
  - “Auction Complete!” title
  - Winner short address
  - Winning bid formatted to 4 decimals

### Optional branch: Max Pain refund
Guard:
- `isCurrentUser && maxPainRefund && maxPainRefund > 0`

Outcome:
- Shows a green-highlighted refund line: `Max Pain refund: {maxPainRefund.toFixed(4)} ETH`.

## Flow B — Manual close (X)

UI:
- Click the X button in the top-right of the toast.

Handler:
- `onClick={onClose}`

Outcome:
- Caller hides/unmounts the component.

## Flow C — Auto-close (timeout)

Mechanism:
- `useEffect` sets a timeout for 8000ms.

Handler:
- After 8s: calls `onClose()`.

Cleanup:
- `return () => clearTimeout(timer)`.

## Current production behavior (what users actually see)

File: `app/page.tsx`

Auction-end messaging is currently a two-step `BidNotification` sequence:
1) Immediate on end detection: `setNotification({ message: "Auction has ended!", type: "success" })`
2) After `completeAuction()` resolves + ~2 seconds:
   - winner / winning bid message string
   - special-case message when current wallet is the winner

Implication:
- If a “completion modal” is expected, it is not currently wired into the auction end flow.

## Audit notes / risks

- Address formatting assumes an address-like string; empty or short strings could render oddly.
- `totalBidders` is accepted but unused (currently suppressed via `void _totalBidders`).
- This component does not integrate with pinned-chat layout offsets (it is fixed top-right), so check overlap with other fixed UI.
- If you wire this into auction end:
  - decide whether it replaces `BidNotification` or complements it
  - ensure only one completion surface appears per auction end (avoid double-notify).

## Manual test checklist (if wired in)

- Show modal and ensure it auto-closes after ~8 seconds.
- Click X closes immediately.
- Winner formatting truncates correctly.
- `isCurrentUser=true` + `maxPainRefund>0` shows refund line; otherwise does not.
- Confirm it does not overlap critical UI at common breakpoints.
