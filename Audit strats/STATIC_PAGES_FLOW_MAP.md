# STATIC PAGES (ABOUT MODALS) FLOW MAP

Scope:
- Page-level state + modal routing: `app/page.tsx` (`AuctionSiteContent`)
- Entry points:
  - Desktop dropdown: `components/navigation-dropdown.tsx`
  - Mobile menu: `components/mobile-menu.tsx`
- Modal components (home-page overlays, not real routes):
  - `components/team-page.tsx`
  - `components/why-page.tsx`
  - `components/contact-page.tsx`
  - `components/terms-page.tsx`
- App Router route stubs (redirect-only):
  - `app/team/page.tsx`, `app/why/page.tsx`, `app/contact/page.tsx`, `app/terms/page.tsx`

## Mental model

- These “static pages” are implemented as *modal overlays* rendered by `app/page.tsx`.
- The App Router pages for `/team`, `/why`, `/contact`, `/terms` are *not content pages* (they redirect to `/`).
- Launching is done by toggling `showTeam/showWhy/showContact/showTerms` in `app/page.tsx`.

## Launch flows (entry points)

### Desktop: About dropdown
Files:
- UI: `components/navigation-dropdown.tsx`
- Wiring: `app/page.tsx`

`NavigationDropdown` calls page-provided `items[].onClick()` and then closes its own menu.

From `app/page.tsx`:
- “Team” → `setShowTeam(true)`
- “WHY” → `setShowWhy(true)`
- “Contact Us” → `setShowContact(true)`
- “T&Cs” → `setShowTerms(true)`

### Mobile: sheet menu
Files:
- UI: `components/mobile-menu.tsx`
- Wiring: `app/page.tsx`

`MobileMenu` calls the callback then closes its Sheet.

From `app/page.tsx`:
- “Team” → `onShowTeam()` → `setShowTeam(true)`
- “WHY” → `onShowWhy()` → `setShowWhy(true)`
- “Contact Us” → `onShowContact()` → `setShowContact(true)`
- “T&Cs” → `onShowTerms()` → `setShowTerms(true)`

## Render + close wiring (page-owned)

File: `app/page.tsx`

Each modal is conditionally rendered near the bottom of the page, and closes by resetting the owning flag:
- `showTeam` → `<TeamPage onClose={() => setShowTeam(false)} isDark={isDark} />`
- `showWhy` → `<WhyPage onClose={() => setShowWhy(false)} isDark={isDark} />`
- `showContact` → `<ContactPage onClose={() => setShowContact(false)} isDark={isDark} />`
- `showTerms` → `<TermsPage onClose={() => setShowTerms(false)} isDark={isDark} />`

Important: there is no shared “modal manager” and no route transition; these are plain React conditionals.

## Modal surfaces (internal behavior)

### `TeamPage` (`components/team-page.tsx`)

Props:
- `onClose()` (required)
- `isDark: boolean` (required)

Overlay + layout:
- Outer overlay: `div.fixed.inset-0 ... bg-black bg-opacity-50 ... z-50 p-4`
- Adds a pinned-chat offset class when chat is pinned:
  - Uses `useChatPinned()` → `{ isChatPinnedLeft, isChatPinnedRight }`
  - Applies `modal-with-chat-left` or `modal-with-chat-right` to the overlay container.
- Modal container:
  - `max-h-[90vh] overflow-hidden flex flex-col`
  - Scrolls content via inner `div.flex-1.overflow-y-auto`.

Click targets:
- Close button (top-right): `Button` → `onClose()`.
- Social icon buttons (per member):
  - LinkedIn/Twitter/GitHub → `window.open(url, "_blank")`
  - Email → `window.open("mailto:...", "_blank")`
- CTA: “View Open Positions” → `window.open("mailto:careers@arpostudio.com", "_blank")`

Side effects:
- Uses `window.open(...)` (new tab / mail app) as the primary external navigation mechanism.

### `WhyPage` (`components/why-page.tsx`)

Props:
- `onClose()` (required)
- `isDark: boolean` (required)

Overlay + pinned-chat offset:
- Detects pinned chat by reading `document.body.classList.contains('chat-pinned-left/right')`.
- Applies `modal-with-chat-left/right` to the overlay container.

Click targets:
- Close button (top-right): `Button` → `onClose()`.
- CTA: “Start Bidding Now” → `onClose()`.

Notes (audit-relevant):
- Pinned-chat detection is different from other modals:
  - `WhyPage` reads body classes directly.
  - `TeamPage`/`ContactPage` use the `useChatPinned()` hook.
  - If the pinned state changes while `WhyPage` is open, it will only reflect on the next render.

### `ContactPage` (`components/contact-page.tsx`)

Props:
- `onClose()` (required)
- `isDark?: boolean` (optional; defaults to `false`)

Overlay + pinned-chat offset:
- Uses `useChatPinned()` and applies `modal-with-chat-left/right` on the overlay.

State:
- `formData` (`name`, `email`, `subject`, `message`)
- `isSubmitting: boolean`
- `submitted: boolean` (success UI)

Handlers:
- `handleInputChange(e)` updates `formData[name]`.
- `handleSubmit(e)`:
  - `preventDefault()`
  - sets `isSubmitting=true`
  - waits ~1200ms (simulated async)
  - sets `submitted=true`
  - after ~3500ms: resets `submitted=false` and clears `formData`

Click targets:
- Close button (top-right): `Button` → `onClose()`.
- Submit button:
  - Only submits if browser `required` fields are satisfied.
  - No API call / server action yet (simulation only).

Notes (audit-relevant):
- Contact info values (emails) are displayed as text (not `mailto:` links).
- No “click backdrop to close”; only the close button.

### `TermsPage` (`components/terms-page.tsx`)

Props:
- `onClose()` (required)
- `isDark: boolean` (required)

Overlay + layout:
- Outer overlay is fixed + centered.
- Content scrolls via inner `div.flex-1.overflow-y-auto`.

Click targets:
- Close button (top-right): `Button` → `onClose()`.

Notes (audit-relevant):
- Unlike Team/Why/Contact, `TermsPage` does not apply `modal-with-chat-left/right` when chat is pinned.
  - Risk: pinned chat may overlap the terms modal on narrow viewports.
- Close button hover uses gray tokens (`hover:bg-gray-100 dark:hover:bg-gray-800`) instead of the black/white-only hover convention used elsewhere.
- Footer text uses `new Date().toLocaleDateString()` (“Last updated”), meaning the displayed date is generated at runtime.

## Route stubs (redirect-only)

Files:
- `app/team/page.tsx`
- `app/why/page.tsx`
- `app/contact/page.tsx`
- `app/terms/page.tsx`

Observed behavior:
- Each route immediately redirects to `/`.

Implication:
- Deep links to `/team` etc do not show the modal directly; users land on home and must open via navigation.

## Regression checklist

- Open each modal from desktop dropdown and mobile menu.
- Verify close button always closes the correct modal state flag.
- With chat pinned left/right:
  - Team/Why/Contact should apply offset classes.
  - Terms currently does not; check overlap.
- Verify modal content scrolls (especially Terms and Team).
- Verify external link actions:
  - Team social icons and careers email open as expected.
  - Contact submit shows “Message sent!” state and resets.
