# USE TOAST (HOOK) FLOW MAP

Scope:
- Toast store + hook: `hooks/use-toast.ts`
- Toast renderer: `components/ui/toaster.tsx`
- Toast primitives/wrapper components: `components/ui/toast.tsx`

Related docs:
- Notifications context (bid-related): `BID_NOTIFICATIONS_AND_TOASTS_FLOW_MAP.md`
- Storage overview (none used here): `STORAGE_KEYS_MAP.md`

---

## Purpose

- Provide a hook-level reference for the app’s toast store, reducer, and lifecycle.
- Clarify the “global singleton” design (module memory + listener fanout) and its side effects (timers).

---

## Public API

Exports from `hooks/use-toast.ts`:
- `useToast()`
- `toast(props)`
- `reducer(state, action)` (exported for reuse/testing)

### `useToast()` return value

- `toasts: ToasterToast[]`
- `toast(props)` -> `{ id, dismiss, update }`
- `dismiss(toastId?: string)`

### `toast(props)` input

Type: `Omit<ToasterToast, "id">`
- Supports `title?: ReactNode`, `description?: ReactNode`, `action?: ToastActionElement`
- Plus any `ToastProps` fields forwarded into the Radix Toast root (via `components/ui/toaster.tsx`)

---

## Data model

### `ToasterToast`

- `id: string` (generated, monotonic counter string)
- `title?: React.ReactNode`
- `description?: React.ReactNode`
- `action?: ToastActionElement`
- plus `ToastProps` (notably `open?: boolean`, `onOpenChange?: (open) => void`, `variant?: "default" | "destructive"`, etc.)

### State

- `memoryState: { toasts: ToasterToast[] }` lives at module scope.
- UI subscribers mirror it via React state in `useToast()`.

---

## Constants / limits

- `TOAST_LIMIT = 1`
  - Only 1 toast is kept; new toasts replace older ones.
- `TOAST_REMOVE_DELAY = 1000000` (ms)
  - Delay between dismiss and removal from state once queued.

---

## Reducer + actions

Action types:
- `ADD_TOAST` -> prepend toast and slice to `TOAST_LIMIT`
- `UPDATE_TOAST` -> shallow-merge by `id`
- `DISMISS_TOAST` -> sets `open: false` and enqueues removal timer(s)
- `REMOVE_TOAST` -> remove by `id` (or clear all if missing)

### Important reducer side effect

- `DISMISS_TOAST` triggers `addToRemoveQueue()` which schedules `REMOVE_TOAST` via `setTimeout`.
- Timers are de-duped per toast ID in `toastTimeouts: Map<string, Timeout>`.

---

## Dispatch + subscription model (global singleton)

- `dispatch(action)` mutates `memoryState` using `reducer(...)`.
- It then calls every function in `listeners` with the new `memoryState`.

`useToast()`:
- Initializes local React state to the current `memoryState`.
- Subscribes by pushing `setState` into `listeners` on mount.
- Unsubscribes by removing `setState` from `listeners` on unmount.

Audit note:
- The effect depends on `[state]`, which causes repeated subscribe/unsubscribe cycles as state changes. Typical patterns use `[]` here.

---

## Toast lifecycle (happy path)

1) Caller invokes `toast({ title, description, variant, ... })`.
2) Hook generates an `id` via `genId()`.
3) Dispatches `ADD_TOAST` with:
   - `open: true`
   - `onOpenChange(open)` that calls `dismiss()` when Radix closes the toast.
4) `Toaster` renders the `toasts` list into Radix primitives.
5) When dismissed (programmatically or by UI close), `DISMISS_TOAST`:
   - sets `open: false`
   - queues removal timer to later dispatch `REMOVE_TOAST`.

---

## Rendering / wiring (`components/ui/toaster.tsx`)

`Toaster()`:
- Calls `useToast()` and maps `toasts` into:
  - `ToastProvider`
  - `Toast` root + `ToastTitle`, `ToastDescription`, optional `action`, and `ToastClose`
  - `ToastViewport`

Critical wiring requirement:
- Toasts will only appear if `<Toaster />` is mounted in the React tree (commonly in `app/layout.tsx`).
- Current grep indicates `<Toaster />` is not mounted anywhere in `app/` at the moment.

---

## UI primitives (`components/ui/toast.tsx`)

- Thin wrapper around `@radix-ui/react-toast`.
- Styling via `class-variance-authority` variants:
  - `default`
  - `destructive`

---

## Duplicate implementation (potential confusion)

- A second copy exists at `components/ui/use-toast.ts`.
- `components/ui/toaster.tsx` imports from `@/hooks/use-toast`, so the `components/ui/use-toast.ts` version appears unused.

---

## Audit checklist

- Confirm `<Toaster />` is mounted exactly once at app root so any `toast(...)` calls become visible.
- Verify `TOAST_REMOVE_DELAY` is intentional; long delays keep closed toasts in memory.
- Confirm the `[state]` dependency in `useToast()` effect is intentional; otherwise switch to `[]` to avoid repeated listener churn.
- Ensure callers use `toast(...)` and `dismiss(...)` consistently (avoid re-implementing ad-hoc notification UI).
- Decide on one canonical module location for the hook (`hooks/` vs `components/ui/`) and remove/redirect the duplicate to prevent drift.
