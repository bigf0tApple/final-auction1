# USE IS MOBILE (HOOK) FLOW MAP

Scope:
- Viewport breakpoint hook: `hooks/use-mobile.tsx` (exports `useIsMobile()`)

Primary consumer:
- Sidebar responsiveness: `components/ui/sidebar.tsx`

Related docs:
- Layout/theme side effects: `THEME_AND_LAYOUT_SIDE_EFFECTS_FLOW_MAP.md`

---

## Purpose

- Provide a hook-level reference for how “mobile” is detected.
- Clarify runtime behavior (client-only, matchMedia listener, initial value).

---

## Public API

Export:
- `useIsMobile(): boolean`

Meaning:
- Returns `true` when the viewport is below the desktop breakpoint.

Breakpoint:
- `MOBILE_BREAKPOINT = 768`
- “Mobile” is defined as widths `< 768px`.

---

## Implementation summary (`hooks/use-mobile.tsx`)

State:
- `isMobile: boolean | undefined` in React state.
- Initial state is `undefined`.

Effect (runs on mount only):
1) Creates `mql = window.matchMedia('(max-width: 767px)')`.
2) Defines `onChange()`:
   - sets `isMobile` to `window.innerWidth < 768`.
3) Registers `mql.addEventListener('change', onChange)`.
4) Immediately syncs initial state via `setIsMobile(window.innerWidth < 768)`.
5) Cleanup removes the listener: `mql.removeEventListener('change', onChange)`.

Return value:
- `return !!isMobile`
  - While `isMobile` is `undefined` (pre-effect), this returns `false`.

---

## Side effects / dependencies

- Reads browser globals: `window.matchMedia`, `window.innerWidth`.
- Subscribes to media query changes (via `MediaQueryList` change events).
- No storage, no network, no timers.

---

## Consumer wiring (sidebar)

`components/ui/sidebar.tsx`:
- `SidebarProvider` calls `const isMobile = useIsMobile()`.
- `toggleSidebar()`:
  - If `isMobile`: toggles `openMobile` (Sheet/overlay state).
  - Else: toggles `open` and persists state in cookie `sidebar:state`.
- `Sidebar` rendering:
  - If `isMobile`: renders Radix `Sheet` + `SheetContent`.
  - Else: renders desktop sidebar container with responsive `md:` classes.

---

## Behavioral notes / invariants

- Initial render default: returns `false` until the mount effect runs.
  - This can momentarily render “desktop” behavior on first paint before the effect updates state.
- MatchMedia query (`max-width: 767px`) and `innerWidth < 768` are aligned.

---

## Audit checklist

- Confirm initial `false` (pre-effect) is acceptable for any surfaces that must not flash desktop UI.
- Ensure any component that uses this hook is a client component (directly or via an importing chain).
- Verify the breakpoint matches design expectations across the site (Tailwind `md` breakpoint is also 768 by default).
