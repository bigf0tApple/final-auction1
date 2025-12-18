# AUCTION CHAT (COMPONENT) FLOW MAP

Scope:
- Chat UI + local message simulation + quick bid controls: `components/auction-chat.tsx` (`AuctionChat`)

Related docs (system/feature-level):
- Quick bid end-to-end: `AUCTION_CHAT_QUICK_BID_FLOW_MAP.md`
- Chat entrypoint + pinning: `CHAT_BUTTON_AND_PINNING_FLOW_MAP.md`
- Chat history lifecycle: `CHAT_HISTORY_LIFECYCLE_FLOW_MAP.md`
- Blocked words management: `CONTENT_MODERATION_BLOCKED_WORDS_FLOW_MAP.md`, `ADMIN_BLOCKED_WORDS_MANAGEMENT_FLOW_MAP.md`
- Display name gating: `DISPLAY_NAME_AND_IDENTITY_FLOW_MAP.md`
- DOM pinning observer: `USE_CHAT_PINNED_HOOK_FLOW_MAP.md`

---

## Purpose

- Provide a floating chat panel (or pinned side panel / mobile fullscreen).
- Simulate chat messaging locally (no backend persistence).
- Provide “Quick Bid” actions wired to auction state (`useAuction`).
- Enforce basic content filtering and rate limiting client-side.

---

## Public API

Component: default export `AuctionChat(props)`

Props:
- `displayName: string`
- `connectedWallet: string`
- `onClose: () => void`
- `isDark: boolean`
- `isAdmin: boolean`
- `activeAuctionId: number | null`
- `lastEndedAuctionId: number | null`
- `isFinalTenSeconds: boolean`
- `onRequestDisplayNameChange?: () => void`

Auction integration:
- Reads `auctionState` and calls `placeBid`, `getMinBid`, `getMaxBid` from `useAuction()`.

---

## Internal state

Messages:
- `messages: Message[]`
- `messagesByAuction: useRef<Record<string, Message[]>>({})`
- `previousAuctionId: useRef<number | null>(null)`

Input/UI:
- `inputMessage: string`
- `showRules: boolean`
- `showQuickBid: boolean`
- `showPinDropdown: boolean`

Rate limiting / restrictions:
- `messageCount: number`
- `lastMessageTime: number`
- `isRestricted: boolean`
- `restrictionTime: number`

Pinning / layout:
- `isPinned: boolean`
- `pinnedSide: "left" | "right"` (default `"right"`)
- `isMobile: boolean`
- `isFullScreen: boolean`

Moderation:
- `userWarnings: Record<string, number>` (keyed by wallet)
- `blockedWords: string[]` (defaults include profanity + scam terms)

Badge:
- `userBidCount` is a hard-coded mock value.
- `getUserBadge(bidCount)` maps thresholds → badge + style.

---

## Layout modes

Computed classes:
- `chatClasses`:
  - Mobile fullscreen: `fixed inset-0 z-50`
  - Pinned: `fixed top-16 ${pinnedSide}-0 bottom-0 z-50 w-80`
  - Floating: `fixed bottom-4 right-4 z-50 w-80`

- `chatHeight`:
  - Fullscreen mobile: `h-full`
  - Pinned: `h-[calc(100vh-64px-128px-8px)]`
  - Floating: `h-[372px]`

Banner:
- Always renders a `chat-banner` “Ad Space” block above the chat card.

---

## Mobile detection

Effect:
- On mount + `resize`:
  - `isMobile = window.innerWidth < 768`
  - If mobile, sets `isFullScreen = true`

Side effect:
- Adds/removes a window resize listener.

---

## Pinning DOM side effects

Effect dependencies: `[isPinned, pinnedSide]`

Behavior:
- If pinned → adds `document.body.classList.add('chat-pinned-left' | 'chat-pinned-right')`
- Else → removes both pin classes
- Cleanup removes both pin classes

Implication:
- Other components observe these body classes (via `useChatPinned()` in `hooks/use-chat-pinned.ts`).

---

## Sending messages

Input constraints:
- Max length 42 (`Input maxLength=42`).

Enter-to-send:
- `handleKeyPress` sends on Enter (without Shift).

`handleSendMessage()` flow:
1) Guard: empty input or restricted → return.
2) Guard: no `connectedWallet` → appends a System message “Please connect…” and returns.
3) Rate limit via `checkRateLimit()`:
   - If too fast and count threshold reached → sets restriction and appends System message.
4) Content filter via `filterMessage(message)`:
   - Blocks if contains a substring match of any `blockedWords`.
   - Blocks if length > 42 (redundant with input maxLength) or contains `http`.
5) On blocked:
   - Increments `userWarnings[connectedWallet]`.
   - Appends “Warning” message.
   - At warning >= 3 → sets restriction 20s and appends System restriction message.
6) On allowed:
   - Appends a user message with `userBadgeInfo`.
   - Clears `inputMessage`.

Auto-scroll:
- On `messages` change, calls `scrollIntoView` on `messagesEndRef`.

---

## Restriction countdown

Effect dependencies: `[restrictionTime, isRestricted]`

- When `restrictionTime > 0`: schedules a 1s timeout decrement.
- When `isRestricted` and `restrictionTime === 0`: clears restriction.

---

## Blocked words hydration

Effect dependencies: `[]`

- Reads `localStorage.getItem('blockedWords')`.
- If present, parses JSON and sets `blockedWords`.
- Parse errors are caught (warns in non-production).

---

## Per-auction message reset/retention

Effect dependencies: `[activeAuctionId, isAdmin, messages]`

- Before switching:
  - If `previousAuctionId.current` exists and there are messages, stores them in `messagesByAuction[currentId]`.

- If `activeAuctionId` is null:
  - Clears `previousAuctionId.current`.
  - If not admin, clears `messages`.

- If `activeAuctionId` is set:
  - Sets `previousAuctionId.current = activeAuctionId`.
  - Admin:
    - Restores messages for that auction if present in `messagesByAuction`.
  - Non-admin:
    - Clears messages.

Additionally:
- Effect `[lastEndedAuctionId, isAdmin]` clears messages for non-admin when `lastEndedAuctionId` changes.

---

## Quick Bid controls

UI:
- Toggles with `showQuickBid`.
- Shows Min (1%) and Max (10%) bid buttons.

Disable conditions:
- Both disabled if `!connectedWallet` or if `auctionState.highestBidder === connectedWallet`.
- Min bid additionally disabled if `isFinalTenSeconds`.

`handleQuickBid(bidType)` flow:
1) Guard: no wallet → append System error “connect wallet to place a bid”.
2) Guard: min bid during final 10s → append System warning and return.
3) Else:
   - Computes `bidAmount` via `getMinBid()` / `getMaxBid()`.
   - Calls `placeBid(bidAmount, connectedWallet)`.
   - Appends System message describing the bid.
4) On error:
   - Appends System error message with exception message (if `Error`).

---

## Rules modal

- Header Help icon toggles `showRules`.
- When true: renders `<ChatRules onClose={() => setShowRules(false)} isDark={isDark} />`.

---

## Audit checklist

- Confirm whether local-only messaging is acceptable (no backend).
- Confirm rate limit thresholds and restriction durations match product rules.
- Confirm blocked-words persistence contract (`localStorage['blockedWords']`) and admin tooling.
- Confirm `http` substring filter is sufficient (false positives likely).
- Confirm pinning behavior and body class names match the layout CSS contracts.
- Confirm mobile fullscreen behavior (forces fullscreen when width < 768).
- Confirm the per-auction message reset policy (non-admin clears on auction switch/end; admin retains per-auction history in-memory only).
