# Typed Event Sourcing Engine with Projection & Snapshot

**Difficulty:** Hard

## Scenario

You're building the event-sourcing backbone for a collaborative document editor. Raw domain events arrive as `unknown` from a Kafka consumer; your engine must validate them, apply them to a strongly-typed aggregate, maintain projections via a registry of typed reducers, and produce versioned snapshots — with zero `any`.

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
| Branded types (`unique symbol`) | `AggregateId`, `EventId`, `Version` — Req 1 |
| Discriminated union design | `DomainEvent` (4 variants) — Req 2 |
| Generic types with constraints | `Snapshot<S>`, `takeSnapshot<S extends ...>` — Req 4, 11 |
| Mapped types over union keys | `ProjectionRegistry<S>` keyed by `DomainEvent["type"]` — Req 5 |
| `Extract<>` utility type | `ProjectionReducer` per variant in `ProjectionRegistry` — Req 5 |
| `Result<T,E>` / discriminated error union | `Result`, `ValidationError` — Req 6, 7 |
| `unknown` → typed narrowing (no `any`) | `parseRawEvent` — Req 8 |
| Type-safe registry dispatch | `applyEvent` delegates to `ProjectionRegistry` — Req 9 |
| Sequential aggregation with early exit | `replayEvents` — Req 10 |
| Complex return type definition | `BatchResult` — Req 12 |
| Exhaustive discriminated union handling | `documentProjection` all 4 reducers — Req 13 |


## Bonus

Extend `ProjectionRegistry` to support an optional `onError` hook typed as `(event: DomainEvent, error: unknown) => void` and thread it through `applyEvent` without widening any types.
