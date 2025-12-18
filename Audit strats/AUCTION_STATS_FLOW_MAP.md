# Auction Stats + Network Health — Flow map

Scope: `components/bidding/auction-stats.tsx`.

Status note:
- No imports/usages found in the current app routing/UI. Treat as experimental/unwired unless intentionally planned to be integrated.

## Purpose
- Provide an informational “auction telemetry” panel:
  - Current price (with change animation)
  - Time remaining (with critical warning under 60s)
  - Total bids and active bidders
  - Optional “current leader” card
  - Static “bidding tips” card
- Provide a lightweight “network health” indicator:
  - Embedded as a full card inside `AuctionStats`
  - Also available as a tiny always-on indicator via `NetworkHealthMonitor`

## Exports
- Default export: `AuctionStats(props)`
- Named export: `NetworkHealthMonitor()`

## Data model
### `NetworkStats`
- `latency: number`
- `gasPrice: number`
- `blockTime: number`
- `congestionLevel: 'low' | 'medium' | 'high'`
- `transactionsPending: number`

## `AuctionStats` — Inputs / Props
- `currentPrice: number`
- `totalBids: number`
- `activeBidders: number`
- `timeRemaining: number` (seconds)
- `priceChange24h: number` (percent; positive/negative)
- `networkHealth: NetworkStats`
- `highestBidder?: string`

## `AuctionStats` — Internal State
- `realtimePrice: number` (initial: `currentPrice`)
- `priceChangeAnimation: boolean` (initial: `false`)

## `AuctionStats` — Side effects
### Price change animation
Trigger: `useEffect([currentPrice, realtimePrice])`
- If `currentPrice !== realtimePrice`:
  - `priceChangeAnimation = true`
  - `realtimePrice = currentPrice`
  - After 500ms: `priceChangeAnimation = false`

Notes:
- This is purely visual; it does not persist or emit events.

## `AuctionStats` — Derived formatting
- `formatTimeRemaining(seconds)`
  - If `hours > 0` → `${hours}h ${minutes}m ${secs}s`
  - Else → `${minutes}m ${secs}s`

- Network health styling helpers:
  - `getNetworkHealthColor(level)` returns text color class (green/yellow/red)
  - `getNetworkHealthBg(level)` returns background+border classes (green/yellow/red)

## `AuctionStats` — Render rules / UI flow
### A) Network Health card (top)
Always rendered.
- Displays:
  - A pulsing dot whose color matches `congestionLevel`
  - Badge label `LOW|MEDIUM|HIGH`
  - Grid stats: latency, gas price, block time
- Conditional warning:
  - If `transactionsPending > 10` shows a warning row.

### B) Auction statistics grid
Always rendered as a 2×2 grid:
1) Current price
- Displays `realtimePrice.toFixed(4) ETH`.
- Adds `animate-price-update` class while `priceChangeAnimation` is true.
- If `priceChange24h !== 0`, shows a % change line (green/red).

2) Time remaining
- Displays `formatTimeRemaining(timeRemaining)`.
- If `timeRemaining <= 60`, changes text styling and shows:
  - “Critical: Timer resets with bids!”

3) Total bids
- Displays `totalBids`.

4) Active bidders
- Displays `activeBidders`.

### C) Current leader card (optional)
Rendered only when `highestBidder` is provided.
- Shows a “Leading” badge.
- Displays a shortened address: `${first6}...${last4}`.

### D) Bidding tips card
Always rendered.
- Static copy indicating:
  - 1% bids update instantly
  - 10% bids wait for confirmation
  - MAX PAIN auto-bids to limit

## `NetworkHealthMonitor` — Purpose
- Shows a small pulsing dot fixed at `top-4 right-4` with a tooltip title describing network stats.

## `NetworkHealthMonitor` — State and effects
State:
- `networkStats: NetworkStats` (initial zeros, `congestionLevel: 'low'`)

Effect:
- `updateNetworkStats()` is called on mount, then every 10s via `setInterval`.
- The implementation is a simulation:
  - latency 50–150ms, gas 10–30 gwei, block time 10–15s, pending 0–49
  - congestion:
    - medium if `gasPrice > 20` OR `latency > 100`
    - high if `gasPrice > 25` OR `latency > 120`

Error handling:
- Catches errors; in non-production logs `console.error`.

## Audit checklist
- Confirm whether this surface is intended to be wired into the live auction page; currently it appears unused.
- If wired:
  - Ensure `timeRemaining` semantics match the auction’s actual countdown logic.
  - Ensure `networkHealth` is sourced from a real provider (current implementation is simulation-only).
- Validate visual thresholds:
  - “critical” warning triggers at `timeRemaining <= 60`.
  - pending tx warning triggers at `transactionsPending > 10`.
