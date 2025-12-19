# BID NOTIFICATIONS + TOASTS FLOW MAP

Scope:
- In-page notification banner: `components/bid-notification.tsx` used by `app/page.tsx`
- Sonner toasts (component-level): `toast` calls in `components/bidding/*` and `components/bidding/bid-pool-manager.tsx`
- Sonner Toaster wrapper: `components/ui/sonner.tsx` (mount location is critical)

## Two Notification Channels

### A) `BidNotification` (home-page notification)
- Trigger mechanism: `app/page.tsx` state `notification` (`{ message, type } | null`) via `setNotification(...)`.
- Render location: near the top of `app/page.tsx` JSX.
- Visual behavior: fixed floating panel near bottom center.

### B) Sonner `toast.*` calls (library toasts)
- Trigger mechanism: direct calls like `toast.success(...)`, `toast.error(...)`, `toast.info(...)`.
- Important: Sonner requires a mounted `Toaster` to actually render.

## Channel A — `BidNotification` lifecycle
File: `components/bid-notification.tsx`

Props:
- `message: string`
- `type: 'success' | 'error'`
- `onClose(): void`
- `isDark: boolean`

Internal behavior:
- Local state: `isVisible` drives fade animation.
- Auto-dismiss:
  - `useEffect` starts a 5s timer.
  - After 5s: sets `isVisible=false` then calls `onClose` after 300ms (to allow fade-out).
- Manual dismiss:
  - Clicking the **X** button sets `isVisible=false` and calls `onClose` after 300ms.

Effect on the page:
- `onClose` is typically `() => setNotification(null)`, which stops rendering the component.

## Channel A — Trigger sources (`app/page.tsx`)
`app/page.tsx` uses `setNotification({ message, type })` for these user-visible events:

### 1) Auction lifecycle
- When an active auction hits time remaining 0:
  - Immediate: `"Auction has ended!"` (success)
  - Later (after simulated completion): winner message (success)

### 2) Final 10 seconds notice
- When entering final 10 seconds window for an active auction (one-time per active auction):
  - `"Only 10% bids are accepted in the final 10 seconds."` (error)

### 3) Bidding (home buttons)
In `handleBid(bidType)`:
- If no wallet: `"Please connect your wallet to bid"` (error)
- If rate-limited: `"Please wait X seconds before bidding again"` (error)
- If final 10 seconds and `bidType === 'min'`: `"Final 10 seconds: only 10% bids are accepted."` (error)
- On bid placement:
  - Optimistic (1%): `"Bid placed at …"` (success) then `"1% bid confirmed: …"` (success)
  - 10%: after delay `"10% bid confirmed: …"` (success)
- On exception: `error.message` or `"Failed to place bid"` (error)

### 4) MAX PAIN (home button + modal)
- `handleMaxPain()`:
  - If no wallet: `"Please connect your wallet to use MAX PAIN"` (error)
  - If canceling: `"MAX PAIN cancelled"` (success)
- `handleMaxPainConfirm(maxAmount)`:
  - `"MAX PAIN activated up to …"` (success)

### 5) Pool withdrawal (“I’m Out, Thanks”)
In `handleOptOut()`:
- If no wallet: `"Please connect your wallet first"` (error)
- If highest bidder: `"You are the highest bidder and cannot withdraw"` (error)
- If no active pool: `"You don't have any active pool to withdraw from"` (error)
- On success: `"Successfully withdrew … ETH from your personal pool"` (success)
- On failure: `error.message` or `"Failed to withdraw from pool"` (error)

## Channel B — Sonner toasts

### Where `toast.*` is called
- `components/bidding/bidding-engine.tsx`
  - Info: bid placed, confirming, timer extended
  - Success/error: bid confirmation/failure/transaction failure
- `components/bidding/max-pain-controller.tsx`
  - Success/error: activated/updated/deactivated/failed
- `components/bidding/bid-pool-manager.tsx`
  - Success/error: withdraw per bid, withdraw all

### Where the Toaster is defined
- `components/ui/sonner.tsx` exports `Toaster` (wrapper around `sonner`’s `Toaster as Sonner`).

### Critical integration note (visibility)
- `app/layout.tsx` does not currently mount `components/ui/sonner`’s `Toaster`.
- If `Toaster` is not mounted anywhere else, Sonner `toast.*` calls will not render in the UI.

## Audit Checklist
- Confirm which notification channel a feature uses:
  - Home page actions generally use `BidNotification` via `setNotification`.
  - Some bidding/pool components use Sonner `toast.*`.
- Verify Toaster mounting:
  - If you expect Sonner toasts to show, ensure `Toaster` is rendered in a root layout or top-level page.
- Check duplication:
  - Some actions may emit both a `BidNotification` (home page) and a Sonner toast (embedded component).
- Check timing/collisions:
  - `BidNotification` overwrites previous message (single `notification` state), while Sonner can queue multiple.
