# Storage keys — map

This document inventories every persistent client-side storage key currently used in the codebase.

## Scope

- `localStorage`
- `sessionStorage` (none found)
- `document.cookie`

## Sources (files)

- `app/page.tsx`
- `components/chat-button.tsx`
- `components/auction-chat.tsx`
- `components/reminder-modal.tsx`
- `app/admin-panel.tsx`
- `components/ui/sidebar.tsx`
- `clear_storage.js`

---

## localStorage keys

### `isDark`

- **Type**: JSON boolean (`"true"` / `"false"`)
- **Writers**:
  - `app/page.tsx` → `toggleTheme()` → `localStorage.setItem('isDark', JSON.stringify(newIsDark))`
- **Readers**:
  - `app/page.tsx` → mount effect → `localStorage.getItem('isDark')` → `JSON.parse` → `setIsDark(...)`
- **Semantics**: persists the user’s theme preference.
- **TTL**: none (persists until cleared).
- **Risk notes**:
  - JSON parse is guarded by `try/catch`.

### `connectedWallet` (orphan/legacy)

- **Type**: unknown (not written anywhere in repo)
- **Writers**: none found
- **Readers**: none found
- **Deleters**:
  - `app/page.tsx` → `disconnectWallet()` → `localStorage.removeItem('connectedWallet')`
- **Semantics**: appears to be a legacy “auto reconnect” key; current code explicitly avoids storing wallet connections.
- **TTL**: n/a
- **Risk notes**:
  - If older builds wrote this key, the current build will clear it on disconnect.

### `blockedWords`

- **Type**: JSON string array (e.g. `["spam", "scam", ...]`)
- **Writers**:
  - `app/admin-panel.tsx` → add/remove blocked word → `localStorage.setItem('blockedWords', JSON.stringify(updatedWords))`
- **Readers**:
  - `app/admin-panel.tsx` → mount effect → `localStorage.getItem('blockedWords')` → `JSON.parse` → sets admin state; falls back to default list on error/missing
  - `components/auction-chat.tsx` → mount effect → `localStorage.getItem('blockedWords')` → `JSON.parse` → sets chat filter list
- **Semantics**: moderation dictionary used to warn/restrict chat messages.
- **TTL**: none.
- **Risk notes**:
  - Readers wrap JSON parse in `try/catch`.
  - Shared global key (not wallet-scoped). Admin changes affect all users on that browser profile.

### `displayName_${WALLET}`

- **Type**: string
- **Key format**:
  - Example: `displayName_0x1234...`
- **Writers**:
  - `components/chat-button.tsx` → `handleDisplayNameSave(name)` → `localStorage.setItem(`displayName_${connectedWallet}`, name)`
- **Readers**:
  - `components/chat-button.tsx` → wallet-change effect → `localStorage.getItem(`displayName_${connectedWallet}`)`
- **Semantics**: per-wallet chat display name on this device/browser.
- **TTL**: none.
- **Risk notes**:
  - Wallet-scoped, but not namespaced by environment (dev/prod) or chain.

### `displayNameLockedUntil_${WALLET}`

- **Type**: stringified epoch milliseconds
- **Key format**:
  - Example: `displayNameLockedUntil_0x1234...`
- **Writers**:
  - `components/chat-button.tsx` → `handleDisplayNameSave(name)` → sets to `Date.now() + 24h`
- **Readers**:
  - `components/chat-button.tsx` → wallet-change effect → `Number(localStorage.getItem(...) || "0")`
- **Semantics**: enforces a 24h cooldown on changing the display name.
- **TTL**: none (logic interprets it as a timestamp).
- **Risk notes**:
  - Stored as a string; reader guards with `Number.isFinite` fallback.

### `auctionReminders`

- **Type**: JSON array of objects
- **Writers**:
  - `components/reminder-modal.tsx` → `setReminder()`:
    - reads existing: `JSON.parse(localStorage.getItem('auctionReminders') || '[]')`
    - pushes new reminder
    - writes back: `localStorage.setItem('auctionReminders', JSON.stringify(reminders))`
- **Readers**:
  - `components/reminder-modal.tsx` reads the array only to append (no UI for viewing reminders found).
- **Semantics**: persistence record of reminders that were set.
- **TTL**: none.
- **Risk notes**:
  - Reminders schedule notifications via `setTimeout`; those scheduled timeouts do not survive page refresh.
  - Array can grow without bounds (no pruning UI found).

### Global clear helper

- `clear_storage.js`:
  - Runs: `localStorage.clear(); window.location.reload();`
  - Semantics: developer utility to wipe all local storage keys.

---

## sessionStorage

- **No usages found** via repo search.

---

## Cookies

### `sidebar:state`

- **Type**: string (`"true"` / `"false"` as interpolated boolean)
- **Writer**:
  - `components/ui/sidebar.tsx` (`SidebarProvider`) sets:
    - `document.cookie = `sidebar:state=${openState}; path=/; max-age=${60*60*24*7}`
- **Readers**:
  - None found in this repo search.
- **Semantics**:
  - Persists sidebar open/collapsed state across reloads for the shadcn sidebar component.
- **TTL**:
  - 7 days (`max-age`).
- **Risk notes**:
  - Cookie is set client-side; if a server-side reader exists, it may be outside this codebase.
