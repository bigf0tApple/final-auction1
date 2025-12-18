# Navigation surface — button map

This map covers **site navigation UI** (desktop dropdowns + mobile menu) and how they open/close the site “modal pages” from `app/page.tsx`.

## Scope

- Desktop header dropdowns (`Sold`, `Next`, `About`) via `components/navigation-dropdown.tsx`
- Mobile menu sheet via `components/mobile-menu.tsx`
- The open/close wiring for:
  - `AuctionCalendar` (`components/auction-calendar.tsx`)
  - `SoldRecentPage` (`components/sold-recent-page.tsx`)
  - `AllSoldPage` (`components/all-sold-page.tsx`)
  - `TeamPage` (`components/team-page.tsx`)
  - `WhyPage` (`components/why-page.tsx`)
  - `ContactPage` (`components/contact-page.tsx`)
  - `TermsPage` (`components/terms-page.tsx`)
  - `AdminPanel` (`app/admin-panel.tsx`) via `showAdminPanel`

## Sources (files)

- `app/page.tsx`
- `components/navigation-dropdown.tsx`
- `components/mobile-menu.tsx`
- `components/auction-calendar.tsx`
- `components/sold-recent-page.tsx`
- `components/all-sold-page.tsx`
- `components/team-page.tsx`
- `components/why-page.tsx`
- `components/contact-page.tsx`
- `components/terms-page.tsx`

## Desktop navigation (dropdown)

Component: `components/navigation-dropdown.tsx`

### Click targets

- **Dropdown trigger button** (title + chevron)
  - UI: `button` wrapping `{title}` + `ChevronDown`
  - Handler: `onClick={() => setIsOpen(!isOpen)}`
  - Effect: toggles internal `isOpen` state

- **Backdrop (outside click close)**
  - UI: `<div className="fixed inset-0 z-10" />`
  - Handler: `onClick={() => setIsOpen(false)}`
  - Effect: closes dropdown without invoking any menu item

- **Dropdown item button**
  - UI: each `items.map(...)` entry renders a `button`
  - Handler:
    - `item.onClick()`
    - then `setIsOpen(false)`
  - Effect: triggers the action wired from `app/page.tsx` and closes dropdown

### Wiring from `app/page.tsx`

`app/page.tsx` renders 3 dropdowns on large screens (`lg:flex`):

- **Sold** (`NavigationDropdown title="Sold"`)
  - `Recent` → `setShowSoldRecent(true)` → renders `SoldRecentPage`
  - `ALL SOLD` → `setShowAllSold(true)` → renders `AllSoldPage`

- **Next** (`NavigationDropdown title="Next"`)
  - `Calendar` → `setShowCalendar(true)` → renders `AuctionCalendar`
  - `What’s up next` → `scrollToUpcoming()` → `querySelector('[data-section="upcoming-auctions"]')` + `scrollIntoView({ behavior: 'smooth' })`

- **About** (`NavigationDropdown title="About"`)
  - `Team` → `setShowTeam(true)` → renders `TeamPage`
  - `WHY` → `setShowWhy(true)` → renders `WhyPage`
  - `Contact Us` → `setShowContact(true)` → renders `ContactPage`
  - `T&Cs` → `setShowTerms(true)` → renders `TermsPage`

## Mobile navigation (sheet menu)

Component: `components/mobile-menu.tsx`

### Click targets

- **Hamburger trigger** (`SheetTrigger` → `Button` with `Menu` icon)
  - Effect: toggles `Sheet` open state via `open={isOpen}` and `onOpenChange={setIsOpen}`

- **Menu item buttons** (per section)
  - Handler: `onClick={() => handleItemClick(item.onClick)}`
  - `handleItemClick`:
    - calls the callback (wired from `app/page.tsx`)
    - then `setIsOpen(false)` to close the sheet

- **Admin Panel item** (only if `isAdmin`)
  - Handler:
    - calls `onAdminClick()`
    - then `setIsOpen(false)`

### Wiring from `app/page.tsx`

`app/page.tsx` renders `MobileMenu` only on small screens (`lg:hidden`) and passes callbacks:

