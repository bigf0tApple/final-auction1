# Wallet connect + identity flow map

This map documents how users connect/disconnect wallets, how “admin” is determined, and how chat display names are persisted and rate-limited.

## Runtime safety: `EthereumFix`

Location: `components/ethereum-fix.tsx`

Purpose:

- Prevents runtime crashes like `Cannot redefine property: ethereum` caused by extensions/scripts attempting to redefine `window.ethereum`.

Mechanism:

- On mount, monkey-patches `Object.defineProperty`.
- If `target === window` and `property === "ethereum"` and `window` already has own `ethereum`, it ignores the redefine attempt.
- Restores the original `Object.defineProperty` on unmount.

Installed in:

- `app/page.tsx` (`AuctionSite` renders `<EthereumFix />` once).

Audit note:

- This is a global runtime patch; if any other code relies on redefining properties on `window`, verify it still behaves.

## Wallet connection UX

Primary state:

- `connectedWallet: string` in `app/page.tsx`.

### Connect button → open modal

Location: `app/page.tsx`

- `connectWallet()` sets `showWalletModal = true`.
- Connect buttons appear in both mobile and desktop headers and in the “Connect Wallet to Bid” button.

### `WalletConnectModal` actions

Location: `components/wallet-connect-modal.tsx`

Buttons:

- **X**
  - Calls `onCancel()`.

- **MetaMask**
  - If `window.ethereum` exists:
    - Calls `window.ethereum.request({ method: "eth_requestAccounts" })`
    - If accounts exist: `onConnect(accounts[0])`
  - Else (demo fallback): selects a random mock address and connects after 1s.

- **WalletConnect**
  - Demo-simulates a connection after 1.5s.

- **Demo: Connect as Admin**
  - Calls `onConnect("0xF1Ed4C4cE65B6353B71f2304b3fD7641a436675F")`.

### Modal → application state

Location: `app/page.tsx`

- `handleWalletConnect(address)`:
  - `setConnectedWallet(address)`
  - `setShowWalletModal(false)`
  - Does **not** persist connection to storage (no auto-reconnect).

## Wallet disconnection UX

Location: `app/page.tsx`

- Clicking the “×” disconnect button calls `disconnectWallet()`:
  - `setConnectedWallet("")`
  - Attempts to `localStorage.removeItem("connectedWallet")`

Audit note:

- The app intentionally avoids storing wallet connection; the `connectedWallet` localStorage key appears to be legacy cleanup only.

## Admin gating

Location: `app/page.tsx`

- `isAdmin = connectedWallet === "0xF1Ed4C4cE65B6353B71f2304b3fD7641a436675F"`

Implications:

- Admin UI entry:
  - Desktop: a Settings button appears if `isAdmin`.
  - Mobile: `MobileMenu` receives `isAdmin` and an admin click handler.
- Admin behavior differences elsewhere:
  - Chat preserves per-auction history for admins and does not clear on auction end.

Audit note:

- Admin is hard-coded by address (no signature/role verification).

## Chat identity: display name flow

### Entry: Chat button requires a wallet

Location: `components/chat-button.tsx`

- Clicking the floating chat button:
  - If no wallet: shows `alert("Please connect your wallet to access chat")`.
  - If wallet but no display name: opens `DisplayNameModal`.
  - Else: opens `AuctionChat`.

### Persistence keys

Location: `components/chat-button.tsx`

- `localStorage["displayName_${wallet}"]` → string
- `localStorage["displayNameLockedUntil_${wallet}"]` → epoch ms as string

Load behavior:

- On `connectedWallet` change:
  - Loads both keys.
  - If no saved display name: resets `displayName` to `""`.

Save behavior:

- On save:
  - Stores the chosen name into `displayName_${wallet}`
  - Sets a lock for 24h:
    - `lockedUntil = Date.now() + 24h`
    - Stores into `displayNameLockedUntil_${wallet}`

### DisplayNameModal selection logic

Location: `components/display-name-modal.tsx`

Choices:

- Address prefix (e.g. `0x1234…`)
- Address suffix (e.g. `…abcd`)
- ENS name (if found)

ENS discovery:

- Tries reverse lookup using `ethers.providers.Web3Provider(window.ethereum).lookupAddress(connectedWallet)`.
- Also queries ENS Subgraph (`ensdomains/ens`) for up to 10 domains owned by the wallet.

Lock behavior:

- `isLocked = Date.now() < lockedUntil`.
- If locked and `currentName` exists:
  - Shows a lock message (“Display name changes are locked for 24 hours.”)
  - Disables Save when attempting to change away from the current name.

Audit note:

- The Save button is still enabled when locked if the preview equals `currentName`.

## Audit checklist

- Connect/disconnect:
  - Confirm connecting sets `connectedWallet` and closes the modal.
  - Confirm refreshing does not auto-connect.
  - Confirm disconnect clears `connectedWallet` and does not break chat.

- Admin gating:
  - Connect as admin address and verify Admin Panel entry is available.
  - Connect as non-admin and verify it’s hidden.

- Display name:
  - Verify per-wallet storage keys are written.
  - Verify 24h lock prevents changing the name.
  - Verify ENS lookup fails gracefully without crashing when `window.ethereum` is missing.

- EthereumFix:
  - Verify no runtime errors related to `window.ethereum` property redefinition.
