# 03 — Feature flow strategy (end-to-end)

Goal: audit a feature from UI entry → state changes → side effects → persistence → UI outcomes.

## Use when

- You need to understand “how the system works” for a page.
- You suspect a regression but don’t know where it originates.

## Procedure

1) Define the feature boundary

- Entry points (pages/components)
- Primary user actions (buttons)
- Outputs (what changes on screen)

2) Identify data sources

- Static data (`lib/*`)
- Context state (`components/*context*`, `hooks/*state*`)
- localStorage/sessionStorage
- External services (`services/*`)

3) Map critical actions

For each action (click/submit):

- handler → state mutations → side effects → UI updates

4) Validate invariants

- Time gating (final 10 seconds)
- Auction schedule correctness (active/next/upcoming)
- Chat lifecycle (clear for users, admin retains)
- Pinned UI doesn’t shift header

5) Regression checklist

- Refresh page mid-auction
- Open/close chat
- Pin left/right
- Trigger modals
- Attempt invalid actions (disabled buttons)

## Deliverable

Write a one-page flow note:

- “What calls what”
- “Where state lives”
- “What localStorage keys exist”
- “What must never change”
