# Sold pages flow map

This map documents the two “Sold” surfaces and how they are opened, what data they display, and what side effects exist.

Scope:

- “Recently Sold” modal (`SoldRecentPage`)
- “ALL SOLD” full-screen page (`AllSoldPage`)
- Entrypoints from the Home page navigation
- Chat overlay behavior on these pages

## Entrypoints (Home)

Location: `app/page.tsx`

State:

- `showSoldRecent` (boolean)
- `showAllSold` (boolean)

Open actions:

- Desktop nav dropdown **Sold → Recent**:
  - `onClick: () => setShowSoldRecent(true)`
- Desktop nav dropdown **Sold → ALL SOLD**:
  - `onClick: () => setShowAllSold(true)`
- Mobile menu **Sold → Recent**:
  - `onShowSoldRecent: () => setShowSoldRecent(true)`

Render:

- When `showSoldRecent` → renders `<SoldRecentPage onClose={() => setShowSoldRecent(false)} isDark={isDark} connectedWallet={connectedWallet} />`
- When `showAllSold` → renders `<AllSoldPage onClose={() => setShowAllSold(false)} isDark={isDark} connectedWallet={connectedWallet} />`

## Page: Recently Sold (`SoldRecentPage`)

Location: `components/sold-recent-page.tsx`

Layout:

- Modal overlay (`fixed inset-0 ... bg-black bg-opacity-50`).
- Applies chat overlap avoidance classes when chat is pinned:
  - Uses `useChatPinned()` and conditionally adds `modal-with-chat-left/right`.

Data source:

- `recentlySoldNFTs` is an in-component constant array (demo data).
- No external fetch, no shared state, no storage reads.

User actions:

- Close (X) → calls `onClose()` (home sets `showSoldRecent` false).
- Copy holder address → `navigator.clipboard.writeText(address)` and shows a local “copied” check icon for ~2s.
- Open Etherscan → `window.open('https://etherscan.io/address/<address>', '_blank')`.

Side effects:

- Uses `navigator.clipboard`.
- Opens a new tab/window via `window.open`.

Chat overlay:

- Renders a `ChatButton` inside the overlay:
  - `isAdmin={false}`
  - `activeAuctionId={null}` / `lastEndedAuctionId={null}` / `isFinalTenSeconds={false}`
  - `connectedWallet={connectedWallet || ''}`

Implication:

- Chat is available from this modal, but it is detached from auction lifecycle because ids are null.

## Page: ALL SOLD (`AllSoldPage`)

Location: `components/all-sold-page.tsx`

Layout:

- Full-screen page container (no translucent overlay): `fixed inset-0 z-50 flex h-screen flex-col`.

Data source:

- `soldArtworks` is a top-level constant array in the module (demo data).
- No external fetch, no shared state, no storage reads.

Sorting:

- `sortBy` state (default `"recent"`).
- `sortedArtworks` derived via `useMemo` and `Array.sort` on a cloned array.
- Options:
  - `price-high`, `price-low`, `bids-high`, `bids-low`, `recent`, `oldest`

User actions:

- Close (X) → calls `onClose()` (home sets `showAllSold` false).
- Sort dropdown (`Select`) → updates `sortBy`.

Chat overlay:

- Renders a `ChatButton` at the end of the component:
  - `isAdmin={false}`
  - `activeAuctionId={null}` / `lastEndedAuctionId={null}` / `isFinalTenSeconds={false}`
  - `connectedWallet={connectedWallet || ''}`

## Audit checklist

- Confirm intended data source:
  - Both pages are currently demo-only; no linkage to real auction outcomes.
- Confirm chat behavior on sold pages:
  - Chat renders but isn’t tied to an active auction; decide if that is desired.
- Confirm pinning overlap rules:
  - `SoldRecentPage` handles pinned chat offsets; `AllSoldPage` does not apply `modal-with-chat-*` (it is full-screen).
- Confirm external side effects:
  - Clipboard and `window.open` are used in `SoldRecentPage`.
