# CHAT BUTTON (COMPONENT) FLOW MAP

Scope:
- Floating chat entrypoint: `components/chat-button.tsx` (`ChatButton`)

Related docs:
- System/feature view of identity gating: `DISPLAY_NAME_AND_IDENTITY_FLOW_MAP.md`
- Button-level audit: `CHAT_BUTTON_MAP.md`
- Pinning + body class side effects (in chat): `CHAT_BUTTON_AND_PINNING_FLOW_MAP.md`

---

## Purpose

- Provide a floating button to open chat.
- Gate chat access on:
  - wallet connection
  - having a display name set (per-wallet)
- Orchestrate the two overlays:
  - `DisplayNameModal`
  - `AuctionChat`

---

## Public API

Component: default export `ChatButton(props)`

Props:
- `isDark: boolean`
- `connectedWallet: string`
- `isAdmin: boolean`
- `activeAuctionId: number | null`
- `lastEndedAuctionId: number | null`
- `isFinalTenSeconds: boolean`

---

## Internal state

Local UI state:
- `showDisplayNameModal: boolean` (default `false`)
- `showChat: boolean` (default `false`)

Identity state:
- `displayName: string` (default `""`)
- `lockedUntil: number` (default `0`)

---

## Storage (localStorage)

Keys (per connected wallet address string):
- `displayName_${connectedWallet}` → string
- `displayNameLockedUntil_${connectedWallet}` → stringified epoch millis

Load path:
- `useEffect([connectedWallet])`:
  - If `connectedWallet` is truthy:
    - Reads `displayName_${wallet}` and sets `displayName` (or resets to empty if missing)
    - Reads `displayNameLockedUntil_${wallet}` via `Number(...)`, sanitizes to `0` if non-finite

Write path:
- In `handleDisplayNameSave(name)`:
  - Writes `displayName_${wallet} = name`
  - Computes `nextLockedUntil = Date.now() + 24h`
  - Writes `displayNameLockedUntil_${wallet} = String(nextLockedUntil)`

---

## Entry: click the floating button

UI:
- Fixed-position button `bottom-4 right-4` with `MessageCircle` icon.

Handler: `handleChatClick()`

Guards:
1) If `!connectedWallet`:
- `alert("Please connect your wallet to access chat")`
- returns (no modal/chat opens)

2) Else if `!displayName`:
- `setShowDisplayNameModal(true)`

3) Else:
- `setShowChat(true)`

---

## Display name modal orchestration

Render condition:
- `showDisplayNameModal === true`

Component:
- `components/display-name-modal.tsx` (`DisplayNameModal`)

Props passed:
- `connectedWallet`
- `isDark`
- `currentName={displayName || undefined}`
- `lockedUntil={lockedUntil || undefined}`
- `onSave={handleDisplayNameSave}`
- `onCancel={() => setShowDisplayNameModal(false)}`

On save (`handleDisplayNameSave(name)`):
- Sets `displayName = name`
- Closes modal
- Opens chat (`setShowChat(true)`)
- Persists name + lock window to localStorage (see above)

---

## Auction chat orchestration

Render condition:
- `showChat === true`

Component:
- `components/auction-chat.tsx` (`AuctionChat`)

Props passed through:
- `displayName`, `connectedWallet`, `isAdmin`, `activeAuctionId`, `lastEndedAuctionId`, `isFinalTenSeconds`, `isDark`

Callbacks:
- `onClose={() => setShowChat(false)}`
- `onRequestDisplayNameChange={handleRequestDisplayNameChange}`

`handleRequestDisplayNameChange()` behavior:
- `setShowChat(false)`
- `setShowDisplayNameModal(true)`

---

## Side effects

- Reads/writes `localStorage` (display name + lock until).
- Uses blocking `alert(...)` when wallet is not connected.

---

## Audit checklist

- Confirm `alert(...)` is acceptable (vs app-level toast / `BidNotification`).
- Confirm whether display-name lock should be enforced beyond UI disabling in `DisplayNameModal`.
- Confirm behavior when `connectedWallet` becomes empty while chat/modal is open (current guard blocks opening, but state may remain).
- Confirm expected behavior when `activeAuctionId`/`lastEndedAuctionId` are `null` (e.g., Sold pages, admin panel).