- `onShowSoldRecent` → `setShowSoldRecent(true)`
- `onShowCalendar` → `setShowCalendar(true)`
- `onScrollToUpcoming` → `scrollToUpcoming()`
- `onShowTeam` → `setShowTeam(true)`
- `onShowWhy` → `setShowWhy(true)`
- `onShowContact` → `setShowContact(true)`
- `onShowTerms` → `setShowTerms(true)`
- `onAdminClick` → `setShowAdminPanel(true)`

**Not present in mobile menu:** `ALL SOLD` (desktop has it; mobile currently does not).

## Page-level state gates (open/close)

Component: `app/page.tsx` (client component)

### Modal open state

Each nav item sets one of these state variables to `true`:

- `showCalendar`
- `showSoldRecent`
- `showTeam`
- `showWhy`
- `showContact`
- `showTerms`
- `showAllSold`

The `AdminPanel` path is special:

- `showAdminPanel === true` returns early: `return <AdminPanel onClose={() => setShowAdminPanel(false)} ... />`

### Modal render + close wiring

`app/page.tsx` conditionally renders each modal component and passes an `onClose` callback that resets state:

- `AuctionCalendar onClose={() => setShowCalendar(false)}`
- `SoldRecentPage onClose={() => setShowSoldRecent(false)}`
- `TeamPage onClose={() => setShowTeam(false)}`
- `WhyPage onClose={() => setShowWhy(false)}`
- `ContactPage onClose={() => setShowContact(false)}`
- `TermsPage onClose={() => setShowTerms(false)}`
- `AllSoldPage onClose={() => setShowAllSold(false)}`
- `AdminPanel onClose={() => setShowAdminPanel(false)}`

## How each modal closes (inside the component)

Important for audits: most of these “modal pages” **do not close on backdrop click**; they close via explicit buttons.

- `components/auction-calendar.tsx`
  - Close button (X) in header: `onClick={onClose}`
  - Also can open `ReminderModal` inside calendar:
    - calendar event click (upcoming) → `setSelectedAuctionForReminder(auction)`
    - reminder modal close → `onClose={() => setSelectedAuctionForReminder(null)}`

- `components/sold-recent-page.tsx`
  - Close button (X) in header: `onClick={onClose}`

- `components/all-sold-page.tsx`
  - Full-screen page
  - Close button (X) in header: `onClick={onClose}`

- `components/team-page.tsx`
  - Close button (X) in header: `onClick={onClose}`

- `components/why-page.tsx`
  - Close button (X) in header: `onClick={onClose}`
  - CTA button “Start Bidding Now”: `onClick={onClose}`
  - Note: it checks pinned chat state via `document.body.classList` (not `useChatPinned`)

- `components/contact-page.tsx`
  - Close button (X) in header: `onClick={onClose}`
  - Has `aria-label="Close contact modal"`

- `components/terms-page.tsx`
  - Close button (X) in header: `onClick={onClose}`

## Side-effects & layout notes

- Dropdown open state is local to each `NavigationDropdown` instance; opening one doesn’t explicitly close the others.
- Mobile menu uses shadcn `Sheet`; outside-click / escape behavior is governed by that component, and internal `isOpen` tracks it via `onOpenChange`.
- Several modal pages adjust layout when chat is pinned using `useChatPinned()` and `modal-with-chat-left/right` classes (e.g. calendar, sold recent, team, contact). `TermsPage` does not.

## Manual test checklist

- Desktop:
  - Click each dropdown trigger → menu opens; click outside → closes.
  - Select each item → the correct modal opens and dropdown closes.
  - “What’s up next” scrolls to the section and dropdown closes.

- Mobile:
  - Tap hamburger → sheet opens; tap each item → sheet closes and correct modal opens.
  - If admin wallet connected: “Admin Panel” appears; tapping it opens admin panel and closes sheet.

- Modal closes:
  - Each opened modal: X closes it and returns to main page.
  - Why modal: CTA closes it.
  - Calendar: opening ReminderModal and closing it returns to calendar.
