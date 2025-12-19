# Chat Day Modal + Export — Flow map

This map documents the Admin Panel’s **Chat History (Last 7 Days)** surface:

- Viewing a single day’s messages ("Chat Day" modal)
- Selecting multiple days
- Exporting selected days to CSV
- Deleting selected days

It also calls out a key implementation nuance: there are **two different ChatDayModal implementations** in the codebase, and the Admin Panel currently uses the **inline** one.

---

## Primary files

- `app/admin-panel.tsx`
  - Owns the Chat Management tab UI
  - Owns selection state (`selectedHistoryDays`, `selectedChatDay`)
  - Implements multi-day export (`exportSelectedHistory`) and delete (`deleteSelectedHistory`)
  - Defines an **inline** `ChatDayModal` component and renders it when `selectedChatDay` is set
- `components/chat-day-modal.tsx`
  - A separate, shared-component style `ChatDayModal` with **single-day export** (`Export Day`)
  - Currently appears **unused** (no import sites found)

---

## State model (Admin Panel)

### Local React state

- `selectedHistoryDays: string[]`
  - Which day rows are selected via checkbox
  - Used by:
    - Export Selected button visibility and count
    - Delete Selected button visibility and count
    - `exportSelectedHistory()` CSV generation
    - `deleteSelectedHistory()` confirmation

- `selectedChatDay: { date: string; dayName: string } | null`
  - Which day is currently being viewed in the modal
  - When set → modal renders
  - When cleared → modal closes

### Data source

- `chatHistory` is a local constant array of 7 objects (mock):
  - `{ date, dayName, messageCount, activeUsers, warnings }`

No data is currently pulled from auction chat state; the list is **mock-only**.

---

## Flow A — View a single day (open Chat Day modal)

### UI action

- In **Chat Management** tab → **Chat History (Last 7 Days)** card
- Click the day row’s text block (not the checkbox):
  - `<div onClick={() => viewDayHistory(day.date, day.dayName)} ...>`

### Handler chain

- `viewDayHistory(date, dayName)`
  - `setSelectedChatDay({ date, dayName })`

### Render outcome

- Conditional render near the bottom of `app/admin-panel.tsx`:
  - `selectedChatDay && <ChatDayModal date=... dayName=... onClose=... isDark=... />`

### Side effects

- None (state-only)

---

## Flow B — Close Chat Day modal

### UI action

- Click the X button inside the modal

### Handler

- Inline `ChatDayModal` button calls `onClose()`
- Admin panel passes:
  - `onClose={() => setSelectedChatDay(null)}`

### Outcome

- `selectedChatDay` becomes `null`
- Modal unmounts

---

## Flow C — Select days (checkbox multi-select)

### UI action

- Toggle checkbox per day row

### Handler

- `toggleHistorySelection(date)`
  - `setSelectedHistoryDays(prev => prev.includes(date) ? prev.filter(...) : [...prev, date])`

### Outcome

- Selected day styling changes (row background/border)
- Bulk actions appear when `selectedHistoryDays.length > 0`:
  - `Export Selected (N)`
  - `Delete Selected (N)`

### Side effects

- None (state-only)

---

## Flow D — Export selected days (multi-day CSV)

### UI action

- Click `Export Selected (N)` in Chat Management header

### Guard

- If `selectedHistoryDays.length === 0`:
  - `alert("Please select days to export")`
  - return

### CSV generation

- Builds `csvHeaders` with a **wide schema** (includes `IP_Address`, `Session_ID`, etc.)
- For each selected date:
  - finds the day in `chatHistory`
  - generates a fixed set of sample `messages` (mock)
  - emits rows with CSV escaping for quotes in message text

### Download side effects (DOM)

- `new Blob([csvContent], { type: "text/csv;charset=utf-8;" })`
- `window.URL.createObjectURL(blob)`
- Creates a temporary `<a>` element, clicks it, removes it
- Revokes the object URL
- Shows an alert success message

### Output

- Download filename:
  - `ARPO_Chat_Export_${N}_Days_${YYYY-MM-DD}.csv`

---

## Flow E — Delete selected days

### UI action

- Click `Delete Selected (N)`

### Guard / confirmation

- `confirm("Delete chat history for N selected days?")`

### Outcome

- On confirm:
  - `alert("Deleted chat history for N days")`
  - `setSelectedHistoryDays([])`

### Notes

- This does **not** mutate `chatHistory` (it’s a constant)
- There is no persistence; behavior is effectively a mock UI

---

## Duplicate modal implementations (important)

### 1) Inline modal in `app/admin-panel.tsx` (USED)

- `const ChatDayModal = (...) => { ... }`
- Shows a header + close button
- Renders a few hardcoded sample message blocks
- Accepts `isDark` in the props type but does not currently use it in the component body

### 2) Shared modal in `components/chat-day-modal.tsx` (UNUSED)

- Exports default `ChatDayModal({ date, dayName, onClose, isDark })`
- Maintains a `chatMessages` mock array in state
- Implements **single-day** CSV export via `Export Day`:
  - Columns: `Date,User,Message,Timestamp,Action`
  - Same Blob → object URL → `<a>` click download pattern

### Risk

- Future wiring could accidentally update one modal while the UI renders the other, causing mismatched behavior (export format, theming, etc.).

---

## Audit checklist (what to verify)

- Modal open target: clicking the text block opens; checkbox toggles selection only
- Close correctness: X reliably clears `selectedChatDay`
- Bulk actions visibility: only when `selectedHistoryDays.length > 0`
- Export:
  - Correct filename
  - Rows generated for each selected day
  - Message CSV escaping (`""` inside quoted strings) works
  - Blob URL is revoked
- Delete:
  - Confirmation appears
  - Selection clears after confirm

---

## Known limitations (current implementation)

- Chat history list and exports are mock-only (no real chat message source)
- Search input in Chat Management header is present but not wired to filtering
- Two `ChatDayModal` implementations exist; only the inline one is rendered by Admin Panel
