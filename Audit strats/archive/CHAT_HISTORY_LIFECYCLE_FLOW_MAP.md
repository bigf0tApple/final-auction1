# Chat history + lifecycle flow map

This map documents how chat messages are stored, reset, and (for admins) retained across auctions.

Scope:

- Chat entrypoint (`ChatButton`) and prerequisites (wallet + display name)
- Chat runtime (`AuctionChat`) message state + per-auction memory
- Auction transition + end-of-auction reset triggers
- Pinning side effects (body classes + `useChatPinned` consumers)
- Admin Panel “Chat History” UI (currently mock/unwired)

## Entrypoint: Floating chat button

Location: `components/chat-button.tsx`

- Floating button renders at bottom-right.
- Click → `handleChatClick()`:
  - If `!connectedWallet` → `alert("Please connect your wallet to access chat")` and returns.
  - Else if no `displayName` → opens `DisplayNameModal`.
  - Else opens `AuctionChat`.

Display name state:

- Loaded on wallet change:
  - `localStorage.getItem(displayName_${connectedWallet})`
  - `localStorage.getItem(displayNameLockedUntil_${connectedWallet})`
- Saving display name:
  - Writes `displayName_${connectedWallet}`
  - Writes `displayNameLockedUntil_${connectedWallet}` to now + 24h

## Chat runtime: `AuctionChat`

Location: `components/auction-chat.tsx`

Inputs:

- `isAdmin`: toggles history behavior
- `activeAuctionId`: identifies current auction for per-auction history
- `lastEndedAuctionId`: external signal to clear user chat on auction end
- `isFinalTenSeconds`: used to block 1% quick bids and show a system warning

Message storage model:

- `messages` (state): the list currently shown in the UI.
- `messagesByAuction` (ref): in-memory map `{ [auctionId: string]: Message[] }`.
- `previousAuctionId` (ref): tracks the last active auction id seen.

Important nuance:

- `messagesByAuction` is **not persisted** (no localStorage / backend); it only survives while the component stays mounted.

### Sending messages

Function: `handleSendMessage()`

- Requires `connectedWallet` (otherwise appends a System message).
- Applies rate limiting:
  - If rapid sends cause `messageCount >= 4` within 1s windows → sets restriction for 10s.
- Applies content filtering:
  - Loads blocked words from `localStorage["blockedWords"]` on mount (overrides defaults).
  - Substring match blocks; also blocks `http`; max length 42.
  - On violation:
    - Appends a Warning message.
    - Warnings tracked per wallet in `userWarnings` state.
    - 2nd warning → restrict 10s; 3rd warning → restrict 20s with System notice.

### Quick bid messages (chat)

Function: `handleQuickBid(bidType)`

- Requires `connectedWallet`.
- Blocks 1% bids in final 10 seconds:
  - If `bidType === "min" && isFinalTenSeconds` → appends System warning and returns.
- Otherwise calls `placeBid(getMinBid/getMaxBid, connectedWallet)` and appends a System message describing the bid.

## Auction transitions: per-auction reset vs admin history

Primary effect: “Reset chat per auction for users while keeping admin history”

Location: `components/auction-chat.tsx`

Trigger: `useEffect([...])` watching `activeAuctionId`, `isAdmin`, `messages`.

Behavior:

1) On auction change, snapshot previous auction messages
- If `previousAuctionId.current && messages.length > 0`:
  - `messagesByAuction.current[previousAuctionId] = messages`

2) If there is no active auction (`activeAuctionId` is null)
- `previousAuctionId.current = null`
- If `!isAdmin` → `setMessages([])`

3) If there is an active auction
- `previousAuctionId.current = activeAuctionId`
- If `isAdmin` and a stored history exists for that auction:
  - `setMessages(messagesByAuction.current[activeAuctionId])`
- Else if `!isAdmin`:
  - `setMessages([])`

Observed outcome:

- Non-admin users see a fresh chat per auction.
- Admins can “page” between auctions (as `activeAuctionId` changes) and see the in-session history for each auction id.

## Auction end signal: `lastEndedAuctionId`

Source: `app/page.tsx`

- When the schedule-driven countdown hits 0 for the active auction:
  - `setLastEndedAuctionId(schedule.activeAuction.id)`

Consumer: `components/auction-chat.tsx`

- `useEffect([lastEndedAuctionId, isAdmin])`:
  - If `lastEndedAuctionId && !isAdmin` → `setMessages([])`

Observed outcome:

- Non-admin chat clears immediately at auction end.
- Admin chat is not cleared by end-of-auction.

## Pinning + layout side effects

Pin action:

- In `AuctionChat`, pin/unpin sets `document.body.classList`:
  - `chat-pinned-left` / `chat-pinned-right`

Observers:

- `hooks/use-chat-pinned.ts` watches `document.body.classList` via `MutationObserver` and exposes:
  - `isChatPinnedLeft`, `isChatPinnedRight`

Consumers:

- `app/page.tsx` uses the hook to add a `content-with-chat-*` shift class.
- `components/auction-calendar.tsx` also reads the hook (layout adjustments).

## Admin Panel “Chat History” UI (mock)

Location: `app/admin-panel.tsx`

- Contains a “Chat History” dataset (`chatHistory`) and selection UI.
- `ChatDayModal` shown when `selectedChatDay` is set.

Important nuance:

- This chat history UI is currently **mock data** and does not consume `AuctionChat` state or `messagesByAuction`.
- `app/admin-panel.tsx` also renders a `ChatButton` configured as admin (`isAdmin={true}`) but with `activeAuctionId={null}` and `lastEndedAuctionId={null}`.

## Audit checklist

- Verify admin history expectations:
  - Current admin retention is in-memory only; page reload clears.
- Verify end-of-auction clearing for users:
  - Confirm `lastEndedAuctionId` is reliably set exactly once per auction end.
- Verify auction change behavior:
  - Non-admin always resets on `activeAuctionId` change; admin only restores if a stored history exists.
- Verify pinning:
  - Body classes are removed on cleanup to avoid “stuck pinned” layouts.
- Verify admin panel “chat history” scope:
  - If real audit/export is required, current UI is not wired to actual chat messages.
