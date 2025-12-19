# BID NOTIFICATION (COMPONENT) FLOW MAP

Scope:
- In-page bid notification banner: `components/bid-notification.tsx`

Mounted from:
- `app/page.tsx` (renders when `notification` state is set)

Related docs:
- System-level notification mapping: `BID_NOTIFICATIONS_AND_TOASTS_FLOW_MAP.md`

---

## Purpose

- Document the transient, self-dismissing notification UI used for bid feedback.
- Capture timer behavior and close animation timing.

---

## Public API

Component: default export `BidNotification(props)`

Props:
- `message: string`
- `type: "success" | "error"`
- `onClose: () => void` (caller clears the notification state)
- `isDark: boolean` (theme styling)

---

## Internal state

Local state:
- `isVisible: boolean` (initial `true`)

Meaning:
- Controls the fade/translate animation classes.

---

## Lifecycle + timing

On mount:
- Starts a `setTimeout` for 5000ms.

When the 5s timer fires:
1) `setIsVisible(false)` (starts CSS transition; `duration-300`)
2) Schedules `onClose` after 300ms (nested timeout) to allow fade-out to finish.

Cleanup:
- Clears the 5s timer on unmount.

Manual close (X):
1) `setIsVisible(false)`
2) Schedules `onClose` after 300ms

Important note:
- The nested 300ms timeout is not cleared on unmount; in practice this is usually harmless but can call `onClose` after unmount.

---

## Rendering

Placement:
- `fixed bottom-20 left-1/2 -translate-x-1/2 z-50`

Animation classes:
- Visible: `opacity-100 translate-y-0`
- Hidden: `opacity-0 translate-y-2`
- Transition: `transition-all duration-300`

Content:
- Container uses dark/light classes and hard-coded dark background (`bg-[#000000]`).
- Icon:
  - Uses `CheckCircle`
  - Color is green for success, red for error.
- Close button uses `Button variant="ghost"`.

---

## Wiring in `app/page.tsx`

- `app/page.tsx` conditionally renders `BidNotification` when `notification` is non-null.
- Close handler clears state: `onClose={() => setNotification(null)}`.

---

## Audit checklist

- Confirm 5s auto-dismiss is intended and consistent with other UX.
- Consider whether the nested 300ms timeout should be tracked/cleared on unmount.
- Ensure notification placement doesn’t conflict with pinned chat UI or other fixed overlays.
- If design system requires tokenized theming, replace hard-coded colors with theme tokens.
