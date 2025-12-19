# Admin panel — button map

Primary file: `app/admin-panel.tsx`

This panel is currently demo-oriented (mock data + `alert/confirm`) but it still has real side effects:

- Updates theme via `toggleTheme()` (caller-owned, implemented in `app/page.tsx`)
- Writes `localStorage['blockedWords']` which directly affects chat filtering in `components/auction-chat.tsx`
- Exports CSV via Blob download (client-only)

## Sources of truth / side effects

- Navigation state: `activeTab` (`analytics` | `users` | `chat` | `mint`)
- Analytics time frame: `selectedTimeFrame` and `showDetailedChart`
- User search: `searchTerm` (filters `mockUsers`)
- Chat management:
  - `blockedWords` state initialized from `localStorage['blockedWords']` (or defaults)
  - `selectedHistoryDays` selection state
  - `selectedChatDay` opens `ChatDayModal`
- Mint form state: `mintForm` + `showMintConfirmation`
- Global side effect:
  - injects a `<style>` tag into `document.head` (date/time input theming), cleaned up on unmount

## Entry/exit buttons

1) Back to Auction

- Handler: `onClose()` (prop)
- Wired from `app/page.tsx`: `onClose={() => setShowAdminPanel(false)}`
- Effect: returns user to main auction UI

2) Theme toggle

- Handler: `toggleTheme()` (prop)
- Effect: toggles theme and persists `localStorage['isDark']` (see `app/page.tsx`)

## Tab navigation buttons

- Analytics: `setActiveTab('analytics')`
- User Management: `setActiveTab('users')`
- Chat Management: `setActiveTab('chat')`
- Mint NFT: `setActiveTab('mint')`

No side effects beyond changing the rendered section.

## Analytics tab actions

1) Time frame selector (7d/1m/3m/…)

- Handler: `setSelectedTimeFrame(frame.key)`
- Effect: re-renders charts with the selected time frame

2) Metric card “detail” icons (clickable lucide icons)

- Total Sales `$` icon → `openDetailedChart('sales')`
- Total Bids gavel icon → `openDetailedChart('bids')`
- Total Volume trending icon → `openDetailedChart('volume')`
- Active Users activity icon → `openDetailedChart('users')`
- Joined Users user-plus icon → `openDetailedChart('joined')`
- Live Users eye icon → `openDetailedChart('live')`

3) Chart modal actions (`ChartModal`)

- Close `X` → `onClose()` → `setShowDetailedChart(null)`
- Modal time frame buttons → `setModalTimeFrame(frame.key)`

Notes:
- Chart modal displays demo stats with `Math.random()`; correctness audit should focus on wiring, not values.

## User management tab actions

1) Search input

- Handler: `setSearchTerm(e.target.value)`
- Effect: filters `mockUsers`

2) Blacklist / Unblock button per user

- Handler: `toggleUserStatus(user.address)`
- Current implementation: TODO stub (no side effects; `void address`)
- Intended effect (future): persist user status change in backend

## Chat management tab actions

A) Export / Delete selected days

- Checkbox toggles selection:
  - Handler: `toggleHistorySelection(day.date)`
- Export Selected button:
  - Handler: `exportSelectedHistory()`
  - Guardrails:
    - blocks when `selectedHistoryDays.length === 0`
  - Side effects:
    - Creates CSV string
    - Downloads via Blob + anchor click
    - Shows alert
- Delete Selected button (appears in two places):
  - Handler: `deleteSelectedHistory()`
  - Guardrails:
    - confirmation dialog
  - Side effects:
    - Clears selection (no persistence)

B) Blocked words management

- New word input: `setNewBlockedWord(e.target.value)`
- Add Word button:
  - Handler: `addBlockedWord()`
  - Guardrails:
    - trims + lowercases
    - prevents duplicates
  - Side effects:
    - updates state
    - writes `localStorage['blockedWords']`
    - shows alert
- Remove word `×` inside badge:
  - Handler: `removeBlockedWord(word)`
  - Guardrails:
    - confirmation dialog
  - Side effects:
    - updates state
    - writes `localStorage['blockedWords']`

C) Day history viewer

- Clicking the day text block:
  - Handler: `viewDayHistory(day.date, day.dayName)` → `setSelectedChatDay({date, dayName})`
- ChatDayModal close `X`:
  - Handler: `onClose={() => setSelectedChatDay(null)}`

D) Moderation table

- Unblacklist button (only for blacklisted records):
  - Handler: `unblacklistUser(record.userAddress)`
  - Guardrail: confirm
  - Current effect: alert only (demo)

## Mint tab actions

A) File uploads

- Main image dropzone is a hidden `<input type="file">` overlay:
  - Handler: `handleImageUpload(e)`
  - Guardrail: max file size 10MB
  - Effect: stores `File` in `mintForm.uploadedImage`
- Teaser image file input:
  - Handler: `handleTeaserImageUpload(e)`
  - Guardrail: max file size 10MB
  - Effect: stores `File` in `mintForm.teaserImage`

B) Form fields

- Inputs and textarea update `mintForm` via `setMintForm({...mintForm, field: value})`

C) Duration mode + selection

- Mode buttons:
  - Quick Select → sets `mintForm.durationMode='quick'`
  - Custom Duration → sets `mintForm.durationMode='custom'`
- Preset duration buttons (1h/6h/…):
  - sets `mintForm.duration`
- Custom duration numeric inputs:
  - sets `mintForm.customDuration.days/hours/minutes`

D) Mint Now

- Handler: `handleMintSubmit()`
- Guardrails:
  - Requires all fields + both images
  - Requires auction start in the future
  - Prevents overlapping with `upcomingAuctions` (direct in-memory conflict check)
  - Enforces custom duration 1 minute–3 days
- Effect:
  - opens `showMintConfirmation=true`

E) Mint confirmation modal

- Cancel: `setShowMintConfirmation(false)`
- Confirm Mint: `confirmMint()`
  - Effect (demo): alert success, closes confirmation, resets `mintForm`

## Floating chat button (admin)

- Admin panel always renders `ChatButton` with `isAdmin={true}` and no active auction IDs.
- Note: This means admin can open chat even while in admin panel.

## Manual regression checklist

- Back button returns to main auction page
- Theme toggle works inside admin panel
- Blocked words:
  - Add/remove updates `localStorage['blockedWords']`
  - Open auction chat and verify filtering responds to updated list
- Export:
  - Select 1–2 days; export downloads a CSV
  - Export with no selection shows alert
- Mint:
  - Missing required fields blocks
  - Past date blocks
  - Conflict detection triggers for overlapping slots
  - Confirm mint resets form
