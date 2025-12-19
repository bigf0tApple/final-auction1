# Chat button + pin/unpin + layout shift — flow map

Scope (files)

- `components/chat-button.tsx`
- `components/auction-chat.tsx`
- `hooks/use-chat-pinned.ts`
- `app/page.tsx` (main content shift wrapper; mounts `ChatButton`)
- `app/admin-panel.tsx` (also mounts `ChatButton` in admin context)
- `app/globals.css` (shift/offset CSS: `content-with-chat-*`, `modal-with-chat-*`)
- Consumers of pinned state:
  - `components/auction-calendar.tsx`
  - `components/sold-recent-page.tsx`
  - `components/team-page.tsx`
  - `components/contact-page.tsx`
  - `components/why-page.tsx` (reads body classes directly)

Purpose

- Provide a floating entry point (`ChatButton`) that conditionally opens `AuctionChat`.
- Allow desktop users to pin chat left/right, shifting main content and certain modals to avoid overlap.
- Ensure pinning state is a global DOM side effect (body classes) that other components can observe.

Sources of truth / side effects

- Chat open/close (local UI state): `ChatButton` → `showChat`.
- Pin state (local UI state inside chat): `AuctionChat` → `isPinned`, `pinnedSide`.
- Global side effect: `document.body.classList` contains zero/one of:
  - `chat-pinned-left`
  - `chat-pinned-right`
- Observability: `useChatPinned()` exposes `{ isChatPinnedLeft, isChatPinnedRight }` by watching `document.body` class mutations.
- Layout shifts (CSS):
  - `app/globals.css` defines `content-with-chat-left/right` and `modal-with-chat-left/right` as `margin-left/right: 320px`.

---

## 1) Entrypoint: Floating chat button

File: `components/chat-button.tsx`

1) User clicks floating chat button
- Handler: `handleChatClick()`.
- Guards:
  - If `!connectedWallet`: `alert("Please connect your wallet to access chat")` and returns.
  - If wallet connected but `displayName` empty: opens display-name modal (`showDisplayNameModal = true`).
  - Else: opens chat (`showChat = true`).

2) Display name persistence
- On wallet change:
  - Loads `localStorage[displayName_${connectedWallet}]` into state.
  - Loads `localStorage[displayNameLockedUntil_${connectedWallet}]` into `lockedUntil`.
- On save (`handleDisplayNameSave(name)`):
  - Writes both keys and opens chat.

3) Close chat
- `AuctionChat` gets `onClose={() => setShowChat(false)}`.
- Closing chat unmounts `AuctionChat`, which triggers pinning cleanup (see below).

Mount points

- Home page mounts chat:
  - `app/page.tsx` renders `<ChatButton ... activeAuctionId={activeAuction?.id ?? null} lastEndedAuctionId={lastEndedAuctionId} isFinalTenSeconds={isFinalTenSeconds} />`.
- Admin panel mounts chat too:
  - `app/admin-panel.tsx` renders `<ChatButton ... isAdmin={true} activeAuctionId={null} lastEndedAuctionId={null} isFinalTenSeconds={false} />`.

---

## 2) Pin/unpin mechanics (desktop only)

File: `components/auction-chat.tsx`

### A) Pin dropdown UI
- Visible only when `!isMobile`.
- Pin icon toggles dropdown: `setShowPinDropdown(!showPinDropdown)`.

Dropdown actions:
- **Pin Left**:
  - `setPinnedSide('left')`
  - `setIsPinned(true)`
  - `setShowPinDropdown(false)`
- **Pin Right**:
  - `setPinnedSide('right')`
  - `setIsPinned(true)`
  - `setShowPinDropdown(false)`
- **Unpin**:
  - `setIsPinned(false)`
  - `setShowPinDropdown(false)`

### B) Body-class side effect
Effect: `useEffect([isPinned, pinnedSide])`

- When pinned:
  - Adds `document.body.classList.add(
      `chat-pinned-${pinnedSide}`
    )`.
- When unpinned:
  - Removes both classes: `chat-pinned-left`, `chat-pinned-right`.
- Cleanup on unmount always removes both classes.

Important outcome:
- Closing chat (unmount) guarantees “no stuck pin” on the body.

### C) Chat placement & sizing
Derived classes:
- Mobile fullscreen: `fixed inset-0 z-50`.
- Desktop pinned: `fixed top-16 ${pinnedSide}-0 bottom-0 z-50 w-80`.
- Desktop unpinned: `fixed bottom-4 right-4 z-50 w-80`.

Notes:
- `w-80` aligns with the CSS shift value of `320px`.
- Height differs by mode:
  - Fullscreen mobile: `h-full`.
  - Pinned desktop: `h-[calc(100vh-64px-128px-8px)]` (accounts for header + ad banner + gap).
  - Unpinned desktop: `h-[372px]`.

---

## 3) How other UI shifts away from pinned chat

### A) Main page content shift (home page)
File: `app/page.tsx`

- `useChatPinned()` is called in the home page.
- `contentShiftClass` is computed:
  - left pinned → `content-with-chat-left`
  - right pinned → `content-with-chat-right`
  - else → empty string
- The main content is wrapped:
  - `<div className={contentShiftClass}> ... </div>`

Definition
- `app/globals.css`:
  - `.content-with-chat-left { margin-left: 320px; }`
  - `.content-with-chat-right { margin-right: 320px; }`

### B) Modal / overlay offsets (selected modals)
Pattern
- Some modals add `modal-with-chat-left/right` to their modal container when chat is pinned.
- `app/globals.css`:
  - `.modal-with-chat-left { margin-left: 320px; }`
  - `.modal-with-chat-right { margin-right: 320px; }`

Known consumers using `useChatPinned()`
- `components/auction-calendar.tsx`
- `components/sold-recent-page.tsx`
- `components/team-page.tsx`
- `components/contact-page.tsx`

Known consumer reading body classes directly (inconsistent)
- `components/why-page.tsx`:
  - `document.body.classList.contains('chat-pinned-left/right')`

Known non-consumer (no offset)
- `components/terms-page.tsx` (no `modal-with-chat-*` usage)

---

## 4) Observer hook: `useChatPinned`

File: `hooks/use-chat-pinned.ts`

- Reads `document.body.classList.contains('chat-pinned-left/right')`.
- Sets state on mount and whenever `document.body` class changes.
- Implementation detail: uses `MutationObserver` on `document.body` with `{ attributeFilter: ['class'] }`.

Why this matters
- Any component can react to pin/unpin without props, but it introduces a global DOM dependency.

---

## Audit notes / risk areas

- Global state is DOM-based: pinning is not React state at the app root; it’s a body class.
- Inconsistent pinned-state detection across modals:
  - Most use `useChatPinned()` (reactive).
  - `WhyPage` reads `document.body` once at render time (not reactive to later pin/unpin).
- Pin UI is desktop-only; mobile forces fullscreen chat and hides pin dropdown.
- Admin panel mounts chat with `activeAuctionId={null}`; this affects any auction-scoped chat/history logic inside `AuctionChat`.

## Quick verification checklist

- Desktop pin left/right:
  - Body gets exactly one class: `chat-pinned-left` or `chat-pinned-right`.
  - Home content shifts by 320px and remains usable.
- Unpin:
  - Both body classes removed.
  - Main content returns to normal.
- Close chat while pinned:
  - Cleanup removes pinned classes.
- Mobile (<768px):
  - Chat opens fullscreen (`fixed inset-0`).
  - Pin UI is not available.
