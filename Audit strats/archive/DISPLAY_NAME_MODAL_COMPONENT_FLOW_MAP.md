# DISPLAY NAME MODAL (COMPONENT) FLOW MAP

Scope:
- Display name selection overlay: `components/display-name-modal.tsx` (`DisplayNameModal`)

Mounted from:
- `components/chat-button.tsx` (renders `DisplayNameModal` when `showDisplayNameModal` is true)

Related docs:
- System-level identity gating: `DISPLAY_NAME_AND_IDENTITY_FLOW_MAP.md`
- Chat entrypoint component: `CHAT_BUTTON_COMPONENT_FLOW_MAP.md`
- Wallet context docs: `WALLET_CONNECT_AND_IDENTITY_FLOW_MAP.md`

---

## Purpose

- Let a connected wallet choose a display name representation.
- Optionally discover ENS names (reverse lookup + subgraph query).
- Enforce a 24-hour “change lock” via Save button disabling.

---

## Public API

Component: default export `DisplayNameModal(props)`

Props:
- `connectedWallet: string`
- `onSave: (name: string) => void`
- `onCancel: () => void`
- `isDark: boolean`
- `currentName?: string`
- `lockedUntil?: number`

Caller responsibilities:
- Persisting the chosen name + lock window is handled by `ChatButton` (`localStorage`).

---

## Internal state

Selection:
- `selectedOption: "prefix" | "suffix" | "ens"` (default `"prefix"`)

ENS discovery state:
- `ensNames: string[]` (default `[]`)
- `ensLoading: boolean` (default `false`)
- `selectedEnsName: string` (default `""`)

Derived:
- `isLocked` (`useMemo([lockedUntil])`): `lockedUntil ? Date.now() < lockedUntil : false`
- `displayNamePreview` (`useMemo([connectedWallet, selectedEnsName, selectedOption])`)

---

## Display name preview logic

`displayNamePreview`:
- `prefix` → `${wallet.slice(0, 6)}...`
- `suffix` → `...${wallet.slice(-4)}`
- `ens` → `selectedEnsName` else fallback to prefix

---

## ENS discovery flow (side effects)

Trigger:
- `useEffect([connectedWallet])`

Cancellation:
- Uses `cancelled` boolean flag to avoid setting state after unmount.

Step A — reverse lookup via injected provider:
- Reads `(window as { ethereum?: ExternalProvider }).ethereum`
- If present:
  - `new ethers.providers.Web3Provider(ethereum)`
  - `provider.lookupAddress(connectedWallet)`
  - Adds `reverse` result to `names` set (if truthy)
- Errors are swallowed.

Step B — ENS subgraph query:
- `fetch("https://api.thegraph.com/subgraphs/name/ensdomains/ens", { method: "POST", ... })`
- GraphQL query requests `domains(first: 10, where: { owner: $owner }, ...) { name }`
- Variables: `{ owner: connectedWallet.toLowerCase() }`
- If response ok:
  - Collects domain names
  - Filters to `*.eth`
  - Adds to `names` set
- Errors are swallowed.

Finalize:
- `ensNames = Array.from(names)`
- `selectedEnsName = ensNames[0] ?? ""`
- `ensLoading = false`

---

## Save behavior + lock enforcement

Save handler:
- `handleSave()` calls `onSave(displayNamePreview)`.

Save button disabled condition:
- `disabled={Boolean(currentName) && isLocked && displayNamePreview !== currentName}`

Implication:
- Lock is enforced at the UI layer only; callers could still call `onSave(...)`.

---

## Rendering

Overlay:
- `fixed inset-0 bg-black bg-opacity-50 ... z-50`

Options:
- Radio buttons for prefix/suffix.
- ENS option appears only when `ensLoading` is true OR `ensNames.length > 0`.
- If `selectedOption === "ens"` and multiple ENS names:
  - renders a `<select>` to choose `selectedEnsName`.

---

## Side effects

- Network:
  - ENS reverse lookup via injected provider (if present)
  - POST to The Graph ENS subgraph

---

## Audit checklist

- Confirm the app should depend on The Graph endpoint availability for ENS discovery.
- Confirm wallet-provider assumptions:
  - `window.ethereum` presence
  - user permissions / chain context
- Consider adding user-visible error states (currently all ENS failures are silent).
- Confirm lock semantics: UI-only disabling vs stronger enforcement.
- Confirm `*.eth` filtering is sufficient for product needs.
