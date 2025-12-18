# THEME PROVIDER (COMPONENT) FLOW MAP

Scope:
- Theme provider wrapper: `components/theme-provider.tsx`

Related docs:
- Theme toggling + layout side effects in current UI: `THEME_AND_LAYOUT_SIDE_EFFECTS_FLOW_MAP.md`

---

## Purpose

- Document the repo’s `ThemeProvider` wrapper around `next-themes`.
- Clarify current wiring status (mounted vs unused) so audits don’t assume `next-themes` is active.

---

## Public API

Export:
- `ThemeProvider(props: ThemeProviderProps)` from `next-themes`

Behavior:
- Renders `NextThemesProvider` with all props forwarded.

---

## Implementation

File: `components/theme-provider.tsx`

- Client component (`'use client'`).
- Imports `ThemeProvider as NextThemesProvider` from `next-themes`.
- Returns:
  - `<NextThemesProvider {...props}>{children}</NextThemesProvider>`

No local state.

---

## Side effects

- None implemented directly in this wrapper.
- Any storage/DOM effects (e.g., setting a `class` on `<html>`, persisting theme in localStorage) would be performed by `next-themes` when mounted.

---

## Wiring status (repo reality check)

- `app/layout.tsx` currently mounts `AuctionProvider` but does not import or render `ThemeProvider`.
- Grep did not find `ThemeProvider` usage outside `components/theme-provider.tsx`.

Implication:
- Theme behavior in the app appears to be owned elsewhere (e.g., `app/page.tsx` uses its own `isDark` state and applies `dark`/background classes).

---

## Audit checklist

- Confirm whether the project intends to use `next-themes`:
  - If yes, mount `ThemeProvider` at the app root (typically `app/layout.tsx`) and align the UI toggle to `next-themes`.
  - If no, consider removing the unused wrapper to avoid confusion.
- If adopting `next-themes`, decide the desired strategy (`class` vs `data-theme`) and storage key behavior, and reconcile with any existing theme state in `app/page.tsx`.
