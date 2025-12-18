# WalletConnectModal — flow map

Scope

- `components/wallet-connect-modal.tsx`
- Mount + state owner: `app/page.tsx`

Purpose

- Present a modal that lets the user connect a wallet.
- Support:
  - MetaMask connection (real provider when available)
  - WalletConnect (demo-simulated)
  - Demo “connect as admin” shortcut

---

## 1) Entrypoint: open/close wiring

File: `app/page.tsx`

State owner
- `showWalletModal: boolean`

Open
- `connectWallet()` sets `showWalletModal = true`.

Render
- When `showWalletModal` is true:
  - Renders `<WalletConnectModal onConnect={handleWalletConnect} onCancel={() => setShowWalletModal(false)} isDark={isDark} />`.

Close
- Clicking modal **X** calls `onCancel()` → `setShowWalletModal(false)`.
- Successful connect calls `onConnect(address)` → `handleWalletConnect(address)` which closes the modal.

---

## 2) Modal internal state

File: `components/wallet-connect-modal.tsx`

- Local state:
  - `isConnecting: boolean` (disables buttons and swaps labels to “Connecting...”)

---

## 3) Connection paths

### A) MetaMask button

UI
- Button label: `MetaMask` (or `Connecting...`)
- Disabled when `isConnecting`.

Handler
- `connectMetaMask()`

Flow
1) `setIsConnecting(true)`
2) If `window.ethereum` exists:
   - Calls: `window.ethereum.request({ method: 'eth_requestAccounts' })`
   - If `accounts.length > 0`: calls `onConnect(accounts[0])`
3) Else (demo fallback):
   - Chooses a random address from `mockWallets` (includes the admin address)
   - `setTimeout(() => onConnect(randomWallet), 1000)`
4) Errors:
   - Caught and logged in non-production only.
5) Finally:
   - `setIsConnecting(false)`

Notable behavior
- If `window.ethereum` exists but returns an empty account list, the modal stays open and `isConnecting` is reset.

### B) WalletConnect button (demo-simulated)

UI
- Button label: `WalletConnect` (or `Connecting...`)
- Disabled when `isConnecting`.

Handler
- `connectWalletConnect()`

Flow
1) `setIsConnecting(true)`
2) `setTimeout` after 1500ms:
   - Generates `mockAddress = '0x' + Math.random().toString(16).substr(2, 40)`
   - Calls `onConnect(mockAddress)`
   - Sets `setIsConnecting(false)`

Notes
- This is not a real WalletConnect integration; it’s a UI-level simulation.

### C) Demo: Connect as Admin button

UI
- Always enabled (does not check `isConnecting`).

Handler
- Inline: `onClick={() => onConnect('0xF1Ed4C4cE65B6353B71f2304b3fD7641a436675F')}`

Outcome
- Immediately connects as the hard-coded admin address.

---

## 4) UI/UX details

- Modal overlay: `fixed inset-0 bg-black bg-opacity-50 ... z-50`.
- Panel: max width `max-w-md`.
- Footer text:
  - “By connecting, you agree to our Terms of Service” (informational only; no link).

---

## Audit notes / risk areas

- Demo fallbacks can connect “admin” via random selection (MetaMask fallback list includes admin address).
- The admin shortcut bypasses `isConnecting` gating.
- WalletConnect uses `substr` (legacy) and produces potentially short hex strings depending on randomness; it’s demo-only.
- No explicit user-facing error message on connection failure (errors only logged in dev).

## Quick verification checklist

- Open/close:
  - Open via header “Connect” button; close via X.
- MetaMask present:
  - Approve request → `connectedWallet` set and modal closes.
- No MetaMask:
  - Clicking MetaMask connects a random demo wallet after ~1s.
- WalletConnect:
  - Clicking WalletConnect connects a demo address after ~1.5s.
- Admin demo:
  - Clicking “Demo: Connect as Admin” results in admin-only UI appearing (e.g., Settings/Admin panel entry).
