# AUCTION CALENDAR FLOW MAP

Scope: `components/auction-calendar.tsx` and shared helpers/data in `lib/auction-data.ts`.

## Purpose
- Provide a read-only scheduling surface (week/month/year) that visualizes `upcomingAuctions` and lets users set reminders for `upcoming` auctions.
- Respect chat-pinning layout offsets when the chat is pinned left/right.

## Entry / Exit
- Open: controlled by parent (typically `app/page.tsx`) by rendering `AuctionCalendar`.
- Close: Header **X** button calls `onClose()`.

## Inputs / External Dependencies
- Props
  - `onClose(): void`
  - `isDark: boolean`
- Imported app state
  - `useChatPinned()` → `{ isChatPinnedLeft, isChatPinnedRight }`
- Data source
  - `auctionEvents = upcomingAuctions` (demo array in `lib/auction-data.ts`)
  - NOTE: Calendar uses the `AuctionEvent.status` field from the demo data for UI color and for gating reminder actions; it does not call `resolveAuctionSchedule()`.

## Internal State (React)
- `currentDate: Date` (initial `new Date()`)
- `view: "week" | "month" | "year"` (initial `"month"`)
- `selectedDate: Date | null` (initial `null`)
- `selectedAuctionForReminder: AuctionEvent | null` (initial `null`)

## Layout / Side Effects
- Overlay container adds a chat-offset class based on pin state:
  - If `isChatPinnedLeft` → `modal-with-chat-left`
  - Else if `isChatPinnedRight` → `modal-with-chat-right`
  - Else no offset class
- No storage writes. No network calls.

## Shared Helpers / Status Text
From `lib/auction-data.ts`:
- `getAuctionStatusWithTime(auction, now = new Date(), activeAuctionId?)`
  - If `auction.endTime <= now` → `"Ended"`
  - Else if `activeAuctionId && auction.id === activeAuctionId` → `"Live - ends in …"`
  - Else if `auction.startTime <= now` → `"Queued"`
  - Else → `getTimeUntilAuction()` → `"Starting in Xd Yh"` or `"Starting in Xh"`

Calendar usage:
- Reminder modal status is computed as `getAuctionStatusWithTime(selectedAuctionForReminder)`.
  - NOTE: `activeAuctionId` is not provided here, so “live” formatting will not be used from this call.

## Core UI Flows

### 1) View switching (Week / Month / Year)
UI: Dropdown in header controls.
- Click dropdown trigger → shows menu items: `week`, `month`, `year`.
- Click item → `setView(viewType)`.

Effects by view:
- `month` → renders `renderMonthView()`
- `week` → renders `renderWeekView()`
- `year` → renders `renderYearView()`

### 2) Date navigation (Prev / Next)
UI: Chevron left/right buttons.
- On click:
  - If `view === "year"` → `navigateYear("prev"|"next")` → adjusts `currentDate` by ±1 year.
  - Else (`week` or `month`) → `navigateMonth("prev"|"next")` → adjusts `currentDate` by ±1 month.

Label:
- `year` → shows year number
- `week` → `Week of {currentDate ...}` (note: week start used only for display here)
- `month` → `{Month Year}`

### 3) Month view grid rendering
Logic: `renderMonthView()`.
- Calculates:
  - `daysInMonth` via `new Date(y, m+1, 0).getDate()`
  - `firstDay` via `new Date(y, m, 1).getDay()`
- Renders:
  - 7 day-of-week headers
  - leading empty cells for `firstDay`
  - each day cell:
    - `events = getEventsForDate(date)` (matches by `toDateString()` on `event.startTime`)
    - `isToday`, `isSelected`

Day cell interactions:
- Click day cell → `setSelectedDate(date)`.

Event chip behavior inside a day cell:
- Shows at most 1 event chip; `+N more` if more exist.
- Clicking an event chip:
  - Stops propagation (`e.stopPropagation()`)
  - If `event.status === "upcoming"` → `handleSetReminder(event)` → opens reminder modal.
  - Else no action.

### 4) Week view rendering
Logic: `renderWeekView()`.
- Computes `startOfWeek` from `currentDate` by subtracting `currentDate.getDay()`.
- Builds 7 dates.
- Each day card:
  - renders up to 3 events (same `getEventsForDate()`)
  - click on event card:
    - If `event.status === "upcoming"` → `handleSetReminder(event)`

### 5) Year view rendering
Logic: `renderYearView()`.
- Renders 12 month tiles.
- Each tile counts events whose `event.startTime` month/year match the tile.
- Click month tile → `setCurrentDate(monthDate)` and `setView("month")`.

### 6) Selected date “details panel”
UI: Appears only when `selectedDate !== null`.
- Lists all events returned by `getEventsForDate(selectedDate)`.
- For each event:
  - shows title/artist/time window
  - badge uses `event.status`
  - shows starting bid
  - if `event.status === "upcoming"` → shows **Set Reminder** button:
    - click → `handleSetReminder(event)`
- If no events: shows “No auctions scheduled for this date.”

### 7) Reminder modal entry / exit
Entry:
- Any “Set Reminder” interaction sets `selectedAuctionForReminder`.
- Conditional render shows `ReminderModal` when `selectedAuctionForReminder` is non-null.

Props passed into `ReminderModal`:
- `auction: { id, title, artist, startingBid, status }`
  - `status` is computed via `getAuctionStatusWithTime(selectedAuctionForReminder)`
- `onClose` clears modal state: `setSelectedAuctionForReminder(null)`
- `isDark` is forwarded.

Exit:
- `ReminderModal` closes via its own close action → calls provided `onClose`.

## Guardrails / Constraints
- Reminder actions are only enabled for items where `event.status === "upcoming"`.
- Date/event matching uses `toDateString()` (local timezone; same-day comparison).
- Calendar does not mutate auction data, does not persist schedule state, and does not reconcile overlap/buffer rules (those are handled elsewhere via `resolveAuctionSchedule()` in main auction flow).

## Interaction Nuances / Edge Cases
- Week navigation uses the same prev/next controls as month:
  - `view === "week"` still calls `navigateMonth("prev"|"next")` (changes `currentDate` by ±1 month), even though the label reads “Week of …”.
- `selectedDate` is only set from month-view day-cell clicks.
  - Week/year interactions do not set `selectedDate`.
  - Switching views or navigating prev/next does not automatically clear `selectedDate`; the details panel may remain visible until the user selects a different day (or component unmount).
- Reminder gating is based on the event’s stored `event.status` (strict equality to `"upcoming"`) for enabling buttons/click actions.
  - The text passed into `ReminderModal` is computed via `getAuctionStatusWithTime(selectedAuctionForReminder)` and may diverge from the raw `event.status` styling/gating.

## Quick Audit Checklist (what to verify)
- `upcomingAuctions` is the intended source for the calendar.
- Any “live” labeling expectations: calendar UI uses `event.status` for styling, while reminder status text uses `getAuctionStatusWithTime()` without an `activeAuctionId`.
- Chat-pinned offset classes (`modal-with-chat-left/right`) align with global CSS and match other modal surfaces.
