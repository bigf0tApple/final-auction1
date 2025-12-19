# SOLD RECENT PAGE (COMPONENT) FLOW MAP

Scope:
- Recently Sold modal: `components/sold-recent-page.tsx` (`SoldRecentPage`)

Related docs:
- Surface-level entrypoints + both sold pages: `SOLD_PAGES_FLOW_MAP.md`
- Chat floating button + pinning: `CHAT_BUTTON_AND_PINNING_FLOW_MAP.md`
- Chat pinned state consumers: `CHAT_PINNED_STATE_CONSUMERS_FLOW_MAP.md`

---

## Purpose

- Show a modal-style overlay listing recently sold items.
- Provide quick “copy address” and “open Etherscan” actions.
- Provide access to chat via a floating `ChatButton`.

---

## Public API

Component: default export `SoldRecentPage(props)`

Props:
- `onClose: () => void`
- `isDark: boolean`
- `connectedWallet?: string`

---

## Internal state

- `copiedAddress: string | null`
  - Used to swap the copy icon to a checkmark for the row last copied.

---

## Data source

- `recentlySoldNFTs: SoldNFT[]` is an in-component constant array (demo-only).
- No fetches, no shared store usage.

---

## Layout + chat pinning overlap

Outer overlay:
- `fixed inset-0 ... bg-black bg-opacity-50 ... z-50`

Pinned chat handling:
- Uses `useChatPinned()` from `hooks/use-chat-pinned.ts`.
- Conditionally adds one of:
  - `modal-with-chat-left`
  - `modal-with-chat-right`

Implication:
- Modal content is intended to shift/avoid pinned chat when the chat system sets body classes.

---

## User actions

Close:
- Header X button calls `onClose()`.

Copy current holder address:
- `navigator.clipboard.writeText(address)`
- Sets `copiedAddress = address`
- Starts `setTimeout(..., 2000)` to reset `copiedAddress` back to `null`.

Open Etherscan:
- `window.open('https://etherscan.io/address/<address>', '_blank')`

---

## Chat overlay wiring

Renders floating chat button:
- `<ChatButton ... />` at the end of the modal.

Props passed:
- `isDark={isDark}`
- `connectedWallet={connectedWallet || ""}`
- `isAdmin={false}`
- `activeAuctionId={null}`
- `lastEndedAuctionId={null}`
- `isFinalTenSeconds={false}`

ChatButton implications (high level):
- If `connectedWallet` is empty, ChatButton blocks open and shows an `alert(...)`.
- If connected, ChatButton may prompt for a display name via `DisplayNameModal` (localStorage-backed) before opening `AuctionChat`.
- With auction ids `null`, chat is detached from an auction context (depends on `AuctionChat` behavior).

---

## Side effects

- Clipboard write via `navigator.clipboard.writeText`.
- New tab/window via `window.open`.
- Timer via `setTimeout` (2s) for the copied-icon reset.

---

## Audit checklist

- Confirm whether sold data should remain demo-only or be wired to real auction outcomes.
- Confirm that opening chat from sold modal with `activeAuctionId=null` is desired.
- Confirm pinned chat CSS contracts:
  - `chat-pinned-left/right` body class names
  - `modal-with-chat-left/right` overlay class names
- Consider whether the 2s timeout should be cleared on unmount (minor).
