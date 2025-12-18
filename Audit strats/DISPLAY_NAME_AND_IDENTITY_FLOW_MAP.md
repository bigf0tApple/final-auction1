# DISPLAY NAME + IDENTITY FLOW MAP

Scope:
- Floating chat entrypoint and identity gating: `components/chat-button.tsx`
- Display name selection modal: `components/display-name-modal.tsx`
- Chat header “Name” action (re-open selector): `components/auction-chat.tsx`
- Storage keys: `localStorage` (`displayName_*`, `displayNameLockedUntil_*`)

Out of scope:
- Wallet connect itself (see `WALLET_CONNECT_AND_IDENTITY_FLOW_MAP.md`).

## Mental model

- Chat is gated by **wallet connection** and **having a display name**.
- Display name is stored per-wallet in `localStorage` and is intended to be **locked for 24 hours** after setting.
- The display name modal can propose:
  - address prefix (`0x1234…`)
  - address suffix (`…abcd`)
  - ENS name (if discovered)

## Storage (source of truth)
File: `components/chat-button.tsx`

Keys (per wallet address):
- `displayName_${wallet}` → string
- `displayNameLockedUntil_${wallet}` → stringified epoch millis

Read path:
- On `connectedWallet` change:
  - reads both keys
  - `lockedUntil` is parsed via `Number(...)` and sanitized to `0` if non-finite.

Write path:
- On successful Save:
  - writes `displayName_${wallet}`
  - sets `lockedUntil = Date.now() + 24h`
  - writes `displayNameLockedUntil_${wallet}`

## Entry points

### A) Open chat (floating button)
File: `components/chat-button.tsx`

UI:
- Floating button bottom-right (MessageCircle icon)

Handler: `handleChatClick()`

Guards:
1) If `!connectedWallet`:
- Calls `alert("Please connect your wallet to access chat")`
- Returns (chat does not open)

2) If no `displayName` in state:
- Opens display name modal: `setShowDisplayNameModal(true)`

3) Else:
- Opens chat: `setShowChat(true)`

Outcome:
- Either `DisplayNameModal` renders, or `AuctionChat` renders.

### B) Change display name from inside chat
File: `components/auction-chat.tsx`

UI:
- Header “Name” button (only if `onRequestDisplayNameChange` provided)

Handler:
- `onClick={onRequestDisplayNameChange}`

Wiring:
- In `ChatButton`, `handleRequestDisplayNameChange()`:
  - `setShowChat(false)`
  - `setShowDisplayNameModal(true)`

Outcome:
- Chat closes and the display name modal opens.

## Display name modal
File: `components/display-name-modal.tsx`

Props:
- `connectedWallet`, `isDark`
- `currentName?: string`
- `lockedUntil?: number`
- `onSave(name)` / `onCancel()`

### Lock calculation
- `isLocked = lockedUntil ? Date.now() < lockedUntil : false`

### ENS discovery
Runs on `connectedWallet` change:
1) Reverse lookup via injected provider:
- `window.ethereum` → `ethers.providers.Web3Provider` → `provider.lookupAddress(connectedWallet)`

2) Subgraph query:
- POST `https://api.thegraph.com/subgraphs/name/ensdomains/ens`
- Query domains by `owner` (wallet lowercased)
- Filters to `*.eth`

Result:
- `ensNames: string[]` (deduped)
- `ensLoading` toggled
- If multiple ENS names, renders a `<select>` to choose one.

### Display name preview
Based on selected option:
- `prefix` → `${wallet.slice(0,6)}...`
- `suffix` → `...${wallet.slice(-4)}`
- `ens` → `selectedEnsName` (fallbacks to prefix if empty)

### Save button behavior (lock enforcement)
- `onClick` calls `onSave(displayNamePreview)`.
- Disabled condition:
  - `disabled={Boolean(currentName) && isLocked && displayNamePreview !== currentName}`

Implications:
- If locked and the user selects a *different* preview than `currentName`, Save is disabled.
- If locked but the preview equals `currentName`, Save remains enabled.

## ChatButton save flow
File: `components/chat-button.tsx`

`handleDisplayNameSave(name)`:
- sets state:
  - `displayName = name`
  - closes modal
  - opens chat
- persists:
  - `localStorage.setItem(displayName_${wallet}, name)`
  - computes `nextLockedUntil = Date.now() + 24h`
  - stores `displayNameLockedUntil_${wallet}`

## Notable gaps / audit risks

- **Lock is UI-only**:
  - The lock is enforced by the modal’s Save button disabling.
  - Nothing prevents a caller from bypassing it by calling `handleDisplayNameSave(...)` directly.

- **`alert()` UX**:
  - When wallet is not connected, chat access uses `alert(...)` rather than the app’s `BidNotification` or Sonner.

- **`enhanced-display-name-modal.tsx` is empty**:
  - File exists but has no implementation and is not referenced.
  - Treat as dead/placeholder until wired.

- **No clearing on disconnect**:
  - `ChatButton` only loads names when `connectedWallet` is truthy; it does not clear `displayName` when wallet becomes empty.
  - Guard order prevents chat from opening without a wallet, but the stale name can remain in component state.

- **Network dependency for ENS**:
  - ENS discovery depends on:
    - injected EVM provider (`window.ethereum`) for reverse lookup
    - The Graph endpoint availability

## Manual test checklist

- With no wallet connected:
  - Click chat button → alert appears; chat does not open.

- With wallet connected and no stored name:
  - Click chat button → display name modal opens.
  - Select prefix/suffix/ENS → Save → chat opens.

- Lock behavior:
  - Immediately reopen modal via chat header “Name”:
    - Attempt to select a different option → Save should be disabled.

- Per-wallet isolation:
  - Connect a different wallet → modal should appear again (separate `displayName_*` key).
