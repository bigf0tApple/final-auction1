# 02 — Component connections strategy

Goal: map a component’s interconnections (props/context/hooks/storage/effects) so you can audit correctness and prevent regressions.

## Procedure

1) Classify the component

- Pure/presentational
- Stateful UI
- Domain
- Infrastructure

2) Build a connection map

- Imports:
  - UI primitives: `components/ui/*`
  - Hooks: `hooks/*`
  - Lib: `lib/*`
  - Services: `services/*`
- State:
  - `useState`, derived booleans
- Context:
  - which context, which fields/actions
- Storage:
  - localStorage keys read/write
- Effects:
  - timers, subscriptions, DOM mutations

3) Identify sources of truth

For any concept (auction status, countdown time, pinned state, display name), record the authoritative source and how it propagates.

4) State transition table

Write 4–8 key transitions:

- (state before) + (event) → (state after)

5) Call-site audit

- Find all usages of the component.
- Confirm props are passed consistently.
- Confirm callbacks are named correctly (`onCancel` vs `onClose`).

## Template (copy/paste)

- Component: `...`
- Classification:
- Imports:
- Props:
- Context usage:
- Local state:
- Storage:
- Effects:
- DOM side effects:
- Downstream components:
- Upstream callers:
- Invariants:
- Edge cases:

## Common failure patterns

- Stale closures inside intervals (uses old state/context values).
- Effects that don’t clean up timers/listeners.
- Multiple sources of truth (e.g., pinned state read from localStorage in one place and body classes in another).
- Hydration mismatch from rendering `Date.now()`/`new Date()` in server output.
