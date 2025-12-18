# USE CHAT PINNED (HOOK) FLOW MAP

Scope:
- Observer hook: `hooks/use-chat-pinned.ts`

Related docs:
- End-to-end pin system + consumers: `CHAT_BUTTON_AND_PINNING_FLOW_MAP.md`, `CHAT_PINNED_STATE_CONSUMERS_FLOW_MAP.md`

---

## Purpose

- Provide a hook-level reference for how pinned chat state is observed.
- Clarify what it reacts to (body class mutations) and what it does not do (no persistence).

---

## Public API

Export:
- `useChatPinned()`

Returns:
- `isChatPinnedLeft: boolean`
- `isChatPinnedRight: boolean`

Meaning:
- `isChatPinnedLeft` is true iff `document.body.classList` contains `chat-pinned-left`.
- `isChatPinnedRight` is true iff `document.body.classList` contains `chat-pinned-right`.

---

## Internal state

- `isChatPinnedLeft` / `isChatPinnedRight` are React state booleans initialized to `false`.

---

## Side effects

Effect on mount:
1) Captures `body = document.body`.
2) Defines `update()` which reads body classes and sets both state booleans.
3) Calls `update()` immediately (initial sync).
4) Creates a `MutationObserver(update)`.
5) Observes `body` attribute changes filtered to `class` only.
6) Cleanup disconnects the observer.

No storage, no network.

---

## Behavioral notes / invariants

- Reactivity: consumers update immediately when the `<body>` class changes.
- Source of truth: this hook does not own pin state; it observes DOM side effects produced elsewhere (see `components/auction-chat.tsx`).
- Mutual exclusivity: the hook does not enforce “only one side pinned”; it simply reports what’s present on the body.

---

## Audit checklist

- Verify pin producer always removes both classes on unpin/unmount (prevents “stuck” pinned state).
- Verify any UI that needs reactive pin state uses `useChatPinned()` (avoid direct `document.body.classList.contains(...)` reads in render paths).
- Confirm pinned width matches CSS offsets (`w-80` ↔ `320px`) so layout shifts remain aligned.
