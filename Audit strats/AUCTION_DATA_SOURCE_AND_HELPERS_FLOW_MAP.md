# AUCTION DATA SOURCE + HELPERS FLOW MAP

Scope:
- Data + helper module: `lib/auction-data.ts`

This map intentionally avoids duplicating the schedule algorithm deep dive; see:
- `AUCTION_SCHEDULE_LOGIC_MAP.md`

Related consumers:
- Home page: `app/page.tsx`
- Calendar: `components/auction-calendar.tsx`
- Reminder: `components/reminder-modal.tsx` (payload/status text)
- Admin mint (conflict checks): `app/admin-panel.tsx` (documented in `ADMIN_MINT_AUCTION_FLOW_MAP.md`)

---

## Purpose

- Treat `lib/auction-data.ts` as the current source-of-truth for auctions in the demo app.
- Document the schema, demo-data assumptions, and the difference between:
  - the persisted demo field `AuctionEvent.status` (static)
  - computed status strings derived from time + schedule (`getAuctionStatusWithTime`)

---

## Exported types

### `AuctionEvent`
Fields:
- `id: number`
- `title: string`
- `artist: string`
- `startTime: Date`
- `endTime: Date`
- `startingBid: string` (display string like `"1.00 ETH"`, not numeric)
- `status: "upcoming" | "live" | "ended"` (demo/static)
- optional metadata:
  - `description?: string`
  - `category?: string`
  - `royaltyPercent?: number`
  - `teaserImage?: string`
  - `mainImage?: string`

Audit note:
- `startTime`/`endTime` are real `Date` objects created at module-load time; any timezone behavior is the JS runtime’s local timezone.

---

## Exported data

### `upcomingAuctions: AuctionEvent[]`
- A static in-memory array of demo auctions (currently 22 entries).
- Dates are created via `new Date(year, monthIndex, day, hour, minute)`.

Timezone / Date constructor nuance:
- `new Date(y, m, ...)` uses the runtime’s local timezone.
- `monthIndex` is zero-based (January = 0).

Demo-data drift risk:
- The file header contains a “current date context” comment (August 2025). As real time moves forward (e.g., December 2025), some auctions may be in the past.
- The `status` field is not auto-updated and may no longer match reality; consumers that rely on `status` can diverge from computed time-based labeling.

---

## Helper functions (time/status)

### `getTimeUntilAuction(startTime, now = new Date()): string`
- Computes `diff = startTime - now`.
- Returns:
  - `"Starting now"` if `diff <= 0`
  - otherwise uses whole hours and days:
    - if `days > 0`: `Starting in {days}d {hours%24}h`
    - else: `Starting in {hours}h`

Nuance:
- Minutes/seconds are not shown for upcoming auctions; rounding uses `Math.floor` on hours.

### `getTimeRemaining(target, now = new Date())`
- Returns non-negative countdown components:
  - `totalSeconds` clamped to `>= 0`
  - `days`, `hours`, `minutes`, `seconds`

Used by:
- `app/page.tsx` countdown display (end of active auction or buffered next start)
- `getAuctionStatusWithTime` live strings

### `getAuctionStatusWithTime(auction, now = new Date(), activeAuctionId?: number | null): string`
Decision order:
1) If `auction.endTime <= now` → `"Ended"`
2) If `activeAuctionId` matches this auction → `"Live - ends in ..."` (based on `getTimeRemaining`)
3) If `auction.startTime <= now` → `"Queued"`
4) Else → `getTimeUntilAuction(auction.startTime, now)`

Important semantics:
- `auction.status` is not consulted.
- “Queued” means “has started by time, but is not the chosen `activeAuctionId`”.

Where it’s used:
- Home page (`app/page.tsx`) upcoming cards status badges.
- Calendar reminder modal payload status text (see `AUCTION_CALENDAR_FLOW_MAP.md`).

Audit note:
- In places where the calendar uses `event.status` for styling/gating, it can disagree with this computed string.

---

## Schedule helper

### `resolveAuctionSchedule(events, now)`
- Defined in this module, but documented in depth in `AUCTION_SCHEDULE_LOGIC_MAP.md`.

Key integration points to audit (data-level):
- The “10-minute buffer” rule exists here; other parts of the app (e.g., Admin mint overlap checks) may not apply the same buffer.

---

## Misc exports

### `currentLiveAuction`
- Exports a `launchPrice` used by the Max Pain modal (`app/page.tsx` passes `currentLiveAuction.launchPrice`).

Audit note:
- This is not tied to the schedule’s active auction and is currently a static number.

---

## Side effects / storage

- No `localStorage`.
- No network.
- No timers.

---

## Audit checklist

Data correctness:
- Ensure each event satisfies `endTime > startTime`.
- Confirm `id` uniqueness.
- Confirm `startingBid` is consistently formatted if it’s displayed directly.

Status correctness:
- Decide whether `AuctionEvent.status` should be treated as authoritative or removed in favor of computed status.
- If the calendar must only allow reminders for truly-upcoming events, either:
  - compute truth from time/schedule, or
  - keep `status` updated when time passes.

Timezone correctness:
- If auctions must be globally consistent, avoid `new Date(y, m, ...)` (local timezone) and prefer UTC/ISO timestamps.

Demo → production migration:
- Identify the intended future source of truth (DB/API) and how to keep `upcomingAuctions` and schedule state synced.
