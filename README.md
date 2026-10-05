# Typed Event Store with Aggregation & Snapshot

**Difficulty:** Medium

## Scenario

You're building the core of an event-sourced order management system. Raw domain events are appended to an immutable log, a typed reducer folds them into the current aggregate state, and periodic snapshots are captured — all with the compiler enforcing correct event shapes, state transitions, and snapshot validity.

## How to solve

1. Open `challenge.ts`
2. Implement the types and functions marked with `TODO`
3. Verify your solution using one of the methods below

### In CodeSandbox (recommended)

1. Click the **Open Devtool** icon in the top-right corner (or press `Ctrl + \``)
2. In the Devtools panel, click **Type Check + Run Tests** to validate your solution
3. For `console.log` output and assertion results, open your **browser DevTools** (`F12` > Console tab)

### Locally

```bash
npm install
npm test    # runs tsc --noEmit && tsx challenge.test.ts
```

## Evaluation Checklist

| Skill Exercised | Where in Code |
|---|---|
| Discriminated union (4 variants, no shared optional fields) | `OrderEvent` type |
| Exhaustive `switch` narrowing (no `default` escape) | `applyEvent` — each `event.kind` branch |
| Branded / nominal type | `Snapshot<S>` wrapping state + metadata |
| Generic type alias | `Reducer<S, E>` parameter in `replayFrom` |
| `Map` usage with typed values | `OrderState.items` — upsert, remove, iterate |
| Single-pass aggregation / reduce | `replayFrom` folding events over snapshot |
| Sorted array derivation from `Map` | `getLineItems` — spread + sort + map |
| `strict: true` compliance (no `any`, no `as`) | Entire file |

## Bonus

Extend `replayFrom` to accept an optional `maxEvents` limit and return both the partial `OrderState` and the index of the last event applied, typed as a tuple `[OrderState, number]`.
