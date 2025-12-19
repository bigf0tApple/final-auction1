# Chat system — button map

Scope (files)

- `components/chat-button.tsx` (floating entry point)
- `components/display-name-modal.tsx` (name selection)
- `components/auction-chat.tsx` (chat UI + quick bid)
- `components/chat-rules.tsx` (rules modal)
- `hooks/use-auction-state.ts` (bid functions used by chat)

## Sources of truth / side effects

- Local UI state (modals): `showChat`, `showDisplayNameModal`
- Chat message state: `messages`, `messagesByAuction` (in-memory only)
- Auction state: `useAuction()` → `auctionState`, `placeBid()`, `getMinBid()`, `getMaxBid()`
- Time gating input: `isFinalTenSeconds` prop (computed by caller)
- Persistence:
  - Display name: `localStorage[displayName_${wallet}]`
  - Display-name lock: `localStorage[displayNameLockedUntil_${wallet}]` (24h)
  - Chat moderation: `localStorage[blockedWords]` (JSON array)
- Global DOM side effect:
  - Chat pinning toggles `document.body.classList` → `chat-pinned-left` / `chat-pinned-right`

## Button / click targets

### A) `components/chat-button.tsx` (floating chat entry)

1) Floating chat bubble button

- UI: bottom-right fixed circle button
- Handler: `handleChatClick()`
- Connects to:
  - If no `connectedWallet`: `alert("Please connect your wallet to access chat")` and returns
  - If wallet connected but no `displayName`: opens Display Name modal → `setShowDisplayNameModal(true)`
  - Else: opens chat → `setShowChat(true)`
- Guardrails:
  - Wallet required

2) DisplayNameModal cancel

- UI: `DisplayNameModal` `onCancel={() => setShowDisplayNameModal(false)}`
- Connects to: closes name modal

3) DisplayNameModal save

- Handler: `handleDisplayNameSave(name)`
- Connects to:
  - `setDisplayName(name)`
  - `setShowDisplayNameModal(false)`
  - `setShowChat(true)`
  - Persists to localStorage:
    - `displayName_${connectedWallet}`
    - `displayNameLockedUntil_${connectedWallet}` = `Date.now() + 24h`

4) AuctionChat close (from ChatButton)

- Passed prop: `onClose={() => setShowChat(false)}`
- Connects to: closes chat (unmounts chat component, which also clears pin classes via effect cleanup)

5) AuctionChat “Name” button (request change)

- Passed prop: `onRequestDisplayNameChange={handleRequestDisplayNameChange}`
- Handler: `handleRequestDisplayNameChange()`
- Connects to:
  - `setShowChat(false)`
  - `setShowDisplayNameModal(true)`

### B) `components/display-name-modal.tsx` (name selection)

1) Close `X`

- Handler: `onCancel` (from parent)

2) Radio options

- Click targets: radio inputs for `prefix` / `suffix` / `ens`
- Connects to: `selectedOption` state and preview calculation

3) ENS dropdown

- Click target: `<select>` for ENS names (only when multiple)
- Connects to: `selectedEnsName`

4) Cancel button

- Handler: `onCancel` (from parent)

5) Save button

- Handler: `handleSave()` → `onSave(displayNamePreview)` (parent writes localStorage)
- Guardrails:
  - `disabled={Boolean(currentName) && isLocked && displayNamePreview !== currentName}`
  - Meaning: when locked (24h), user can only hit Save if they keep the same name (no change)

### C) `components/auction-chat.tsx` (chat UI)

1) Pin icon button (toggles dropdown)

- UI: pin icon button (desktop only)
- Handler: `onClick={() => setShowPinDropdown(!showPinDropdown)}`
- Connects to: local dropdown visibility

2) Pin dropdown actions (native `<button>` items)

- Pin Left:
  - `setPinnedSide('left')`, `setIsPinned(true)`, `setShowPinDropdown(false)`
- Pin Right:
  - `setPinnedSide('right')`, `setIsPinned(true)`, `setShowPinDropdown(false)`
