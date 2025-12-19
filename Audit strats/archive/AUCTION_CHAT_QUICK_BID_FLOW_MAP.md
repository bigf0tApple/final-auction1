# AUCTION CHAT + QUICK BID FLOW MAP

Scope: `components/chat-button.tsx`, `components/auction-chat.tsx`, `hooks/use-chat-pinned.ts`, and related wiring in `app/page.tsx` + auction state in `hooks/use-auction-state.ts`.

## Purpose
- Provide a floating chat surface gated by wallet + display name.
- Support chat moderation (blocked words + rules) and rate limiting.
- Provide “Quick Bid” actions inside chat that call the shared auction `placeBid()`.
- Enforce “Final 10 seconds: only 10% bids accepted” for chat quick-bids.

## Entry Points

### Floating chat button
File: `components/chat-button.tsx`
- A fixed-position button (bottom-right) opens chat.

Flow:
1) Click chat button → `handleChatClick()`
2) Guards:
   - If `!connectedWallet` → `alert("Please connect your wallet to access chat")` and return.
   - If `!displayName` → open `DisplayNameModal`.
   - Else → open `AuctionChat`.

### Display name modal
File: `components/chat-button.tsx` (renders `components/display-name-modal.tsx`)
- Save → `handleDisplayNameSave(name)`
  - Writes to localStorage:
    - `displayName_${connectedWallet}`
    - `displayNameLockedUntil_${connectedWallet}` (now + 24h)
  - Sets `showChat = true`.
- Change name while in chat
  - `AuctionChat` receives `onRequestDisplayNameChange`.
  - Clicking **Name** calls `handleRequestDisplayNameChange()` → closes chat and re-opens `DisplayNameModal`.

## Key Props and Wiring

### `isFinalTenSeconds` comes from the home page
File: `app/page.tsx`
- `isFinalTenSeconds` is computed from `timeLeft` for the active auction:
  - `inFinalTen = totalSeconds > 0 && totalSeconds <= 10`
- A one-time notification is shown when entering the window:
  - `setNotification({ message: "Only 10% bids are accepted in the final 10 seconds.", type: "error" })`
- It is passed into `ChatButton` → `AuctionChat`.

### Auction identity props
File: `app/page.tsx` → `components/chat-button.tsx` → `components/auction-chat.tsx`
- `activeAuctionId` drives per-auction message partitioning.
- `lastEndedAuctionId` triggers clearing for non-admin users when an auction ends.

## Auction State Dependencies
File: `components/auction-chat.tsx`
- Uses `useAuction()` which is backed by `hooks/use-auction-state.ts`.
- Reads:
  - `auctionState.currentBid`
  - `auctionState.highestBidder`
- Calls:
  - `placeBid(amount, connectedWallet)`
  - `getMinBid()` (1% step)
  - `getMaxBid()` (10% step)

File: `hooks/use-auction-state.ts`
- `placeBid()` updates:
  - `auctionState.userPools` (per-bidder pool)
  - `auctionState.currentBid` / `highestBidder` only if `amount > currentBid`
  - `auctionState.bids` and `bidHistory`
- IMPORTANT: The “final 10 seconds” rule is enforced by callers (UI). `placeBid()` itself does not check that rule.

## Chat State / Side Effects

### Pinning side-effects
File: `components/auction-chat.tsx`
- Local state: `isPinned`, `pinnedSide`.
- When pinned:
  - Adds `document.body.classList.add('chat-pinned-left'|'chat-pinned-right')`.
- When unpinned or unmounted:
  - Removes both `chat-pinned-left` and `chat-pinned-right`.

File: `hooks/use-chat-pinned.ts`
- Observes body class changes with `MutationObserver`.
- Exposes `{ isChatPinnedLeft, isChatPinnedRight }` so other modals can offset layout.

