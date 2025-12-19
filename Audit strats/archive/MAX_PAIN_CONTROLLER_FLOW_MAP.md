# Max Pain Controller — Flow map

Scope: `components/bidding/max-pain-controller.tsx`.

Status note:
- No imports/usages found in the current app routing/UI. Treat as experimental/unwired unless intentionally planned to be integrated.

Related docs:
- Core Max Pain + pools overview: `MAX_PAIN_AND_BID_POOLS_FLOW_MAP.md`

## Purpose
- Provide a controller-style modal for activating/updating/deactivating MAX PAIN.
- Delegates all real logic to async callbacks (`onConfirm`, `onDeactivate`).

## Entry / Exit
- Entry: parent renders `<MaxPainController ... />`.
- Exit:
  - **X** button → `onCancel()`
  - **Cancel** button → `onCancel()`
  - Unmount by parent after a successful confirm/deactivate (not handled here).

## Inputs / Props
- `onConfirm(maxAmount: number): Promise<boolean>`
- `onDeactivate(): Promise<boolean>`
- `onCancel(): void`
- `currentBid: number`
- `launchPrice: number`
- `isDark: boolean`
- `isActive?: boolean` (default `false`)
- `currentLimit?: number` (only meaningful when `isActive` is true)

## Internal State (React)
- `maxAmount: string`
  - Initialized to `(launchPrice * 2).toFixed(4)`.
- `error: string`
- `isProcessing: boolean`

Derived:
- `defaultMaxPain = launchPrice * 2`

## Side effects
- Uses `sonner` toasts for user feedback:
  - success/failure for activate/update
  - success/failure for deactivate
  - generic “Transaction failed”
- No storage and no direct network calls (parent-provided async handlers).

## Core flows

### 1) Quick set options
UI: 3 outline buttons.
- **2x Launch** → `handleQuickSet(2)`
- **3x Launch** → `handleQuickSet(3)`
- **5x Launch** → `handleQuickSet(5)`

Handler: `handleQuickSet(multiplier)`
- Sets `maxAmount = (launchPrice * multiplier).toFixed(4)`
- Clears `error`

Selection styling:
- Button gets a blue background when its computed value equals `maxAmount`.

### 2) Manual input editing
UI: numeric `Input`.
- Updates `maxAmount` string.
- Clears `error` on change.

### 3) Activate / Update MAX PAIN
UI: primary button.
- Label:
  - inactive → “Activate MAX PAIN”
  - active → “Update MAX PAIN”
  - processing → “Processing...”

Handler: `handleConfirm()`

Validation order:
1) `amount = parseFloat(maxAmount)` must be a positive number.
2) Must be `> currentBid`.
3) If `isActive && currentLimit`:
   - new amount must be `> currentLimit`.

On valid:
- `isProcessing = true`
- Clears `error`
- Calls `await onConfirm(amount)`.

Toast outcomes:
- success → `MAX PAIN activated: ...` or `MAX PAIN updated: ...`
- failure → “Failed to set MAX PAIN”
- catch → toast “Transaction failed” and sets `error` to a retry message.

Important nuance:
- This component does not automatically close on success; parent must unmount it.

### 4) Deactivate MAX PAIN
UI: destructive button shown only when `isActive`.
- Label:
  - processing → “Deactivating...”
  - otherwise → “Deactivate MAX PAIN”

Handler: `handleDeactivate()`
- `isProcessing = true`
- Calls `await onDeactivate()`.
- Toast outcomes:
  - success → “MAX PAIN deactivated”
  - failure → “Failed to deactivate MAX PAIN”
  - catch → “Deactivation failed”

Important nuance:
- `error` state is not used for deactivate failures.

## Render conditions / UX notes
- “MAX PAIN Currently Active” status card renders only when `isActive && currentLimit`.
- “Default recommendation” renders only when:
  - `!isActive` AND
  - `parseFloat(maxAmount) === defaultMaxPain`.
- Warning copy claims: “This cannot be undone once activated.”
  - Deactivate exists when `isActive`; ensure product copy matches actual behavior.

## Audit checklist
- Confirm parent wiring:
  - `onConfirm` actually sets Max Pain for the connected wallet and returns `true`/`false` accurately.
  - `onDeactivate` actually clears Max Pain and returns `true`/`false` accurately.
  - Parent closes/unmounts the modal on success.
- Validate copy vs behavior:
  - Deactivation is supported by UI; warning text may overstate irreversibility.
- Validate validation thresholds:
  - Requires `> currentBid` always.
  - Requires `> currentLimit` when updating an active limit.
