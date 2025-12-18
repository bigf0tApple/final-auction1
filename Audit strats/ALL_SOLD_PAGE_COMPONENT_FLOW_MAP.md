# ALL SOLD PAGE (COMPONENT) FLOW MAP

Scope:
- ALL SOLD full-screen overlay page: `components/all-sold-page.tsx` (`AllSoldPage`)

Related docs:
- Surface-level entrypoints + both sold pages: `SOLD_PAGES_FLOW_MAP.md`
- Chat floating button + pinning: `CHAT_BUTTON_AND_PINNING_FLOW_MAP.md`

---

## Purpose

- Show a full-screen grid of sold artworks.
- Provide in-page sorting controls.
- Provide access to chat via a floating `ChatButton`.

---

## Public API

Component: default export `AllSoldPage(props)`

Props:
- `onClose: () => void`
- `isDark: boolean`
- `connectedWallet?: string`

---

## Internal state

- `sortBy: SortOption`
  - Default: `"recent"`
  - Options: `price-high | price-low | bids-high | bids-low | recent | oldest`

Derived state:
- `sortedArtworks` via `useMemo([...soldArtworks].sort(...))` keyed by `[sortBy]`.

---

## Data source

- `soldArtworks: SoldArtwork[]` is a module-level constant array (demo-only).
- No fetches, no shared store usage.

---

## Layout

- Full-screen overlay: `fixed inset-0 z-50 flex h-screen flex-col`.
- Header contains close button → `onClose()`.
- Sort controls use shadcn `Select` and update `sortBy`.
- Grid maps `sortedArtworks` to cards.
- Footer displays aggregate stats derived from `soldArtworks` (count, volume, average price, total bids).

Pinned chat overlap:
- No `useChatPinned()` handling here.
- The chat button is at `fixed bottom-4 right-4` (see `ChatButton`).

---

## User actions

Close:
- Header X button calls `onClose()`.

Sort:
- Select `onValueChange` sets `sortBy`.

---

## Chat overlay wiring

Renders floating chat button:
- `<ChatButton ... />` at the end of the page.

Props passed:
- `isDark={isDark}`
- `connectedWallet={connectedWallet || ""}`
- `isAdmin={false}`
- `activeAuctionId={null}`
- `lastEndedAuctionId={null}`
- `isFinalTenSeconds={false}`

Implication:
- Chat is accessible from ALL SOLD but not tied to any auction ids.

---

## Side effects

- None directly in `AllSoldPage`.
- (Indirect) ChatButton may read/write localStorage for display name and can show an `alert` if wallet is not connected.

---

## Audit checklist

- Confirm whether sold data should remain demo-only or be wired to real auction outcomes.
- Confirm chat behavior with `activeAuctionId=null` on this page.
- Confirm whether pinned chat layout needs special handling in full-screen mode.
- Confirm sort option labels and ordering match product requirements.
