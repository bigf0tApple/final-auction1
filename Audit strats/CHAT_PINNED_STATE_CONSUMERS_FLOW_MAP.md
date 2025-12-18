# Chat pinned-state consumers — flow map

Scope

- Pinned state producer:
  - `components/auction-chat.tsx` (writes `document.body` classes)
- Pinned state observer hook:
  - `hooks/use-chat-pinned.ts`
- Layout shift CSS:
  - `app/globals.css`
- Consumers:
  - `app/page.tsx`
  - `components/auction-calendar.tsx`
  - `components/sold-recent-page.tsx`
  - `components/team-page.tsx`
  - `components/contact-page.tsx`
  - `components/why-page.tsx`

Purpose

- Document all places that *consume* pinned chat state and how they do it.
- Highlight the behavioral difference between:
  - reactive consumption via `useChatPinned()` (updates when pin/unpin changes)
  - non-reactive consumption via direct `document.body.classList.contains(...)` at render time

---

## 1) Producer: where pinned state comes from

File: `components/auction-chat.tsx`

- Local state:
  - `isPinned: boolean`
  - `pinnedSide: 'left' | 'right'`
- Effect (`useEffect([isPinned, pinnedSide])`):
  - If pinned: `document.body.classList.add(`chat-pinned-${pinnedSide}`)`
  - Else: removes both `chat-pinned-left` and `chat-pinned-right`
  - Cleanup on unmount removes both classes

Outcome

- Pinned chat is a *global DOM side effect* (body class), not app-root React state.

---

## 2) Observer: `useChatPinned()`

File: `hooks/use-chat-pinned.ts`

- Reads pinned state from `document.body.classList`.
- Uses a `MutationObserver` to watch for class changes on `<body>` and updates:
  - `isChatPinnedLeft`
  - `isChatPinnedRight`

Outcome

- Consumers using the hook are reactive to pin/unpin, even if the pin toggle happens elsewhere.

---

## 3) Layout primitives (CSS)

File: `app/globals.css`

- Main content shift:
  - `.content-with-chat-left { margin-left: 320px; }`
  - `.content-with-chat-right { margin-right: 320px; }`
- Modal overlay shift:
  - `.modal-with-chat-left { margin-left: 320px; }`
  - `.modal-with-chat-right { margin-right: 320px; }`

Note

- `320px` matches `AuctionChat` pinned width (`w-80`).

---

## 4) Consumer inventory

### A) Home page main-content wrapper (reactive)

File: `app/page.tsx`

- Consumption method: `useChatPinned()`.
- Computation:
  - `contentShiftClass = isChatPinnedLeft ? 'content-with-chat-left' : isChatPinnedRight ? 'content-with-chat-right' : ''`
- Application:
  - wraps main page content inside `<div className={contentShiftClass}> ... </div>`.

Behavior

- Pin/unpin immediately shifts/unshifts the home content region (header remains unaffected).

### B) Modal overlays that shift away from pinned chat (reactive)

Consumption method: `useChatPinned()`.
Application pattern:
- outermost overlay container adds:
  - `modal-with-chat-left` when `isChatPinnedLeft`
  - `modal-with-chat-right` when `isChatPinnedRight`

Known reactive consumers

- `components/auction-calendar.tsx`
- `components/sold-recent-page.tsx`
- `components/team-page.tsx`
- `components/contact-page.tsx`

Behavior

- If chat gets pinned/unpinned while the modal is open, the overlay will re-render and shift accordingly.

### C) Modal overlay that shifts away from pinned chat (non-reactive)

File: `components/why-page.tsx`

- Consumption method: direct reads:
  - `document.body.classList.contains('chat-pinned-left/right')`
- Application: adds `modal-with-chat-left/right` on the overlay container.

Behavior difference

- This value is computed during render and is not subscribed to changes.
- If pin/unpin changes *after* `WhyPage` is rendered, it may not update until another re-render happens for unrelated reasons.

---

## 5) Audit notes / recommended standard

- Prefer `useChatPinned()` everywhere a component needs to respond to pin/unpin changes.
- Avoid direct `document.body.classList.contains(...)` in render for pinned-state consumption (non-reactive and harder to reason about).
- If pinning becomes more complex (e.g., persisted pin state), consider centralizing pinned state in app-level React state and only using body classes as a derived side effect.

## Quick verification checklist

- Pin left/right while:
  - Home page visible → main content shifts via `content-with-chat-*`.
  - Any reactive modal open (`Team`, `Contact`, `Calendar`, `Sold Recent`) → overlay shifts via `modal-with-chat-*`.
- With `WhyPage` open, toggle pin/unpin:
  - Confirm whether overlay shifts immediately; if not, this demonstrates the non-reactive consumption risk.
