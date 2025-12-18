# SIDEBAR (COMPONENT) FLOW MAP

Scope:
- Sidebar system: `components/ui/sidebar.tsx`

Related docs:
- Mobile detection: `USE_IS_MOBILE_HOOK_FLOW_MAP.md`
- Cookie/storage inventory: `STORAGE_KEYS_MAP.md` (includes `sidebar:state`)
- Layout side effects: `THEME_AND_LAYOUT_SIDE_EFFECTS_FLOW_MAP.md`

---

## Purpose

- Document the sidebar provider + component suite (desktop sidebar vs mobile sheet).
- Capture state model, cookie persistence, and keyboard shortcut behavior.

---

## Entry points / exports

Exports from `components/ui/sidebar.tsx`:

- Provider + hook:
  - `SidebarProvider`
  - `useSidebar()` (throws if used outside provider)

- Main building blocks:
  - `Sidebar`
  - `SidebarInset`
  - `SidebarTrigger`, `SidebarRail`

- Structure primitives (intended composition API):
  - `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarSeparator`
  - `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`
  - `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`
  - `SidebarMenuSkeleton`
  - `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`
  - `SidebarInput`

---

## Core state model (`SidebarProvider`)

Context type:
- `state: "expanded" | "collapsed"` (derived from `open`)
- `open: boolean` (desktop open/closed)
- `setOpen(open)`
- `openMobile: boolean` (mobile sheet open/closed)
- `setOpenMobile(open)`
- `isMobile: boolean` (from `useIsMobile()`)
- `toggleSidebar()` (mobile toggles `openMobile`, desktop toggles `open`)

### Controlled vs uncontrolled behavior

Inputs:
- `defaultOpen?: boolean` (default `true`)
- `open?: boolean` and `onOpenChange?: (open: boolean) => void`

Behavior:
- If `open` prop is provided, the provider is controlled and `setOpen()` calls `onOpenChange`.
- Otherwise it uses internal state `_open`.

### Cookie persistence (desktop)

When `setOpen()` runs it writes a cookie:
- Name: `sidebar:state`
- Value: `true` or `false`
- Max age: 7 days
- Path: `/`

Important note:
- `components/ui/sidebar.tsx` writes `sidebar:state` but does not read it back.
  - Any “restore last open/closed state” behavior would have to be implemented by a caller that reads cookies and passes `defaultOpen` or controlled `open`.

---

## Mobile vs desktop rendering (`Sidebar`)

`Sidebar` reads from context:
- `isMobile`, `state`, `openMobile`, `setOpenMobile`

Cases:

1) `collapsible === "none"`
- Always renders a simple fixed-width sidebar container.

2) Mobile (`isMobile === true`)
- Renders a Radix `Sheet` using `openMobile`.
- Sidebar content is placed inside `SheetContent` with `data-mobile="true"`.

3) Desktop (`isMobile === false`)
- Renders a peer-based layout:
  - A “gap” div that creates space for sidebar width (and animates width).
  - A fixed sidebar container (`md:flex`) with `data-state`, `data-collapsible`, `data-variant`, `data-side`.

Desktop styling relies heavily on Tailwind selectors against those data-attributes.

---

## User interactions

### Trigger button (`SidebarTrigger`)
- Renders a ghost icon button with `data-sidebar="trigger"`.
- On click:
  - Calls `onClick?.(event)` (if provided)
  - Then calls `toggleSidebar()`.

### Resize/toggle rail (`SidebarRail`)
- Renders an invisible button strip used as a toggle target.
- Calls `toggleSidebar()` on click.
- Cursor hints change based on `data-side` and collapsed state.

### Keyboard shortcut

`SidebarProvider` registers a global keydown listener:
- Shortcut key: `b`
- Requires `metaKey` or `ctrlKey` (Cmd/Ctrl)
- On match: `event.preventDefault()` then `toggleSidebar()`.

---

## Tooltip behavior in collapsed mode

`SidebarMenuButton` optionally wraps the button in a `Tooltip`.
- Tooltip is hidden unless:
  - `state === "collapsed"`, and
  - `isMobile === false`

---

## Side effects

- Writes cookies via `document.cookie` when toggling desktop open state.
- Registers/removes a `window` keydown listener for Cmd/Ctrl+B.
- On mobile, uses Radix Sheet overlay mechanics (mount/unmount controlled by `openMobile`).

No localStorage usage in this module.

---

## Wiring status (repo reality check)

- Grep did not find imports of `@/components/ui/sidebar` anywhere outside the module itself.
- That suggests the sidebar system is currently unused/unmounted in the app UI.

---

## Audit checklist

- Confirm whether cookie persistence is intended; if yes, add a cookie read path in the caller (or update provider to initialize from cookie).
- Ensure the global Cmd/Ctrl+B shortcut does not conflict with other keybinds (and doesn’t trigger while typing in inputs, if that matters).
- Validate mobile behavior:
  - Sidebar opens as a `Sheet` and closes correctly on route changes (if mounted).
- Confirm all sidebar usage is wrapped in `SidebarProvider` (otherwise `useSidebar()` throws).
- If enabling in production, ensure exactly one `SidebarProvider` is mounted to avoid competing global key listeners.
