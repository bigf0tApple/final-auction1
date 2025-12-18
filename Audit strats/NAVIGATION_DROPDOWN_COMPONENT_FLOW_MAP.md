# NAVIGATION DROPDOWN (COMPONENT) FLOW MAP

Scope:
- Desktop header dropdown menu: `components/navigation-dropdown.tsx`

Related docs:
- End-to-end nav + modal launching: `NAVIGATION_AND_MODAL_LAUNCH_FLOW_MAP.md`
- Navigation click targets: `NAVIGATION_SURFACE_BUTTON_MAP.md`

---

## Purpose

- Provide a component-level reference for `NavigationDropdown` (open/close state, backdrop click handling, item click flow).
- Keep page-level routing concerns out of scope (those are owned by the related docs).

---

## Public API

Component: default export `NavigationDropdown(props)`

Props:
- `title: string`
- `items: Array<{ label: string; onClick: () => void }>`
- `isDark: boolean` (drives text + background classes)

---

## Internal state

Local state:
- `isOpen: boolean` (default `false`)

---

## Render + interaction flow

Base render:
- Wrapper: `div.relative`
- Trigger button:
  - `onClick={() => setIsOpen(!isOpen)}`
  - Renders `title` + `ChevronDown`

When `isOpen === true`:

1) Backdrop
- Renders a full-screen backdrop: `div.fixed.inset-0.z-10`
- Backdrop click closes the menu: `onClick={() => setIsOpen(false)}`

2) Dropdown menu
- Renders menu container: `div.absolute.top-full.left-0...z-20`
- Theme styling depends on `isDark` and uses hard-coded hex for dark background.

3) Item buttons
- For each `items[]`, renders a button.
- On click:
  1) calls `item.onClick()` (caller-provided action)
  2) then closes dropdown: `setIsOpen(false)`

---

## Wiring in `app/page.tsx`

`app/page.tsx` mounts three desktop dropdowns (`lg:flex` only):
- `Sold` (Recent, ALL SOLD)
- `Next` (Calendar, What’s up next)
- `About` (Team, WHY, Contact Us, T&Cs)

All item callbacks mutate page-level state or scroll; the dropdown does not own that state.

---

## Side effects

- No storage, no network, no timers.
- Click-outside close is implemented via the full-screen backdrop element.

---

## Accessibility / UX notes

- Trigger button lacks `aria-expanded`, `aria-controls`, and keyboard navigation handling.
- No Escape key handler (closing relies on backdrop click or selecting an item).
- No focus management when menu opens/closes.

---

## Audit checklist

- Confirm dropdown close behavior is acceptable on desktop:
  - opens on trigger click
  - closes on backdrop click
  - closes after item click
- Validate styling consistency:
  - avoid hard-coded colors if the design system requires tokens.
- If accessibility is a requirement:
  - add ARIA attributes and keyboard/focus handling.