### Admin vs non-admin message lifecycle
File: `components/auction-chat.tsx`
- Uses an in-memory cache for admin:
  - `messagesByAuction.current: Record<string, Message[]>`
- `useEffect([activeAuctionId, isAdmin, messages])`:
  - Stores previous auction’s messages into `messagesByAuction`.
  - If `!activeAuctionId`:
    - `previousAuctionId = null`
    - If `!isAdmin` → `setMessages([])`
  - If switching auctions:
    - If `isAdmin` and cache exists → restore cached messages for that auction.
    - Else if `!isAdmin` → reset messages.
- `useEffect([lastEndedAuctionId, isAdmin])`:
  - If `lastEndedAuctionId && !isAdmin` → `setMessages([])`.

### Blocked words load
File: `components/auction-chat.tsx`
- On mount:
  - Loads `localStorage['blockedWords']` (JSON array) and overwrites the default list.
- Default blocked words include: `spam`, `scam`, `hack`, `private key`, `phishing`, plus some profanity.

## Chat Message Send Flow
File: `components/auction-chat.tsx`

### User action
- Click **Send** OR press Enter (without Shift) → `handleSendMessage()`.

### Guards and outcomes
1) Empty input OR `isRestricted` → no-op.
2) Wallet not connected (`!connectedWallet`)
   - Appends system message: “Please connect your wallet to send messages”.
3) Rate limit
   - `checkRateLimit()` blocks if sending too fast; after enough quick sends sets `isRestricted=true` and `restrictionTime=10`.
   - On block, appends system message: “Rate limit exceeded. Please slow down.”
4) Content filter (`filterMessage(message)`)
   - Rejects if:
     - Contains any blocked word (substring match, case-insensitive)
     - Length > 42
     - Contains `http`
   - On reject:
     - Increments `userWarnings[connectedWallet]`.
     - Appends “Warning” message including Warning `X/3`.
     - Applies restriction:
       - Warning 2 → restrict 10s
       - Warning 3+ → restrict 20s and appends a system restriction message.
   - Clears input.
5) Allowed
   - Appends user message to `messages`.
   - Clears input.

### Restriction countdown
- `restrictionTime` decrements every second.
- When `restrictionTime` hits 0, `isRestricted` is cleared.

## Quick Bid Flow (inside chat)
File: `components/auction-chat.tsx`

### UI
- “Quick Bid” accordion toggled by `showQuickBid`.
- Buttons:
  - **Min Bid (1%)**
    - Disabled when:
      - `!connectedWallet`
      - `auctionState.highestBidder === connectedWallet`
      - `isFinalTenSeconds`
  - **Max Bid (10%)**
    - Disabled when:
      - `!connectedWallet`
      - `auctionState.highestBidder === connectedWallet`

### Handler
- Clicking either button calls `handleQuickBid('min'|'max')`.

Guards:
1) `!connectedWallet`
   - Appends system message: “Please connect your wallet to place a bid”.
2) Final 10 seconds rule (min bid only)
   - If `bidType === 'min' && isFinalTenSeconds`:
     - Appends system message: “Final 10 seconds: only 10% bids are accepted.”
     - Returns (no bid placed).

Action:
- Computes amount:
  - `min` → `getMinBid()`
  - `max` → `getMaxBid()`
- Calls `placeBid(bidAmount, connectedWallet)`.
- Appends a system message announcing the bid.

Errors:
- Catches exceptions and appends a system error message.

## Related Rule Enforcement Outside Chat
File: `app/page.tsx`
- The main bidding buttons enforce the same “final 10 seconds” rule:
  - Blocks `handleBid('min')` when `isFinalTenSeconds && activeAuction`.
  - Disables the 1% button during final 10 seconds.

## Audit Notes / Risk Areas
- Enforcement is currently UI-level (chat + page) and not enforced in `placeBid()` itself.
- Blocked word filtering is substring-based; short words may over-match.
- Chat messages are not persisted; admin “history” is in-memory per tab/session only.
