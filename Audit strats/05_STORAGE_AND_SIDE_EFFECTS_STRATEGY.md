# 05 — Storage and side effects strategy

Goal: audit anything that persists or mutates global browser state.

## Scope

- `localStorage` / `sessionStorage`
- `document.body.classList` / `document.documentElement.classList`
- timers (`setInterval`, `setTimeout`)
- event listeners (`addEventListener`)

## Procedure

1) Inventory all keys / global mutations

- Search for `localStorage.`
- Search for `document.body.classList` and `document.documentElement.classList`
- Search for `setInterval(` and `setTimeout(`

2) For each storage key

- Key name:
- Written by:
- Read by:
- Default when missing:
- Expiration/lock behavior:
- Manual test:
  - clear storage
  - set value
  - refresh

3) For each DOM mutation

- What class/attr is toggled?
- Who toggles it?
- Who reads it (hooks/components/styles)?
- Cleanup behavior:

4) For each timer/listener

- Created where?
- Cleanup where?
- Dependencies (stale closures)?

## Common failure patterns

- Storage read in render path without guarding `window`.
- Keys renamed in one file but not others.
- Body class toggled but no hook subscribes to changes.
- Timer runs after unmount and throws.
