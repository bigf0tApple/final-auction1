# WALLET CONNECT MODAL (COMPONENT) FLOW MAP

Scope:
- Wallet connect modal UI: `components/wallet-connect-modal.tsx` (`WalletConnectModal`)

Mounted from:
- `app/page.tsx` (conditional render when `showWalletModal` is true)

Related docs:
- Existing feature/system map (entrypoints + behavior): `WALLET_CONNECT_MODAL_FLOW_MAP.md`
- Wallet + identity integration: `WALLET_CONNECT_AND_IDENTITY_FLOW_MAP.md`
- Navigation/launch wiring: `NAVIGATION_AND_MODAL_LAUNCH_FLOW_MAP.md`

---

## Purpose

- Provide a modal overlay allowing the user to connect a wallet.
- Supports:
  - MetaMask (real EIP-1193 provider when present)
  - WalletConnect (demo-simulated)
  - “Demo: Connect as Admin” shortcut

---

## Public API

Component: default export `WalletConnectModal(props)`

Props:
- `onConnect: (address: string) => void`
- `onCancel: () => void`
- `isDark: boolean`

Caller responsibilities:
- Owning open/close state (`showWalletModal`).
- Persisting connected wallet state (handled in `app/page.tsx` via `handleWalletConnect`).

---

## Internal state

- `isConnecting: boolean` (default `false`)
  - Used to disable MetaMask + WalletConnect buttons and swap labels to “Connecting...”.

---

## Layout

Overlay:
- `fixed inset-0 bg-black bg-opacity-50 ... z-50 p-4`

Panel:
- `max-w-md` centered card
- Theme classes select `bg-[#000000] border-white` vs `bg-white border-black`.

Close:
- Header X button calls `onCancel()`.

Footer:
- Static text: “By connecting, you agree to our Terms of Service” (no link).

---

## Connection paths

### A) MetaMask button (`connectMetaMask`)

Flow:
1) `setIsConnecting(true)`
2) If `window.ethereum` exists:
   - Calls: `window.ethereum.request({ method: "eth_requestAccounts" })`
   - If `accounts.length > 0` → `onConnect(accounts[0])`
3) Else (demo fallback):
   - Picks random address from hard-coded `mockWallets`.
   - After 1000ms timeout → `onConnect(randomWallet)`.
4) `catch`:
   - Logs error in non-production.
5) `finally`:
   - `setIsConnecting(false)`

Notes:
- If provider exists but returns an empty list, no error is shown; modal remains open.

### B) WalletConnect button (`connectWalletConnect`) — demo-only

Flow:
1) `setIsConnecting(true)`
2) After 1500ms timeout:
   - `mockAddress = "0x" + Math.random().toString(16).substr(2, 40)`
   - `onConnect(mockAddress)`
   - `setIsConnecting(false)`

Notes:
- Not a real WalletConnect integration.
- Uses `substr` (legacy) and randomness; address may be malformed/short if the random hex is short.

### C) Demo: Connect as Admin

Flow:
- Inline `onClick={() => onConnect(<adminAddress>)}`

Notes:
- Does not check or respect `isConnecting`.

---

## Side effects

- External provider request (if present): `window.ethereum.request({ method: "eth_requestAccounts" })`.
- Uses `setTimeout` in demo fallbacks.
- Logs errors to console in non-production.

---

## Wiring in `app/page.tsx` (high level)

- `showWalletModal` gates rendering.
- `onCancel` closes: `setShowWalletModal(false)`.
- `onConnect={handleWalletConnect}` (caller sets connected wallet state + closes modal).

---

## Audit checklist

- Confirm demo fallbacks are acceptable for production builds:
  - random wallet generation
  - admin address present in the MetaMask fallback list
  - admin shortcut bypasses `isConnecting`
- Consider surfacing user-visible errors on connection failures.
- If WalletConnect is required, replace the demo flow with a real integration.
