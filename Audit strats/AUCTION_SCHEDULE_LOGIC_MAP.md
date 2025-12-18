# Auction schedule logic map

This map documents how auction scheduling is derived from the static event list and how the UI consumes that derived schedule.

## Source of truth

- Data source: `lib/auction-data.ts` exports `upcomingAuctions: AuctionEvent[]`.
- Event time fields are real `Date` instances (`startTime`, `endTime`) created at module-load time.

`AuctionEvent` fields used by schedule logic:

- `id`: identity for comparisons/exclusions.
- `startTime`, `endTime`: all schedule derivation is based on these.

## Key helper functions

### `getTimeRemaining(target, now)`

Location: `lib/auction-data.ts`

- Computes non-negative time remaining to a target date.
- Returns:
  - `totalSeconds` (clamped to `>= 0`)
  - `days`, `hours`, `minutes`, `seconds`

Used by:

- `app/page.tsx` countdown timer (live end, or next start).
- `getAuctionStatusWithTime` for “Live - ends in …” strings.

### `getAuctionStatusWithTime(auction, now, activeAuctionId?)`

Location: `lib/auction-data.ts`

Decision order:

1. If `auction.endTime <= now` → `"Ended"`
2. Else if `activeAuctionId` matches this auction → returns a *live* status string based on remaining time to `endTime`.
3. Else if `auction.startTime <= now` → `"Queued"`
4. Else → `getTimeUntilAuction(auction.startTime, now)` (e.g. `Starting in 2d 3h`)

Important nuance:

- “Queued” is *not* derived from the `auction.status` field; it’s computed purely from time + “not active”.
- On the home page, only the single chosen `activeAuction` is treated as “Live”; overlapping auctions that have started but aren’t selected as active will show as “Queued”.

Used by:

- `app/page.tsx` to compute per-card status strings for “What’s next”.
- `components/auction-calendar.tsx` only for the reminder modal display (`status: getAuctionStatusWithTime(selectedAuctionForReminder)`).

## Core schedule resolver

### `resolveAuctionSchedule(events, now): AuctionSchedule`

Location: `lib/auction-data.ts`

Returns:

- `activeAuction: AuctionEvent | null`
- `nextAuction: AuctionEvent | null`
- `upcomingQueue: AuctionEvent[]` (future-starting auctions only)
- `hasOverlap: boolean` (includes the 10-minute buffer constraint)
- `bufferedNextStart: Date | null`

#### Sorting

- Creates `sorted = [...events].sort((a,b) => a.startTime - b.startTime)`.

#### Buffer definition

- `BUFFER_MS = 10 * 60 * 1000` (10 minutes).

#### Overlap detection (`hasOverlap`)

For each consecutive pair in `sorted`:

- Overlap is flagged if:
  - `event.startTime < prev.endTime + BUFFER_MS`

This treats “too-close” auctions as overlap even if they don’t literally overlap in time.

#### Active auction selection (`activeAuction`)

- Picks the first event in `sorted` such that:
  - `event.startTime <= now < event.endTime`

Nuance:

- If multiple events satisfy this (true overlaps), the *earliest-by-startTime* matching event wins.

#### Buffer gate calculation

- `lastEnded` is the last event with `endTime <= now`.
- `lastEndTime` is:
  - `activeAuction.endTime` if an auction is active, else
  - `lastEnded.endTime` if any ended exists, else
  - `now`
- `bufferGate = lastEndTime + BUFFER_MS`

Interpretation:

- If there is an active auction, the buffer gate is “active end + 10 minutes”.
- If there is no active auction, it is “last ended + 10 minutes” (or `now + 10 minutes` if nothing has ended yet).

#### Upcoming queue (`upcomingQueue`)

- Includes only events with `event.startTime > now`.
- Excludes the `activeAuction` by id.

Nuance:

- An event with `startTime <= now` but not chosen as `activeAuction` will *not* appear in `upcomingQueue`.

#### Next auction (`nextAuction`)

- `nextAuction = upcomingQueue[0] ?? null`.

#### Buffered start (`bufferedNextStart`)

- If there is a `nextAuction`, compute:
  - `bufferedNextStart = new Date(max(nextAuction.startTime, bufferGate))`

Interpretation:

- This is an *effective* start used by the UI for countdown display.
- It does **not** mutate `nextAuction.startTime`.

## UI wiring (home page)

### Schedule tick loop

Location: `app/page.tsx`

- A `setInterval` runs every 1 second.
- On each tick:
  - `now = new Date()`
  - `schedule = resolveAuctionSchedule(upcomingAuctions, now)`
  - state updates:
    - `activeAuction`, `nextAuction`, `upcomingQueue`
  - countdown `target` selection:
    - `activeAuction?.endTime` else
    - `schedule.bufferedNextStart` else
    - `schedule.nextAuction?.startTime` else
    - `null`
  - `timeLeft = getTimeRemaining(target, now)`

### Overlap warning

Location: `app/page.tsx`

- If `schedule.hasOverlap` becomes true, logs a dev-only warning once:
  - `"Auction schedule has overlapping start/end times; later auctions are held until the active slot completes."`

Audit note:

- The UI message assumes “held until the active slot completes”; this is primarily reflected in the countdown target using `bufferedNextStart`.

### “What’s next” cards

Location: `app/page.tsx`

- Card source list:
  - `upcomingQueue` if non-empty else fallback to `upcomingAuctions`
- Per-card status string:
  - `getAuctionStatusWithTime(auction, currentTime, activeAuction?.id ?? null)`

## UI wiring (calendar)

Location: `components/auction-calendar.tsx`

- Calendar listing colors are driven by `event.status` (a field on the demo data), not by computed schedule status.
- `getAuctionStatusWithTime` is used for the reminder modal payload string.

Audit note:

- If `event.status` is stale or inconsistent, calendar styling may not match computed “live/ended/queued” strings.

## Edge cases / invariants to validate

- Data invariant: for every event, `endTime > startTime`.
- Sort invariant: `resolveAuctionSchedule` assumes `startTime` defines the event ordering.
- Overlap invariant: `hasOverlap` triggers if there is less than a 10-minute gap between consecutive auctions.
- Countdown invariant: `getTimeRemaining` never goes negative; countdown shows `0` when target passes.

Potential mismatch to watch for during audits:

- True overlaps can produce multiple “active” candidates; the resolver picks only the earliest-by-start-time as `activeAuction`.
- `bufferedNextStart` only affects countdown display; it does not prevent `activeAuction` from becoming active when `now >= nextAuction.startTime`.

## Audit checklist

- Verify all event times (`startTime`, `endTime`) are in the intended timezone and serialized consistently.
- Confirm there are no consecutive auctions where `next.startTime < prev.endTime + 10 minutes`.
- Manually simulate time boundaries:
  - just before `startTime`
  - between `startTime` and `endTime`
  - just after `endTime`
  - during the 10-minute buffer window
- Confirm home countdown target:
  - counts down to live end when active
  - otherwise counts down to buffered next start
- Confirm “What’s next” cards are sourced from `upcomingQueue` and statuses are computed from `getAuctionStatusWithTime`.
