# CHAT RULES (COMPONENT) FLOW MAP

Scope:
- Chat guidelines modal: `components/chat-rules.tsx`

Mounted from:
- `components/auction-chat.tsx` (renders when `showRules` is true)

Related docs:
- Chat entrypoints + buttons: `CHAT_BUTTON_MAP.md`
- Chat lifecycle + pinning: `CHAT_HISTORY_LIFECYCLE_FLOW_MAP.md`, `CHAT_BUTTON_AND_PINNING_FLOW_MAP.md`

---

## Purpose

- Document the standalone “Chat Guidelines” modal: props, close behavior, and content.
- Keep chat moderation implementation details out of scope (those live in `AuctionChat`).

---

## Public API

Component: default export `ChatRules(props)`

Props:
- `onClose: () => void`
- `isDark: boolean`

---

## Render model

Top-level overlay:
- Full-screen modal overlay: `div.fixed.inset-0 ... bg-black bg-opacity-50 z-50`
- Centers a scrollable modal container with `max-h-[90vh] overflow-y-auto`.

Header:
- Title: “Chat Guidelines”
- Close button (X):
  - Handler: `onClick={onClose}`

Body:
- Two-column grid on `md+`, single column on mobile.
- Renders 6 `Card`s with icon + title + rule text:
  1) Rate Limiting
  2) General Rules
  3) Prohibited Content
  4) Auction Etiquette
  5) Violation Consequences
  6) Need Help? (includes `ArpoStudio@proton.me`)

---

## Behavior / side effects

- No internal state.
- No storage, no network, no timers.
- Close behavior is explicit via the X button only (no backdrop click handler in this component).

---

## Wiring in `AuctionChat`

`components/auction-chat.tsx`:
- Holds `showRules` boolean state.
- Renders:
  - `{showRules && <ChatRules onClose={() => setShowRules(false)} isDark={isDark} />}`

---

## Styling notes

- `isDark` toggles multiple class strings and uses hard-coded hex colors (e.g., `bg-[#000000]`).
- Some Cards use semantic color palettes (yellow/red/green/orange/blue) with `dark:` variants.

---

## Audit checklist

- Confirm the rules match the actual enforcement logic in `AuctionChat` (rate limit window, message length, blocked links/words, restriction durations).
- Verify close UX expectations:
  - If backdrop click or Escape-to-close is required, it must be implemented (here or by wrapping primitives).
- Confirm the contact email and “monitored for compliance” text is intended.
- If design system requires tokenized theming, replace hard-coded colors with theme tokens.
