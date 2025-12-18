# Admin Panel Shell — Flow map

Scope: `app/admin-panel.tsx` as the *container/shell* for Admin tooling (tabs + shared state + cross-tab modals).

This map intentionally does **not** duplicate deep-dive flows that already have their own maps:
- Analytics detailed chart modal: `ADMIN_ANALYTICS_CHART_MODAL_FLOW_MAP.md`
- Mint flow: `ADMIN_MINT_AUCTION_FLOW_MAP.md`
- Blocked words management: `ADMIN_BLOCKED_WORDS_MANAGEMENT_FLOW_MAP.md`
- User management: `ADMIN_USER_MANAGEMENT_FLOW_MAP.md`

## Purpose
- Provide an admin-only full-page panel with 4 tabs:
  - Analytics
  - User Management
  - Chat Management
  - Mint NFT
- Host shared UI state (search/timeframe/modals) and a floating admin chat button.

## Entry / Exit
- Entry: rendered by a parent (typically `app/page.tsx`) when the Admin Panel surface is opened.
- Exit: header **Back to Auction** button → `onClose()`.

## Inputs / Props
- `onClose(): void`
- `isDark: boolean`
- `toggleTheme(): void` (header button)
- `connectedWallet?: string` (forwarded into `ChatButton`)

Admin gating note:
- `AdminPanel` itself does not enforce admin access; parent controls whether it is mounted.

## Internal State (React)
Cross-tab:
- `activeTab: "analytics" | "users" | "chat" | "mint"` (default: `"analytics"`)
- `searchTerm: string` (used for filtering `mockUsers`)
- `selectedTimeFrame: string` (analytics card timeframe selector)
- `showDetailedChart: string | null` (opens/closes the detailed Chart modal)

Chat management:
- `newBlockedWord: string`
- `blockedWords: string[]` (initialized from `localStorage["blockedWords"]`)
- `selectedHistoryDays: string[]` (checkbox-selected days)
- `selectedChatDay: { date: string; dayName: string } | null` (opens ChatDayModal)

Mint:
- `mintForm: { ... }` including:
  - `durationMode: "quick" | "custom"`
  - `uploadedImage: File | null`
  - `teaserImage: File | null`
- `showMintConfirmation: boolean`

## Storage / Side Effects
### Blocked words
- Reads once on mount:
  - `localStorage.getItem("blockedWords")` → `blockedWords`
  - Fallback default list when missing or parse fails
- Writes on add/remove:
  - `localStorage.setItem("blockedWords", JSON.stringify(updatedWords))`

See: `ADMIN_BLOCKED_WORDS_MANAGEMENT_FLOW_MAP.md`.

### DOM style injection
- A `useEffect([isDark])` injects a `<style>` tag into `document.head` to customize date/time input focus + picker indicator styling.
- Cleanup removes the style tag on unmount or theme change.

## Top-level Shell Layout
- Full-page container: `min-h-screen ...` with theme classes based on `isDark`.
- Header:
  - **Back to Auction** → `onClose()`
  - Theme toggle icon button → `toggleTheme()`
- Tab row:
  - Analytics → `setActiveTab("analytics")`
  - User Management → `setActiveTab("users")`
  - Chat Management → `setActiveTab("chat")`
  - Mint NFT → `setActiveTab("mint")`

## Cross-tab Modals (rendered at bottom of the shell)
### A) Analytics “Chart Modal”
- Open: `openDetailedChart(chartType)` → `setShowDetailedChart(chartType)`.
- Render: `{showDetailedChart && <ChartModal ... />}`
- Close: modal **X** → `setShowDetailedChart(null)`.

Modal-local state:
- `modalTimeFrame: "7d" | ...` controlled by buttons.

Chart selection:
- Renders one of the demo charts based on `chartType`.

See: `ADMIN_ANALYTICS_CHART_MODAL_FLOW_MAP.md`.

### B) Mint confirmation modal
- Render: `{showMintConfirmation && <MintConfirmationModal />}`
- Close paths:
  - Cancel → `setShowMintConfirmation(false)`
  - Confirm → `confirmMint()` (alerts success and resets form state)

See: `ADMIN_MINT_AUCTION_FLOW_MAP.md`.

### C) Chat day modal (AdminPanel-local)
- Open: `viewDayHistory(date, dayName)` → `setSelectedChatDay({ date, dayName })`
- Render: `{selectedChatDay && <ChatDayModal ... />}`
- Close: modal **X** → `setSelectedChatDay(null)`

Important nuance:
- This `ChatDayModal` is defined inline in `app/admin-panel.tsx` and displays mock chat rows; it is separate from `components/chat-day-modal.tsx`.

## Tab-specific Shell Notes (non-deep-dive)
### 1) Analytics tab
- Uses `selectedTimeFrame` for high-level cards.
- “View details” affordances open the Chart modal via `openDetailedChart(...)`.

### 2) User Management tab
- `searchTerm` filters `mockUsers` by address substring.
- `toggleUserStatus(address)` is currently a stub (no persistence / no UI feedback by itself).

See: `ADMIN_USER_MANAGEMENT_FLOW_MAP.md`.

### 3) Chat Management tab
Primary shell actions:
- Select/unselect days via checkboxes → `toggleHistorySelection(date)`.
- Export selected days → `exportSelectedHistory()`
  - Guards: blocks when `selectedHistoryDays.length === 0`
  - Generates a CSV string (sample rows) and triggers a download.
- Delete selected days → `deleteSelectedHistory()`
  - Confirm gate, then clears selection.

Blocked words UI:
- Controlled input → `newBlockedWord`
- **Add Word** → `addBlockedWord()`
- Badge “×” → `removeBlockedWord(word)`

See: `ADMIN_BLOCKED_WORDS_MANAGEMENT_FLOW_MAP.md` and `CHAT_DAY_MODAL_AND_EXPORT_FLOW_MAP.md`.

### 4) Mint NFT tab
- Upload handlers validate file size (10MB) and store `File` objects in state.
- Submit path validates completeness, validates start time is future, checks for overlaps against `upcomingAuctions`, then opens confirmation.

See: `ADMIN_MINT_AUCTION_FLOW_MAP.md`.

## Floating Chat Button (Admin)
- Always rendered within the admin panel shell:
  - `<ChatButton isAdmin={true} ... connectedWallet={connectedWallet || ""} />`
- Passed values:
  - `activeAuctionId={null}`
  - `lastEndedAuctionId={null}`
  - `isFinalTenSeconds={false}`

This means admin chat opens in an “admin context” even if the main page has an active auction.

## Audit checklist
- Confirm admin gating is enforced at the parent level (this shell assumes it is already authorized).
- Verify `localStorage["blockedWords"]` edits propagate to an already-open chat (chat reads on mount; may require remount).
- Verify style-injection cleanup does not leak duplicate `<style>` tags on repeated open/close.
- Validate that the chat export CSV contains expected columns and that download works across browsers.
