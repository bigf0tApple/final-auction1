# Modals — button map

This map covers core “overlay” UI components (modals/toasts) and what their buttons/inputs connect to.

## Scope

- `WalletConnectModal` (`components/wallet-connect-modal.tsx`)
- `ReminderModal` (`components/reminder-modal.tsx`)
- `MaxPainModal` (`components/max-pain-modal.tsx`)
- `BidNotification` toast (`components/bid-notification.tsx`)

## Sources (files)

- `components/wallet-connect-modal.tsx`
- `components/reminder-modal.tsx`
- `components/max-pain-modal.tsx`
- `components/bid-notification.tsx`
- `app/page.tsx` (wiring: when each is shown + what `onClose/onCancel/onConfirm` does)

---

## Wallet connect modal

Component: `components/wallet-connect-modal.tsx`

Props:
- `onConnect(address: string)`
- `onCancel()`
- `isDark`

### Click targets

- **Close (X)**
  - UI: header X button
  - Handler: `onClick={onCancel}`
  - Effect: closes the modal in parent (in `app/page.tsx`: `setShowWalletModal(false)`)

- **MetaMask connect**
  - Handler: `onClick={connectMetaMask}`
  - Effects:
    - sets internal `isConnecting=true`
    - if `window.ethereum` exists: calls `ethereum.request({ method: 'eth_requestAccounts' })`
      - on success: `onConnect(accounts[0])`
    - else (demo fallback): selects a random mock wallet and calls `onConnect(randomWallet)` after 1s
    - finally sets internal `isConnecting=false`

- **WalletConnect connect**
  - Handler: `onClick={connectWalletConnect}`
  - Effects:
    - sets internal `isConnecting=true`
    - after 1.5s, generates a mock address and calls `onConnect(mockAddress)`
    - sets internal `isConnecting=false`

- **Demo: Connect as Admin**
  - Handler: `onClick={() => onConnect(ADMIN_ADDRESS)}`
  - Effect: calls `onConnect` immediately

### Parent wiring (where it goes)

In `app/page.tsx`:
- Opened by: `connectWallet()` → `setShowWalletModal(true)`
- Rendered as: `{showWalletModal && <WalletConnectModal ... />}`
- `onConnect={handleWalletConnect}`:
  - sets `connectedWallet` state
  - closes modal: `setShowWalletModal(false)`
- `onCancel={() => setShowWalletModal(false)}`

---

## Reminder modal

Component: `components/reminder-modal.tsx`

Props:
- `auction` (id/title/artist/startingBid/status)
- `onClose()`
- `isDark`

### Click targets / inputs

- **Close (X)**
  - Handler: `onClick={onClose}`

- **Radio options**
  - `When it starts` → `value="start"` → `setSelectedOption(e.target.value)`
  - `5 minutes before` → `value="5min"` → `setSelectedOption(...)`
  - `10 minutes before` → `value="10min"` → `setSelectedOption(...)`

- **Cancel button**
  - Handler: `onClick={onClose}`

- **Set Reminder button**
  - Handler: `onClick={setReminder}`
  - Effects:
    - requests Notification permission (`Notification.requestPermission()`)
      - if denied: `alert(...)` and returns
    - parses hours from `auction.status` via `/(
\d+)h/` (defaults to 2 hours if no match)
    - computes a reminder fire time by subtracting 0/5/10 minutes from “start”
    - if reminder would be in the past: `alert(...)` and returns
    - schedules a browser notification via `setTimeout(..., timeUntilReminder)`
    - persists reminder to localStorage:
      - key: `auctionReminders`
      - value: JSON array of reminder objects
    - shows success `alert(...)`
    - calls `onClose()`

### Side effects

- Uses browser `Notification` API (permission prompt + notifications)
- Writes `localStorage['auctionReminders']`

### Parent wiring (where it goes)

In `app/page.tsx`:
- Opened by: Upcoming card “Set Reminder” button → `handleSetReminder(auction)` → `setSelectedAuctionForReminder(auction)`
- Rendered by: `{selectedAuctionForReminder && <ReminderModal ... />}`
- Closed by: `onClose={() => setSelectedAuctionForReminder(null)}`

Also opened inside the calendar (`components/auction-calendar.tsx`) for upcoming events; closed by setting its `selectedAuctionForReminder` back to `null`.

---

## Max Pain modal

Component: `components/max-pain-modal.tsx`

Props:
- `isOpen`
- `onConfirm(amount: number)`
- `onCancel()`
- `currentBid`
- `launchPrice`
- `isDark?`

### Click targets / inputs

- **Close (X)**
  - Handler: `onClick={onCancel}`

- **Quick option buttons**
  - Handler: `onClick={() => handleQuickOption(option.value, option.disabled)}`
  - Effect:
    - if not disabled: sets `maxAmount` and clears `error`
  - Disabled when: `currentBid >= launchPrice * N`

- **Amount input**
  - Handler: `onChange={(e) => setMaxAmount(e.target.value)}`

- **Cancel button**
  - Handler: `onClick={onCancel}`

- **Activate MAX PAIN button**
  - Handler: `onClick={handleConfirm}`
  - Validation:
    - amount must be numeric and > 0
    - amount must be greater than `currentBid`
    - amount must be >= `2x launchPrice`
  - Effect: `onConfirm(amount)`

### Parent wiring (where it goes)

In `app/page.tsx`:
- Opened by: `handleMaxPain()` when user clicks MAX PAIN
- Rendered by: `{showMaxPainModal && <MaxPainModal isOpen ... />}`
- Closed by: `onCancel={() => setShowMaxPainModal(false)}`
- Confirm path: `onConfirm={handleMaxPainConfirm}` (sets max pain via auction context, then closes)

---

## Bid notification (toast)

Component: `components/bid-notification.tsx`

Props:
- `message`
- `type: 'success' | 'error'`
- `onClose()`
- `isDark`

### Behavior + click targets

- **Auto-close timer**
  - Effect: `useEffect` sets timer: after 5s
    - sets internal `isVisible=false`
    - then calls `onClose()` after 300ms

- **Close (X)**
  - Handler: on click
    - sets `isVisible=false`
    - calls `onClose()` after 300ms

### Parent wiring (where it goes)

In `app/page.tsx`:
- Rendered when `notification` is set:
  - `<BidNotification ... onClose={() => setNotification(null)} />`

---

## Manual test checklist

- Wallet modal:
  - Open via Connect button → X closes.
  - MetaMask flow: if `window.ethereum` present, prompts; otherwise uses demo random wallet.
  - Demo Admin connect sets admin wallet.

- Reminder modal:
  - Open from upcoming card and from calendar event.
  - Change radio option updates internal selection.
  - Set Reminder:
    - permission prompt shows (first time)
    - localStorage `auctionReminders` appended
    - modal closes on success

- Max Pain modal:
  - Quick options populate input; disabled options don’t.
  - Invalid amount shows validation error and doesn’t call `onConfirm`.
  - Valid confirm calls `onConfirm` and closes via parent.

- Bid notification:
  - Appears when `notification` is set.
  - Auto-dismisses after ~5s.
  - X dismisses immediately with fade.
