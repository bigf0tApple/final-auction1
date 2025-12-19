# MAX PAIN MODAL — FLOW MAP

Scope:
- UI modal: `components/max-pain-modal.tsx`

Related docs:
- Max Pain system overview: `MAX_PAIN_AND_BID_POOLS_FLOW_MAP.md`
- Home-page integration (open/close + confirm): `AUCTION_HOME_PAGE_FLOW_MAP.md`
- Core hook behavior (auto-bid delay): `USE_AUCTION_STATE_HOOK_FLOW_MAP.md`
- Alternate/unwired UI: `MAX_PAIN_CONTROLLER_FLOW_MAP.md`

---

## Purpose

- Document the live MAX PAIN activation modal used by `app/page.tsx`.
- Capture its validation rules, quick option behavior, and callback contract.

---

## Entry / Exit

Entry (rendering):
- The modal is conditionally rendered by callers (home page):
  - `{showMaxPainModal && <MaxPainModal isOpen ... />}`

Local guard:
- If `isOpen` is false, the component returns `null`.

Exit:
- Cancel/close calls `onCancel()`.
- Confirm calls `onConfirm(amount)` only if validation passes.

---

## Inputs / Props

`MaxPainModalProps`:
- `isOpen: boolean`
- `onConfirm(amount: number): void`
- `onCancel(): void`
- `currentBid: number` (used for validation + display)
- `launchPrice: number` (used for minimum threshold + quick options)
- `isDark?: boolean` (controls styling; defaults to `false`)

---

## Internal state

- `maxAmount: string` (controlled input value)
- `error: string` (validation error message)
- `isMobile: boolean` (derived from `window.innerWidth < 768`)

---

## Side effects

### Mobile detection
Effect on mount:
- Computes `isMobile` based on `window.innerWidth < 768`.
- Attaches a `resize` listener to update `isMobile`.
- Cleans up the listener on unmount.

No storage, no network.

---

## Derived values

- `minimumMaxPain = launchPrice * 2`

Quick options list:
- 2x / 3x / 4x / 5x launch price
- Each option defines:
  - `value` as a string with `toFixed(4)`
  - `disabled` if `currentBid >= launchPrice * multiplier`

---

## Core flows

### 1) Quick option selection
Handler: `handleQuickOption(value, disabled)`
- No-op if disabled.
- Sets `maxAmount = value` and clears `error`.

UI:
- Uses a `button` element per option (not the shadcn `Button`).
- Selected option is determined by `maxAmount === option.value`.

### 2) Manual input
- `Input type="number" step="0.0001"`
- `onChange` updates `maxAmount` string.
- Does not clear error automatically on edit.

### 3) Confirm activation
Handler: `handleConfirm()`

Parsing:
- `amount = Number.parseFloat(maxAmount)`

Validation order:
1) Must be a positive number:
   - if NaN or `<= 0` → `"Please enter a valid amount"`
2) Must exceed current bid:
   - if `amount <= currentBid` → `"Max Pain amount must be higher than current bid of ..."`
3) Must meet minimum threshold:
   - if `amount < minimumMaxPain` → `"Max Pain amount must be at least 2x launch price (...)"`

Success:
- Calls `onConfirm(amount)`.

Important integration note:
- The modal itself does not call `setMaxPain`; callers decide what `onConfirm` does (home page uses `setMaxPain(maxAmount, connectedWallet)` and then closes the modal).

---

## Rendering / UX notes

- Overlay: `fixed inset-0 bg-black bg-opacity-50`.
- Modal container:
  - border + rounded
  - uses `isMobile` to choose padding/width presets

Close button:
- Uses `Button variant="ghost"` with `X` icon and calls `onCancel()`.

Disclosure content:
- Explains “Auto-Bidding System” with a stated minimum of 2x launch price.

Feature description text:
- Claims:
  - “Automatically places 1% counter-bids instantly”
  - “Stops when threshold reached or someone bids higher”

Audit note:
- Hook implementation currently delays auto-bids by 1s and does not check `auctionState.isEnded` / final-10s restrictions; verify copy matches real behavior.

---

## Audit checklist

Validation correctness:
- Confirm the 2x launch minimum is intended.
- Confirm `amount <= currentBid` should be rejected (vs allowing equality).

Copy vs reality:
- Verify “instantly” claim vs 1s delay.
- Verify stop conditions align with `handleMaxPainBid` guards.

Edge cases:
- Launch price passed from `app/page.tsx` is currently `currentLiveAuction.launchPrice` (static); confirm the value matches the displayed auction.
- Consider clearing `error` when manual input changes (currently only cleared by quick option selection).
