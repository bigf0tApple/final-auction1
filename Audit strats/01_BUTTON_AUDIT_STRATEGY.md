# 01 — Button audit strategy

Goal: for any button, prove what it connects to (handler → state → effects → UI) and that it is guarded correctly.

## Inputs

- A button label, `aria-label`, icon, or location (page/component).

## Procedure

1) Locate the render site

- Search for the label text.
- If icon-only, search for `aria-label`.
- If it’s a shadcn button, search for `<Button` and narrow by nearby text.

2) Identify the handler

- Record the exact handler expression:
  - inline lambda: `onClick={() => ...}`
  - named function: `onClick={handleX}`

3) Trace the handler to its “target”

Classify the target (this tells you what can break):

- Local state: `useState` setters
- Context method: `useAuction()` actions
- Navigation: `redirect`, `router.push`, link click
- Storage: `localStorage.setItem/removeItem`
- DOM: `document.body.classList.*`, `document.documentElement.*`
- Network: `fetch`, service calls

4) Enumerate guardrails

- Is there a `disabled` condition?
- Is there a pending flag to prevent double-submit?
- Are time gates enforced (final 10 seconds)?
- Is the UI consistent when disabled (cursor, opacity, text)?

5) Enumerate side effects

- Toasts
- Modals open/close
- Storage writes
- Body class changes
- Intervals/timeouts

6) Validate invariants

- Icon visibility on hover (icons should inherit `currentColor`)
- `aria-label` for icon-only buttons
- No hydration-sensitive values in SSR markup

## Button audit record (copy/paste)

- Button: (label / aria-label)
- Location: `components/...` or `app/...`
- Type: Navigation | Modal lifecycle | Auction control | Chat | Admin
- Handler:
- Target:
- State changes:
- Side effects:
- Guardrails:
- Failure modes to test:
  - Double click
  - Disabled state
  - Final-10s gating
  - Offline / error handling

## Common failure patterns

- Guardrails applied in main UI but missing in chat quick-bid.
- `disabled={something || undefined}` accidentally passes `undefined` and logic is wrong.
- Handler starts async work but UI doesn’t disable until later.
- Icon hard-coded to `text-white` and disappears on hover.
