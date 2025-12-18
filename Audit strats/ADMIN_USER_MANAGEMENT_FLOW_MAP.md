# Admin User Management — Flow map

This map documents the Admin Panel’s **User Management** surface and the adjacent **User Moderation History** table (which is currently rendered under the Chat Management tab).

---

## Primary file

- `app/admin-panel.tsx`

---

## Data model (current implementation)

### Mock users

- `mockUsers` is a hardcoded array of 3 user records:
  - `address`, `totalBids`, `auctionsWon`, `totalSpent`, `joinDate`, `lastActive`, `status`, `reputation`

### Mock moderation history

- `moderationHistory` is a hardcoded array of moderation records:
  - `id`, `userAddress`, `action`, `reason`, `date`, `status`

No backend calls, no persistence, and no cross-link to real wallet/auction state.

---

## State model

### Local React state

- `activeTab: "analytics" | "users" | "chat" | "mint"`
  - Controls which tab section is rendered

- `searchTerm: string`
  - Used to filter users by wallet address substring

### Derived data

- `filteredUsers`
  - `mockUsers.filter(user => user.address.toLowerCase().includes(searchTerm.toLowerCase()))`

---

## Flow A — Search/filter users

### UI action

- In **User Management** tab:
  - Type into `Search wallet addresses...`

### Handler

- `onChange={(e) => setSearchTerm(e.target.value)}`

### Outcome

- Recomputes `filteredUsers`
- User cards list updates

### Side effects

- None (state-only)

---

## Flow B — Blacklist / Unblock from user card

### UI action

- Click the right-side button on a user card:
  - Label depends on `user.status`:
    - `active` → “Blacklist”
    - otherwise → “Unblock”

### Handler

- `onClick={() => toggleUserStatus(user.address)}`

### Current implementation behavior

- `toggleUserStatus(address)` is a stub:
  - Contains a TODO comment
  - Does not update any state
  - Uses `void address` to avoid lint warnings

### Outcome

- No UI/state change occurs (mock-only)

### Side effects

- None

---

## Flow C — User Moderation History: Unblacklist action

### UI location

- Rendered under the **Chat Management** tab as:
  - “User Moderation History” table

### UI action

- If a row has `record.status === "blacklisted"`, an **Unblacklist** button is shown.
- Click **Unblacklist**.

### Handler

- `onClick={() => unblacklistUser(record.userAddress)}`

### Guard / confirmation

- `confirm(`Unblacklist user ${userAddress}?`)`

### Outcome

- On confirm:
  - `alert(`User ${userAddress} has been unblacklisted`)`

### Notes

- This does not mutate `moderationHistory` or `mockUsers`.
- It does not update any persisted store.

---

## UI rendering details (audit notes)

- Status badge in user cards:
  - `active` renders a light badge
  - non-active uses a dark badge

- User card button styling changes with `status`, but click currently does nothing.

- The moderation table shows action type as a colored badge:
  - `warned` → yellow
  - `restricted` → red
  - otherwise → gray

---

## Audit checklist

- Search filtering:
  - Case-insensitive
  - Filters on address only (not username, status, etc.)

- Blacklist/Unblock:
  - Confirm whether the lack of behavior is intended (stub) or a missing implementation

- Moderation Unblacklist:
  - Confirmation prompt appears
  - Alert shows on confirm
  - No state update occurs (expected with mock data)
