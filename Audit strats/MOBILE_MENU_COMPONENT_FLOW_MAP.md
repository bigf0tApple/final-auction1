# MOBILE MENU (COMPONENT) FLOW MAP

Scope:
- Mobile navigation sheet menu: `components/mobile-menu.tsx`

Related docs:
- End-to-end nav + modal launching: `NAVIGATION_AND_MODAL_LAUNCH_FLOW_MAP.md`
- Navigation click targets: `NAVIGATION_SURFACE_BUTTON_MAP.md`
- Page-level owner of modal state: `AUCTION_HOME_PAGE_FLOW_MAP.md`

---

## Purpose

- Provide a component-level reference for `MobileMenu` (props → sections/items → Sheet open/close behavior).
- Avoid duplicating the page-level routing logic (that belongs to the related docs above).

---

## Public API

Component: default export `MobileMenu(props)`

Props (`MobileMenuProps`):
- Theme/admin flags:
  - `isDark: boolean` (used for trigger and sheet styling)
  - `isAdmin: boolean` (gates Admin Panel entry)
  - `onAdminClick: () => void`

- Optional navigation actions (callbacks):
  - `onShowSoldRecent?: () => void`
  - `onShowCalendar?: () => void`
  - `onScrollToUpcoming?: () => void`
  - `onShowTeam?: () => void`
  - `onShowWhy?: () => void`
  - `onShowContact?: () => void`
  - `onShowTerms?: () => void`

Wiring expectation:
- `app/page.tsx` passes these callbacks to flip its modal flags or scroll.

---

## Internal state

Local state:
- `isOpen: boolean` (controls the `Sheet`)

---

## Menu model

`menuItems` is a local array of sections:

- Section: `Sold`
  - `Recent` -> `onShowSoldRecent?.()`

- Section: `Next`
  - `Calendar` -> `onShowCalendar?.()`
  - `What’s up next` -> `onScrollToUpcoming?.()`

- Section: `About`
  - `Team` -> `onShowTeam?.()`
  - `WHY` -> `onShowWhy?.()`
  - `Contact Us` -> `onShowContact?.()`
  - `T&Cs` -> `onShowTerms?.()`

Each item includes:
- `label: string`
- `icon: lucide icon component`
- `onClick: () => void` (calls the optional prop)

Parity note (from navigation docs):
- Mobile menu does not expose “ALL SOLD” (desktop dropdown does).

---

## Open/close behavior

Rendering structure:
- `<Sheet open={isOpen} onOpenChange={setIsOpen}>`
  - `<SheetTrigger asChild>` wraps the hamburger `Button`
  - `<SheetContent>` holds header + sections + optional admin row

Trigger button:
- Uses `lg:hidden` so it only appears on smaller breakpoints.
- Styles depend on `isDark` (text + hover inversion).

Clicking a menu item:
- Each item button calls `handleItemClick(item.onClick)`.
- `handleItemClick(onClick)`:
  1) calls `onClick()`
  2) then `setIsOpen(false)` to close the sheet

Admin row (only if `isAdmin`):
- Button handler:
  1) calls `onAdminClick()`
  2) then `setIsOpen(false)`

---

## Styling and side-effect notes

- Uses shadcn/ui `Sheet` for overlay behavior; outside click / escape close are owned by that component.
- `SheetContent` uses conditional classes based on `isDark`, including hard-coded hex colors (e.g., `bg-[#000000]`).
  - This may diverge from tokenized theme usage elsewhere; treat as a design-system consistency check.

No storage, no network, no timers in this component.

---

## Audit checklist

- Verify mobile/desktop parity for navigation (notably “ALL SOLD”).
- Confirm each optional callback is present where expected; missing callbacks are silently ignored via optional chaining.
- Validate that closing behavior is correct:
  - selecting any item closes the sheet
  - admin click closes the sheet
- Check theme consistency:
  - replace hard-coded colors with theme tokens if the design system requires it.
- Ensure `isAdmin` gating matches the page-level admin derivation (no unintended exposure).
