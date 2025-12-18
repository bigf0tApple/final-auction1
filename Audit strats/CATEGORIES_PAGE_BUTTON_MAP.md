# Categories page — button map

File: `components/categories-page.tsx`

Note: As of this audit, `CategoriesPage` is not referenced elsewhere in the repo (no import/usages found), so `onClose` behavior is a contract defined by the caller.

## State and sources of truth

- Local state: `selectedCategory: Category | null`
- Props:
  - `onClose(): void` (caller decides what closing means)
  - `isDark: boolean` (styling only)
- Side effects: none (no storage, no DOM mutations, no network)

## Click targets (what connects to what)

1) Header close button (X)

- UI: Header right-side icon button
- Element: `Button` (variant `ghost`)
- Handler: `onClick={onClose}`
- Connects to: caller-provided close action (usually: hide modal state)
- Side effects: none inside this component
- Guardrails:
  - No `disabled` state
- Audit notes:
  - Icon-only button currently has no `aria-label` (accessibility risk).

2) Category card click (select a category)

- UI: Each category tile in the grid
- Element: `Card` with `cursor-pointer`
- Handler: `onClick={() => setSelectedCategory(category)}`
- Connects to: local state transition `selectedCategory: null → Category`
- Downstream UI changes:
  - Switches from category list view to the selected category items view
- Side effects: none
- Guardrails:
  - None required (pure state change)

3) “← Back to Categories” button

- UI: Top-left of selected category view
- Element: `Button` (variant `outline`)
- Handler: `onClick={() => setSelectedCategory(null)}`
- Connects to: local state transition `selectedCategory: Category → null`
- Downstream UI changes:
  - Returns to category list view
- Side effects: none
- Guardrails:
  - No `disabled` state

## Manual test steps

- Open Categories modal (caller responsibility)
- Click X
  - Expected: caller closes the modal; page remains stable (no scroll lock issues)
- Click any category card
  - Expected: switches to selected view; correct category title/icon show
- Click “Back to Categories”
  - Expected: returns to grid

## Follow-up improvements (optional)

- Add `aria-label` to the header close button (icon-only).
- If the caller uses `Escape` to close, verify it calls the same `onClose`.
