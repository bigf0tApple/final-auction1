# Admin mint + auction creation flow map

This map documents how the Admin Panel “mint + schedule auction” flow behaves today.

Scope:

- Mint form state, validation, and conflict detection
- Duration handling (quick vs custom)
- Confirmation and “mint” action
- Persistence status (mock vs real)

## Location + state

Location: `app/admin-panel.tsx`

State:

- `mintForm` fields:
  - `title`, `description`, `artistName`
  - `startingPrice`, `royaltyPercent`
  - `auctionDate`, `auctionTime`
  - `duration` (quick preset string like `"24h"`)
  - `durationMode`: `"quick" | "custom"`
  - `customDuration`: `{ days, hours, minutes }` (strings)
  - `uploadedImage`, `teaserImage` (`File | null`)
- `showMintConfirmation` (boolean)

Existing schedule data source:

- Imports `upcomingAuctions` from `lib/auction-data` and uses it only for conflict detection.

## File upload guards

Functions:

- `handleImageUpload(e)`
- `handleTeaserImageUpload(e)`

Rules:

- Requires a selected file
- Rejects files over 10MB
- Stores the file in `mintForm.uploadedImage` / `mintForm.teaserImage`

Side effects:

- Uses `alert(...)` for errors; no persistence.

## Submit path: `handleMintSubmit()`

Location: `app/admin-panel.tsx`

### Step 1: Required-field validation

If any are missing, aborts with:

- `alert("Please fill in all fields and upload both the main NFT image and teaser image")`

Required:

- Text fields: `title`, `description`, `artistName`, `startingPrice`, `royaltyPercent`, `auctionDate`, `auctionTime`
- File fields: `uploadedImage`, `teaserImage`

### Step 2: Start time must be in the future

- Computes `auctionDateTime = new Date(`${auctionDate}T${auctionTime}`)`
- If `auctionDateTime <= now` → `alert("Auction start time must be in the future")` and abort.

### Step 3: Proposed end time calculation

- `proposedStart = auctionDateTime`
- `proposedEnd` starts as `new Date(proposedStart)`

If `durationMode === "quick"`:

- Parses hours via `parseInt(mintForm.duration.replace('h',''))`
- Adds that many hours to `proposedEnd`

If `durationMode === "custom"`:

- Parses total minutes:
  - `(days * 24 * 60) + (hours * 60) + minutes`
- Adds minutes to `proposedEnd`

### Step 4: Conflict detection (overlap)

- Filters `upcomingAuctions` for any overlap between `[proposedStart, proposedEnd]` and each existing auction `[startTime, endTime]`.
- Overlap checks include:
  - Proposed start inside an existing auction
  - Proposed end inside an existing auction
  - Proposed window fully covering an existing auction

If conflicts exist:

- Builds a human-readable list of the conflicting auctions (title + start/end times)
- Shows:
  - `alert("⚠️ Auction time conflict detected! ...")`
- Aborts.

Important nuance:

- This conflict logic does **not** incorporate the app’s 10-minute buffer rule used in `resolveAuctionSchedule()`.

### Step 5: Custom duration validation (only)

If `durationMode === "custom"`:

- Recomputes total minutes
- Rejects:
  - `< 1 minute`
  - `> 3 days`

Failure results in `alert(...)` and abort.

### Step 6: Confirmation step

- If all checks pass: `setShowMintConfirmation(true)`

## Confirm path: `confirmMint()`

Location: `app/admin-panel.tsx`

Behavior:

- Recomputes `startDateTime` and `endDateTime` using the same quick/custom rules.
- Shows a success alert:
  - `alert(`NFT minted successfully! "${title}" scheduled for ${startDateTime.toLocaleString()}`)`
- Sets `showMintConfirmation` false
- Resets `mintForm` to initial empty values

Persistence status:

- Comment indicates: “In real app, this would add to database and sync with upcomingAuctions”.
- No writes are made to `upcomingAuctions`, no API call, no database call.

## Audit checklist

- Confirm whether the 10-minute buffer requirement should be enforced at mint time.
- Confirm the intended source of truth for auctions (static `upcomingAuctions` vs backend).
- Validate time parsing:
  - `new Date(`${date}T${time}`)` is locale/timezone-sensitive.
  - `parseInt(duration.replace('h',''))` assumes well-formed strings like `"24h"`.
- Validate file constraints:
  - Only size is checked; file type is not validated.
- Confirm UX expectations:
  - Current flow uses `alert(...)` for errors/success.
