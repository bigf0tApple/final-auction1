# NAVIGATION + MODAL LAUNCH FLOW MAP

Scope:
- Desktop nav dropdowns: `components/navigation-dropdown.tsx` (Sold / Next / About)
- Mobile nav menu: `components/mobile-menu.tsx`
- Page-level modal routing + state: `app/page.tsx` (`AuctionSiteContent`)

## Mental model

- Navigation UI components (dropdown / sheet) are *dumb launchers*:
  - They only call callbacks passed from `app/page.tsx`.
  - They manage only their own open/close UI state.
- `app/page.tsx` owns *all modal state flags* and decides what is rendered.

## Page-level modal state (source of truth)
File: `app/page.tsx` (`AuctionSiteContent`)

Modal-ish state flags:
- `showWalletModal` → `WalletConnectModal`
- `selectedAuctionForReminder` → `ReminderModal`
- `showCalendar` → `AuctionCalendar`
- `showSoldRecent` → `SoldRecentPage`
- `showAllSold` → `AllSoldPage`
- `showTeam` → `TeamPage`
- `showWhy` → `WhyPage`
- `showContact` → `ContactPage`
- `showTerms` → `TermsPage`

Non-modal route-like flag:
- `showAdminPanel` → *early return* of `<AdminPanel ... />` (replaces the entire page content)

## Desktop navigation (dropdowns)
Files:
- UI: `components/navigation-dropdown.tsx`
- Wiring: `app/page.tsx`

### Dropdown open/close behavior (`NavigationDropdown`)
- Click dropdown button:
  - toggles local `isOpen` (`useState`)
- When open:
  - renders a full-screen backdrop (`div.fixed.inset-0.z-10`) that closes on click
  - renders the menu (`div.absolute...z-20`)
- Click a menu item:
  - calls `item.onClick()` (page-provided handler)
  - then closes the dropdown via `setIsOpen(false)`

Notes (audit-relevant):
- No Escape-key handler.
- No `aria-expanded`/`aria-controls` attributes.

### Dropdown → page actions (`app/page.tsx`)
In the header:

1) **Sold**
- “Recent” → `setShowSoldRecent(true)`
- “ALL SOLD” → `setShowAllSold(true)`

2) **Next**
- “Calendar” → `setShowCalendar(true)`
- “What’s up next” → `scrollToUpcoming()`
  - finds `[data-section="upcoming-auctions"]` and calls `scrollIntoView({ behavior: 'smooth' })`

3) **About**
- “Team” → `setShowTeam(true)`
- “WHY” → `setShowWhy(true)`
- “Contact Us” → `setShowContact(true)`
- “T&Cs” → `setShowTerms(true)`

## Mobile navigation (sheet menu)
Files:
- UI: `components/mobile-menu.tsx`
- Wiring: `app/page.tsx`

### Open/close behavior (`MobileMenu`)
- Uses shadcn/ui `Sheet` with controlled state:
  - `open={isOpen}` and `onOpenChange={setIsOpen}`
- Trigger:
  - `SheetTrigger` wraps a ghost `Button` with the hamburger icon
- Clicking an item:
  - `handleItemClick(onClick)` runs the callback then `setIsOpen(false)`

### Mobile menu → page actions (`app/page.tsx`)
`app/page.tsx` passes callbacks:
- `onShowSoldRecent` → `setShowSoldRecent(true)`
- `onShowCalendar` → `setShowCalendar(true)`
- `onScrollToUpcoming` → `scrollToUpcoming()`
- `onShowTeam` → `setShowTeam(true)`
- `onShowWhy` → `setShowWhy(true)`
- `onShowContact` → `setShowContact(true)`
- `onShowTerms` → `setShowTerms(true)`
- `onAdminClick` → `setShowAdminPanel(true)`

Mobile parity note:
- Mobile menu does **not** currently expose “ALL SOLD” (desktop dropdown does).

## Modal render + close flows (page-owned)
File: `app/page.tsx`

Each modal is conditionally rendered near the bottom of the page and closes by resetting the owning state:
- `showWalletModal` → `<WalletConnectModal onCancel={() => setShowWalletModal(false)} onConnect={handleWalletConnect} />`
- `selectedAuctionForReminder` → `<ReminderModal onClose={() => setSelectedAuctionForReminder(null)} />`
- `showCalendar` → `<AuctionCalendar onClose={() => setShowCalendar(false)} />`
- `showSoldRecent` → `<SoldRecentPage onClose={() => setShowSoldRecent(false)} />`
- `showTeam` → `<TeamPage onClose={() => setShowTeam(false)} />`
- `showWhy` → `<WhyPage onClose={() => setShowWhy(false)} />`
- `showContact` → `<ContactPage onClose={() => setShowContact(false)} />`
- `showTerms` → `<TermsPage onClose={() => setShowTerms(false)} />`
- `showAllSold` → `<AllSoldPage onClose={() => setShowAllSold(false)} />`

## Admin Panel “launch” (route-like, not a modal)
File: `app/page.tsx`

Launch triggers:
- Desktop controls (admin only): Settings button → `setShowAdminPanel(true)`
- Mobile menu (admin only): “Admin Panel” → `onAdminClick()` → `setShowAdminPanel(true)`

Render behavior:
- When `showAdminPanel` becomes true:
  - `AuctionSiteContent` returns `<AdminPanel ... />` immediately.
  - This bypasses rendering of header/nav, content, and all modals.
- Close behavior:
  - `AdminPanel` calls `onClose()` → `setShowAdminPanel(false)` → page UI returns.

## Related (same pattern, different entrypoints)
- “Connect Wallet” buttons call `connectWallet()` → `setShowWalletModal(true)`.
- “Set Reminder” buttons call `handleSetReminder(auction)` → `setSelectedAuctionForReminder(auction)`.

## Audit checklist
- Verify mobile/desktop parity for launch surfaces (notably “ALL SOLD”).
- Confirm all modals unmount by resetting the correct state flag.
- Confirm admin gating:
  - Only admins see the Admin Panel entrypoints.
  - Admin panel replaces (does not overlay) the main app UI.
