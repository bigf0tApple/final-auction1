# Content moderation (blocked words) flow map

This map documents how blocked words are managed by admins and enforced in chat, including warnings and temporary chat restrictions.

## Source of truth: `localStorage["blockedWords"]`

Key:

- `localStorage["blockedWords"]`: JSON string of `string[]`

Readers:

- `app/admin-panel.tsx` (loads into Admin UI)
- `components/auction-chat.tsx` (loads into chat filtering)

Writers:

- `app/admin-panel.tsx` (add/remove words)

## Admin panel: manage blocked words

Location: `app/admin-panel.tsx`

### Initialization

- On mount:
  - Attempts `localStorage.getItem("blockedWords")`
  - If present:
    - `setBlockedWords(JSON.parse(storedWords))`
  - Else (or on parse error):
    - defaults to `["spam", "scam", "hack", "private key", "phishing"]`

### Add flow

Function: `addBlockedWord()`

- Normalizes input:
  - `word = newBlockedWord.trim().toLowerCase()`
- If non-empty and not already present:
  - `updatedWords = [...blockedWords, word]`
  - `setBlockedWords(updatedWords)`
  - `localStorage.setItem("blockedWords", JSON.stringify(updatedWords))`
  - clears input
  - shows an `alert()` confirmation
- Else:
  - shows an `alert()` error (already present / invalid)

### Remove flow

Function: `removeBlockedWord(word)`

- Asks `confirm()`
- If confirmed:
  - `updatedWords = blockedWords.filter(w => w !== word)`
  - `setBlockedWords(updatedWords)`
  - `localStorage.setItem("blockedWords", JSON.stringify(updatedWords))`
  - shows an `alert()` confirmation

Audit note:

- Admin panel writes immediately to `localStorage`; there is no server persistence.

## Chat: enforcement & user penalties

Location: `components/auction-chat.tsx`

### Initialization

- Chat has a built-in default list (includes profanity words like `"fuck"`, `"shit"`, `"damn"`).
- On mount, it attempts to load `localStorage["blockedWords"]` and replaces the in-memory list with the stored list.

Important nuance:

- If `localStorage["blockedWords"]` exists, it overrides the built-in defaults.
- This means admin-provided list determines whether profanity is blocked.

### Filter logic

Function: `filterMessage(message)`

- Lowercases the message.
- Checks substring matches against each entry in `blockedWords`:
  - If match found → `{ allowed: false, blockedWord: word }`
- Additional hard rules:
  - If `message.length > 42` → blocked
  - If message contains `"http"` → blocked
- Otherwise → `{ allowed: true }`

### Message send guards

Function: `handleSendMessage()`

1. If message empty or `isRestricted` → returns.
2. If wallet not connected → adds a system message and returns.
3. If `checkRateLimit()` fails → adds a system message and returns.
4. If `filterMessage()` blocks:
   - increments `userWarnings[connectedWallet]`
   - adds a "Warning" message with `Warning X/3`
   - restriction rules:
     - 2nd warning → restrict for 10s
     - 3rd+ warning → restrict for 20s and adds a system restriction message
   - clears input and returns
5. If allowed → appends message as normal.

### Chat rate limiting (message spam)

Function: `checkRateLimit()`

- If user sends messages within 1 second repeatedly:
  - increments `messageCount`
  - if `messageCount >= 4`:
    - sets `isRestricted=true`
    - sets `restrictionTime=10`
    - returns `false`
- Otherwise resets `messageCount`.

Restriction countdown:

- A `useEffect` decrements `restrictionTime` every 1s.
- When it reaches 0, clears `isRestricted`.

## Operational edge cases / risks

- **Override mismatch**: Admin defaults list excludes profanity; chat defaults include profanity. If admin has ever stored `blockedWords`, profanity may stop being blocked unless the admin adds those words.
- **Substring matching**: blocking `"ass"` would block many legitimate words; choose blocked words carefully.
- **Per-session warnings**: `userWarnings` is in-memory only; a refresh clears warnings.
- **No shared/global enforcement**: another tab/window won’t update its in-memory `blockedWords` until chat is remounted.

## Audit checklist

- Admin editing:
  - Add a word → verify `localStorage["blockedWords"]` updates.
  - Remove a word → verify it disappears from storage.

- Chat enforcement:
  - Send a message containing a blocked substring → verify warning message and warning count increments.
  - Trigger 2 warnings → verify 10s restriction.
  - Trigger 3 warnings → verify 20s restriction + restriction system message.
  - Spam messages quickly → verify 10s restriction via rate limit.

- Consistency:
  - Verify which list is currently active:
    - if `localStorage["blockedWords"]` exists, it overrides the chat default list.
