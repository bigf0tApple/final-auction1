# Theme + layout side effects flow map

This map documents app-wide UI side effects that are not purely React render output: dark-mode class toggling, chat pinning body classes, modal offsetting, and any persistence (localStorage/cookies).

Scope:

- Dark theme state (`isDark`) and how it is persisted/applied
- DOM mutations (`document.documentElement.classList`, `document.body.classList`)
- Layout shifts when chat is pinned
- Modal offset behavior when chat is pinned
- Sidebar cookie behavior (present in UI library, currently unused)

## Dark theme: source of truth + persistence

Primary location: `app/page.tsx`

State:

- `isDark` (`useState(false)`)

Initialization:

- On mount, reads `localStorage.getItem('isDark')` and parses JSON.
- If parsing succeeds, `setIsDark(isDarkTheme)`.

Applying the theme to the DOM:

- `useEffect([isDark])`:
  - If `isDark` → `document.documentElement.classList.add('dark')`
  - Else → `document.documentElement.classList.remove('dark')`

User action:

- `toggleTheme()`:
  - Flips `isDark`
  - Updates `document.documentElement.classList` immediately
  - Writes `localStorage.setItem('isDark', JSON.stringify(newIsDark))`

Important nuance:

- `app/layout.tsx` does not set the `dark` class server-side; theme is applied client-side.

## Dark theme: styling mechanism

Primary location: `app/globals.css`

Mechanism:

- Uses CSS variables under `:root` and `.dark` to switch tokens.
- Global `body` applies `bg-background` and `text-foreground` based on variables.

Additional theme-sensitive styling:

- Custom scrollbar styling has both light and `.dark` variants.
- Date/time input styling has both light and `.dark` variants.

## Chat pinning: body classes and layout shifts

### Pin action + DOM side effects

Location: `components/auction-chat.tsx`

State:

- `isPinned` (boolean)
- `pinnedSide` (`'left' | 'right'`)

Effect:

- When pinned:
  - Adds `chat-pinned-${pinnedSide}` to `document.body.classList`.
- When unpinned:
  - Removes both `chat-pinned-left` and `chat-pinned-right`.
- Cleanup also removes both classes.

### Observers and consumers

Observer hook:

- `hooks/use-chat-pinned.ts`
  - Uses a `MutationObserver` on `document.body` class attribute.
  - Exposes `{ isChatPinnedLeft, isChatPinnedRight }`.

Consumers:

- `app/page.tsx`:
  - Computes `contentShiftClass` as `content-with-chat-left` / `content-with-chat-right`.
  - Applies it to the main page content wrapper to shift content away from pinned chat.
- `components/auction-calendar.tsx`:
  - Reads pinned state for layout alignment.

CSS:

- `app/globals.css`:
  - `.content-with-chat-left { margin-left: 320px; }`
  - `.content-with-chat-right { margin-right: 320px; }`

## Modals + chat overlap avoidance

Primary location: `app/globals.css`

- `.modal-with-chat-left { margin-left: 320px; }`
- `.modal-with-chat-right { margin-right: 320px; }`

Example consumer:

- `components/why-page.tsx` reads `document.body.classList.contains('chat-pinned-*')` and applies `modal-with-chat-*` to the overlay container.

Important nuance:

- `why-page.tsx` reads `document.body` during render (guarded by `typeof document !== 'undefined'`), not via an effect/hook.

## Sidebar cookie (UI library)

Location: `components/ui/sidebar.tsx`

- Defines `SIDEBAR_COOKIE_NAME = 'sidebar:state'`.
- When `setOpen(...)` is called, writes:
  - `document.cookie = sidebar:state=<openState>; path=/; max-age=...`

Current usage note:

- No usages of `SidebarProvider` / `Sidebar` were found outside `components/ui/sidebar.tsx`, so this cookie is likely unused in the current app routes.

## Audit checklist

- Verify theme hydration expectations:
  - Theme is applied client-side; ensure pages don’t flash the wrong theme on first paint if that matters.
- Verify pinning cleanup:
  - Ensure `chat-pinned-*` classes are removed when chat unmounts.
- Verify modal positioning:
  - Any new modal overlays should apply `modal-with-chat-*` (or use `useChatPinned`) to avoid overlap when chat is pinned.
- Verify cookie scope:
  - If sidebar UI is introduced, confirm whether writing `sidebar:state` cookie is desired.
