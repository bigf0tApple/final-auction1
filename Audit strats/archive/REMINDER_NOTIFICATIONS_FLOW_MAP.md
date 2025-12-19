# Reminder + notifications flow map

This map documents how the app sets auction reminders via the browser Notifications API, and what (does/does not) persist.

Scope:

- Reminder entrypoints (Home upcoming cards + Calendar upcoming events)
- Reminder modal UX (`ReminderModal`)
- Notification permission + notification scheduling
- Reminder persistence (`localStorage["auctionReminders"]`)

## Entrypoint: Home “Set Reminder” button

Location: `app/page.tsx`

- Upcoming auction cards render a **Set Reminder** button.
- Click → `handleSetReminder(auction)` → `setSelectedAuctionForReminder(auction)`.
- When `selectedAuctionForReminder` is truthy, the page renders:
  - `<ReminderModal auction={selectedAuctionForReminder} onClose={...} isDark={...} />`

Data passed into the modal:

- `auction` is a plain object with fields: `id`, `title`, `artist`, `startingBid`, `status`.

## Entrypoint: Calendar “Set Reminder” button

Location: `components/auction-calendar.tsx`

- Calendar renders a **Set Reminder** button only when `event.status === "upcoming"`.
- Click → `handleSetReminder(event)` → `setSelectedAuctionForReminder(event)`.
- When `selectedAuctionForReminder` is truthy, calendar renders:
  - `<ReminderModal ... />`

Important nuance: the calendar *transforms* the `status` passed into the modal:

- `status: getAuctionStatusWithTime(selectedAuctionForReminder)`

So the modal receives a human-readable string (ex: "Starting in 2h") rather than the raw `event.status` enum.

## Reminder modal: `ReminderModal`

Location: `components/reminder-modal.tsx`

State:

- `selectedOption`: one of `"start" | "5min" | "10min"` (defaults to `"start"`)
- `isSettingReminder`: disables the button while processing

### Permission gate

Function: `requestNotificationPermission()`

- Checks `"Notification" in window`
- Calls `Notification.requestPermission()`
- Continues only if permission is `"granted"`
- Otherwise shows `alert("Please enable notifications to set reminders")`

### Reminder time calculation

Function: `calculateReminderTime()`

- Parses the *modal input* `auction.status` using regex `/(\d+)h/` to extract an hour count.
- If no `Nh` match exists, defaults to `2` hours.
- Computes `reminderTime` relative to **now**:
  - `now + hours * 60m`
- Applies offsets:
  - `"start"`: no adjustment
  - `"5min"`: subtract 5 minutes
  - `"10min"`: subtract 10 minutes

Critical implication:

- Reminder timing is not derived from `auction.startTime` / schedule; it is derived from the text in `auction.status` (hours only) and uses the current time as the anchor.

### Scheduling the notification

Function: `setReminder()`

- Computes `timeUntilReminder = reminderTime - now`.
- If `timeUntilReminder <= 0` → `alert("This auction is starting too soon to set a reminder")`.
- Otherwise schedules a one-shot notification with `setTimeout(..., timeUntilReminder)`.

Notification payload:

- `title`: `Auction Starting: ${auction.title}`
- `body`: `by ${auction.artist} - Starting bid: ${auction.startingBid}`
- `tag`: `auction-${auction.id}`
- `requireInteraction: true`
- `icon`/`badge`: `/placeholder.svg?...` (placeholder asset)

## Persistence: `localStorage["auctionReminders"]`

Location: `components/reminder-modal.tsx`

On successful schedule:

- Reads `JSON.parse(localStorage.getItem("auctionReminders") || "[]")`
- Appends a record:
  - `auctionId`
  - `title`
  - `artist`
  - `reminderTime` (ISO string)
  - `type` (`start` | `5min` | `10min`)
  - `created` (ISO string)
- Writes back to `localStorage.setItem("auctionReminders", JSON.stringify(reminders))`

Current usage note:

- No other file reads `auctionReminders`, so reminders are not displayed/managed elsewhere and are not rehydrated to re-schedule notifications after reload.

## Practical limitations (audit-relevant)

- **Non-persistent scheduling**: `setTimeout` is lost if the tab is closed, page reloads, or the browser is restarted.
- **Schedule accuracy**: modal time is inferred from `auction.status` (hours only) and anchored to *now*, which can drift from actual `startTime`.
- **Browser constraints**: Notifications typically require a secure context (HTTPS) and user interaction; behavior varies by browser/OS.
- **Long delays**: very long `setTimeout` delays can be unreliable; browsers may throttle timers in background tabs.

## Audit checklist

- Verify the `auction.status` strings passed into `ReminderModal` always include an `Nh` segment if accurate timing is required.
- Verify the calendar uses `event.status === "upcoming"` consistently with the schedule resolver/status derivation.
- Confirm whether reminders should survive reloads; if yes, a rehydration/rescheduling mechanism is currently missing.
- Confirm notification assets (`/placeholder.svg`) are acceptable for production.
