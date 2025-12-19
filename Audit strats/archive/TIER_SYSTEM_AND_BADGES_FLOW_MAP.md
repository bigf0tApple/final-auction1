# TIER SYSTEM + BADGES FLOW MAP

Scope:
- Tier modal: `components/tier-system.tsx`
- Tier computation + UI expansion behavior inside the modal
- Usage status: as of this audit, `TierSystem` has no import/usages found elsewhere in the repo (caller contract only)

## What this component is

`TierSystem` is a modal overlay that explains bidder “levels” based on `userBidCount` and presents:
- Current tier card + progress to next tier
- A grid of all tiers (expand/collapse to reveal perks)

It does **not** persist tier state; it is a pure UI presentation component.

## Inputs and sources of truth

Props:
- `onClose(): void` (caller-defined close behavior)
- `isDark: boolean` (styling only)
- `userBidCount: number` (the sole input driving tier selection)

Local state:
- `selectedTier: number | null`
  - controls which tier card in the grid is expanded to show perks

Data:
- `tierLevels: TierLevel[]` is hardcoded in the component.

Side effects:
- none (no storage, no network, no DOM mutations)

## Tier definitions (hardcoded)
File: `components/tier-system.tsx`

Levels:
- L1: 0–9 bids
- L2: 10–19 bids
- L3: 20–29 bids
- L4: 30–39 bids
- L5: 40–49 bids
- L6: 50+ bids

Each tier defines:
- label/display name
- min/max bid thresholds
- `color` + `bgColor` classes
- icon
- perks list + description

## Core computation

### Determine current tier
Function: `getCurrentTier(bidCount)`
- returns the first tier where:
  - `bidCount >= minBids` AND (`maxBids === null` OR `bidCount <= maxBids`)
- falls back to `tierLevels[0]` (L1)

### Determine next tier
- `nextTier = tierLevels.find(tier => tier.level === currentTier.level + 1)`

### Progress calculation
- If `nextTier` exists:
  - `progressToNext = ((userBidCount - currentTier.minBids) / (nextTier.minBids - currentTier.minBids)) * 100`
- Else:
  - `progressToNext = 100`

## User flows

### Flow A — Open tier system modal
Caller responsibility:
- caller conditionally renders `<TierSystem onClose={...} isDark={...} userBidCount={...} />`

Initial state:
- `selectedTier = null`

Outcome:
- modal overlay appears showing current tier and tier grid

### Flow B — Close modal
UI:
- header close button (X)

Handler:
- `onClick={onClose}`

Outcome:
- caller unmounts modal

### Flow C — Expand/collapse a tier card
UI:
- click a tier `Card` in the “All Tiers Grid”

Handler:
- `onClick={() => setSelectedTier(selectedTier === tier.level ? null : tier.level)}`

Outcome:
- toggles perks section within that tier card

### Flow D — Visual unlocked/locked tiers
Logic:
- `isUnlocked = userBidCount >= tier.minBids`
- `isCurrent = tier.level === currentTier.level`

Styling outcomes:
- Current tier uses that tier’s `bgColor` + stronger border/shadow.
- Unlocked tiers use lighter styling + hover shadow.
- Locked tiers show reduced opacity.

## Guardrails and invariants

- No attempt is made to clamp `userBidCount` (caller must provide sane values).
- Tiers are derived purely from thresholds; there is no persisted tier state.
- Copy text claims (e.g. chat name color changes) are informational; the chat currently uses a mock `userBidCount` inside `components/auction-chat.tsx` and does not integrate with this component.

## Audit notes / risks

- Unwired surface:
  - `TierSystem` has no call sites; if tiers are part of the product, it needs an entrypoint.

- Source-of-truth mismatch:
  - `auction-chat.tsx` computes badges from a hardcoded `userBidCount = 15` and has a different badge model than this modal’s tier grid.
  - If tiers should reflect real bidding activity, `userBidCount` needs a shared source (likely derived from `auctionState` / history).

- Accessibility:
  - Close button is icon-only and lacks an explicit `aria-label`.
  - Tier cards are clickable `Card` components rather than semantic buttons.

## Manual test checklist

- Mount the modal with different `userBidCount` values:
  - 0 → L1, shows progress to L2
  - 10 → L2
  - 20 → L3
  - 30 → L4
  - 40 → L5
  - 50 → L6, progress shows 100 and no next tier

- Click tier cards:
  - expands and collapses perks

- Click X:
  - calls `onClose`