- Unpin:
  - `setIsPinned(false)`, `setShowPinDropdown(false)`

Global effect triggered when `isPinned` or `pinnedSide` changes:

- Adds/removes body classes: `chat-pinned-left` / `chat-pinned-right`
- Cleanup on unmount removes both classes

3) “Name” button (optional)

- Visible only if `onRequestDisplayNameChange` prop provided
- Handler: `onRequestDisplayNameChange()` (wired by `ChatButton`)

4) Rules button

- UI: help icon
- Handler: `onClick={() => setShowRules(true)}`
- Connects to: opens `ChatRules` modal

5) Close chat `X`

- Handler: `onClose()` (wired by `ChatButton`)

6) Quick Bid accordion toggle

- Handler: `onClick={() => setShowQuickBid(!showQuickBid)}`
- Connects to: shows/hides quick bid buttons

7) Quick Bid — Min bid (1%)

- Handler: `onClick={() => handleQuickBid('min')}`
- Disabled when:
  - no wallet (`!connectedWallet`)
  - user is highest bidder (`auctionState.highestBidder === connectedWallet`)
  - final 10 seconds (`isFinalTenSeconds`)
- Additional enforcement in handler:
  - If `bidType === 'min' && isFinalTenSeconds`: posts a System warning message and returns
- Connects to:
  - `getMinBid()` from auction context
  - `placeBid(bidAmount, connectedWallet)`
  - Adds a System message describing the bid

8) Quick Bid — Max bid (10%)

- Handler: `onClick={() => handleQuickBid('max')}`
- Disabled when:
  - no wallet
  - user is highest bidder
- Connects to:
  - `getMaxBid()`
  - `placeBid(...)`
  - Adds a System message describing the bid

9) Message send button

- Handler: `handleSendMessage()`
- Disabled when:
  - empty message (`!inputMessage.trim()`)
  - restricted (`isRestricted`)
- Connects to:
  - wallet check (if missing wallet: adds System error message)
  - rate limit check (may add System message)
  - content filter check (may add Warning/System messages + restrictions)
  - appends user message to `messages`

10) Enter-to-send

- Key handler: `handleKeyPress` on `Input`
- Connects to: calls `handleSendMessage()` on Enter (no Shift)

### D) `components/chat-rules.tsx` (rules modal)

1) Close `X`

- Handler: `onClose()` (from `AuctionChat` sets `showRules(false)`)

## Auction context connections used by chat

- `getMinBid()` = `currentBid * 1.01` (rounded)
- `getMaxBid()` = `currentBid * 1.10` (rounded)
- `placeBid(amount, bidder)`:
  - Always appends bid to `auctionState.bids` and `bidHistory`
  - Updates per-user pool totals (`userPools` Map)
  - Updates `currentBid`/`highestBidder` only when `amount > currentBid`
  - May trigger Max Pain auto-bid (if configured)

## Manual test steps (high value)

- No wallet:
  - Click floating chat button → alert appears
  - In chat (if forced open), sending message or quick-bid → System message prompts to connect wallet
- Display name flow:
  - With wallet and no name → name modal opens
  - Save sets localStorage keys and opens chat
  - Within 24h lock, attempt to change name → Save should be disabled (unless unchanged)
- Chat rules:
  - Click help icon → rules modal opens; close returns to chat
- Pinning:
  - Pin left/right/unpin toggles body classes and layout shifts appropriately
  - Closing chat removes pinned classes
- Quick bid final-10s:
  - Min bid button disabled when `isFinalTenSeconds`
  - Clicking min bid (if enabled via devtools) still posts warning and does not bid
  - Max bid still works in final-10s
- Rate limit & moderation:
  - Send many messages rapidly → restriction activates; input disabled
  - Blocked words and links trigger warnings

## Notes / risks spotted during mapping

- `blockedWords` list contains profanity; verify this matches your policy.
- Icon-only buttons generally lack explicit `aria-label` (a11y).
- Pin dropdown doesn’t close on outside click (UX only; not a correctness issue).
