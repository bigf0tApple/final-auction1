# Admin Blocked Words Management — Flow map

This map documents how “Blocked Words” are loaded, edited, and persisted, and how that same list is consumed by the Auction Chat.

---

## Primary files

- `app/admin-panel.tsx`
  - **Chat Management** tab → **Blocked Words Management** card
  - Owns the editable list UI and writes to `localStorage`

- `components/auction-chat.tsx`
  - Loads blocked words from `localStorage` into chat runtime state
  - Uses the list for message moderation behavior (see notes)

---

## Storage contract

### Key

- `localStorage["blockedWords"]`

### Value format

- JSON-encoded array of lowercase strings
  - Example: `["spam","scam","hack","private key","phishing"]`

### Producers / consumers

- Producer: `app/admin-panel.tsx` (writes on add/remove)
- Consumer: `components/auction-chat.tsx` (reads on mount)

---

## State model

### Admin Panel (local React state)

- `newBlockedWord: string`
  - Controlled input for adding a new word

- `blockedWords: string[]`
  - Rendered as a set of badges
  - Mutated by add/remove handlers

### Auction Chat (local React state)

- `blockedWords: string[]`
  - Initialized from `localStorage` on mount

---

## Flow A — Initial load (Admin Panel)

### Trigger

- `useEffect(..., [])` after the component mounts

### Guard

- `if (typeof window !== "undefined")`

### Load path

- `localStorage.getItem("blockedWords")`
  - If present:
    - `setBlockedWords(JSON.parse(storedWords))`
  - Else:
    - `setBlockedWords(["spam", "scam", "hack", "private key", "phishing"])`

### Error handling

- JSON parse / storage access failures are caught
  - In non-production: `console.warn('Failed to load blocked words:', error)`
  - Falls back to the same default list

### Side effects

- Reads from `localStorage`

---

## Flow B — Add blocked word

### UI action

- Type in “Add new blocked word…” input
- Click **Add Word**

### Handler

- `addBlockedWord()`

### Guards / validation

- `const word = newBlockedWord.trim().toLowerCase()`
- If `word` is non-empty AND not already present:
  - Accept
- Else if already present:
  - `alert('"word" is already in the blocked words list.')`
- Else (empty):
  - `alert('Please enter a valid word to block.')`

### Mutation + persistence

- `updatedWords = [...blockedWords, word]`
- `setBlockedWords(updatedWords)`
- `localStorage.setItem("blockedWords", JSON.stringify(updatedWords))`
- `setNewBlockedWord("")`

### Side effects

- Writes to `localStorage`
- Shows an alert confirmation:
  - `Added "word" to blocked words list...`

---

## Flow C — Remove blocked word

### UI action

- Click the “×” button on a blocked-word badge

### Handler

- `removeBlockedWord(word)`

### Guard / confirmation

- `confirm('Remove "word" from blocked words list?...')`

### Mutation + persistence

- `updatedWords = blockedWords.filter(w => w !== word)`
- `setBlockedWords(updatedWords)`
- `localStorage.setItem("blockedWords", JSON.stringify(updatedWords))`

### Side effects

- Writes to `localStorage`
- Shows an alert confirmation:
  - `Removed "word" from blocked words list.`

---

## Flow D — Initial load (Auction Chat)

### Trigger

- `useEffect(..., [])` inside `components/auction-chat.tsx`

### Guard

- `if (typeof window !== "undefined")`

### Load path

- `localStorage.getItem("blockedWords")`
  - If present:
    - `setBlockedWords(JSON.parse(savedBlockedWords))`
  - If absent:
    - No default is set here (chat keeps its initial state)

### Error handling

- Storage/parse errors are caught
  - In non-production: `console.warn('Failed to load blocked words:', error)`

### Side effects

- Reads from `localStorage`

---

## Important behavior notes (cross-surface)

- Admin Panel updates `localStorage`, but `AuctionChat` only reads the key once on mount.
  - If an admin changes blocked words while a chat is already open, the chat UI will not automatically refresh its list unless it remounts (or has additional wiring elsewhere).

---

## Audit checklist

- Admin Panel load:
  - With empty storage, defaults populate correctly
  - With valid JSON array, list populates correctly
  - With invalid JSON, defaults populate and warning appears in dev

- Add Word:
  - Trimming + lowercasing works
  - Duplicate detection blocks duplicates
  - Storage writes correct JSON

- Remove Word:
  - Confirmation appears
  - Storage updates correctly

- Auction Chat:
  - On fresh mount, chat reads updated `blockedWords` key
  - Invalid JSON does not crash the chat
