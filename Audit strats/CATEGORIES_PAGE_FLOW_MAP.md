# CATEGORIES PAGE FLOW MAP

Scope:
- Categories modal/page component: `components/categories-page.tsx`
- Entry points: none currently wired (component is not imported/used elsewhere in the repo as of this audit)

## What this component is

`CategoriesPage` is a modal-style overlay that:
- shows a grid of category tiles (hardcoded dataset)
- lets the user drill into a single category to see example sold items
- provides explicit close/back controls

It is **self-contained** (no network, no storage, no context usage) and relies on the caller for open/close orchestration.

## Inputs and sources of truth

Props:
- `onClose(): void`
  - caller-defined close behavior (typically: set a `showCategories` flag false)
- `isDark: boolean`
  - styling only

Local state:
- `selectedCategory: Category | null`
  - `null` → list/grid view
  - `Category` → detail view for that category

Data:
- `categories: Category[]` is hardcoded inside the component.
- Item images are placeholder URLs.

Side effects:
- none (no `useEffect`, no localStorage/sessionStorage, no DOM mutations)

## Layout + close semantics

Render shape:
- full-screen fixed overlay: `div.fixed.inset-0 ... z-50`
- backdrop is the same wrapper element (`bg-black bg-opacity-50`)

Close behaviors:
- **No backdrop click-to-close**: clicking outside the panel does not call `onClose`.
- **No Escape handler** implemented here.
- Close is via explicit UI controls (X).

## Primary flows

### Flow A — Open categories
Caller responsibility:
- caller conditionally renders `<CategoriesPage onClose={...} isDark={...} />`

Component initial state:
- `selectedCategory = null`

User sees:
- header “Categories” + X close
- category grid cards

### Flow B — Close modal
UI:
- header close button (X)

Handler:
- `onClick={onClose}`

Outcome:
- caller unmounts the component (expected)

### Flow C — Select a category (drill-in)
UI:
- click a category `Card` in the grid

Handler:
- `onClick={() => setSelectedCategory(category)}`

State transition:
- `selectedCategory: null → Category`

Outcome:
- switches to detail view:
  - “← Back to Categories” button
  - selected category name/icon
  - grid of that category’s `items`

### Flow D — Back to grid
UI:
- “← Back to Categories” button

Handler:
- `onClick={() => setSelectedCategory(null)}`

State transition:
- `selectedCategory: Category → null`

Outcome:
- returns to category grid

## Guardrails and invariants

- No guards are required for state transitions (pure UI state).
- `isDark` affects class names only.
- No persistence: refresh/unmount resets to list view.

## Audit notes / risks

- Unwired surface:
  - `CategoriesPage` is not currently referenced by navigation or routes; if Categories is a required product feature, it needs an entrypoint.
- Accessibility:
  - Close button is icon-only and lacks an explicit `aria-label`.
  - Category selection uses clickable `Card` instead of a semantic button/link.
- UX parity:
  - Unlike `NavigationDropdown`/`Sheet` patterns, there’s no outside-click close.

## Manual test checklist

- Open the component (via temporary mount in a page):
  - category grid renders
  - clicking a category shows its detail view
  - “Back to Categories” returns to grid
  - X calls `onClose`
