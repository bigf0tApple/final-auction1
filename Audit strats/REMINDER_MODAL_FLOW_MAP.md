# ReminderModal — flow map

Scope

- `components/reminder-modal.tsx`
- Call sites:
  - `app/page.tsx` (upcoming auction cards)
  - `components/auction-calendar.tsx` (calendar event details)

Purpose

- Let the user schedule a one-shot browser notification reminder for an upcoming auction.
- Persist a record of the reminder to `localStorage` (note: persistence does not re-schedule notifications after reload).

---

## 1) Entrypoints and data shape

### A) Home page → ReminderModal

File: `app/page.tsx`

- User action: click **Set Reminder** on an upcoming auction card.
- Handler: `handleSetReminder(auction)` → `setSelectedAuctionForReminder(auction)`.
- Render condition:
  - `{selectedAuctionForReminder && <ReminderModal auction={selectedAuctionForReminder} onClose={() => setSelectedAuctionForReminder(null)} isDark={isDark} />}`

Data passed (`auction` prop)
- `{ id, title, artist, startingBid, status }`.

### B) Auction calendar → ReminderModal

File: `components/auction-calendar.tsx`

- User action: click **Set Reminder** (only when `event.status === 'upcoming'`).
- Handler: `handleSetReminder(event)` → `setSelectedAuctionForReminder(event)`.
- Render condition:
  - `{selectedAuctionForReminder && <ReminderModal auction={...} onClose={() => setSelectedAuctionForReminder(null)} isDark={isDark} />}`

Important nuance
- Calendar *transforms* `auction.status` before passing it into the modal:
  - `status: getAuctionStatusWithTime(selectedAuctionForReminder)`
- This typically yields a string like “Starting in 2h …” (human readable).

---

## 2) Modal UI: click targets and state

File: `components/reminder-modal.tsx`

Local state
- `selectedOption: 'start' | '5min' | '10min'` (default `'start'`).
- `isSettingReminder: boolean` (disables Set Reminder button, changes label to “Setting...”).

Click targets
- Close **X** (top-right): calls `onClose()`.
- Radio options:
  - “When it starts” (`value='start'`)
  - “5 minutes before” (`value='5min'`)
  - “10 minutes before” (`value='10min'`)
- Footer buttons:
  - **Cancel**: calls `onClose()`.
  - **Set Reminder**: calls `setReminder()`.

---

## 3) Permission + scheduling logic

### A) Permission gate

Function: `requestNotificationPermission()`

- If `"Notification" in window`:
  - `await Notification.requestPermission()`
  - returns true only when permission is `'granted'`.
- Else returns false.

Failure UX
- If permission not granted:
  - `alert('Please enable notifications to set reminders')`
  - stops.

### B) Reminder time calculation

Function: `calculateReminderTime()`

- Parses the `auction.status` text:
  - `auction.status.match(/(\d+)h/)` → hours
  - fallback hours = `2` if no match.
- Anchor = **now** (`new Date()`).
- Base reminder time = `now + hours`.
- Adjust based on `selectedOption`:
  - `'start'`: no change
  - `'5min'`: subtract 5 minutes
  - `'10min'`: subtract 10 minutes

Critical implication
- The reminder is **not** computed from an absolute `startTime`.
- Timing accuracy depends on the `auction.status` string containing a correct `Nh` segment.

### C) Scheduling the notification

Function: `setReminder()`

1) `setIsSettingReminder(true)`
2) Permission check (above)
3) Compute:
- `reminderTime = calculateReminderTime()`
- `timeUntilReminder = reminderTime - now`
4) Guard:
- If `timeUntilReminder <= 0`:
  - `alert('This auction is starting too soon to set a reminder')`
  - stops.
5) Schedule:
- `setTimeout(() => new Notification(...), timeUntilReminder)`.

Notification payload
- Title: `Auction Starting: ${auction.title}`
- Body: `by ${auction.artist} - Starting bid: ${auction.startingBid}`
- `tag: auction-${auction.id}`
- `requireInteraction: true`
- Placeholder icon/badge URLs.

Success UX
- `alert("Reminder set! You'll be notified ...")`
- Calls `onClose()`.

Error path
- Logs error in non-production.
- Alerts: `Failed to set reminder. Please try again.`

Finally
- `setIsSettingReminder(false)`.

---

## 4) Persistence

Storage key
- `localStorage['auctionReminders']` (JSON array)

Write behavior (in `setReminder()`)
- Reads existing array (default `[]`).
- Appends:
  - `auctionId`, `title`, `artist`, `reminderTime` (ISO), `type` (selectedOption), `created` (ISO)
- Writes back.

Current limitation
- No other code reads `auctionReminders` or re-schedules pending reminders on reload; the `setTimeout` is session-only.

---

## Audit checklist

- Confirm `auction.status` format always contains an `Nh` segment when accurate scheduling matters.
- Confirm expected behavior on reload/tab close (currently: reminder record persists, scheduled notification does not).
- Confirm Notification API behavior in target browsers (permission, secure context requirements, background throttling).
- Confirm placeholder icon/badge assets are acceptable for production.
