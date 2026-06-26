# Typed Event Sourcing Engine with Snapshot & Projection

**Difficulty:** Hard

## Scenario

You're building the core event-sourcing engine for a financial ledger service. Raw domain events arrive as `unknown` from a Kafka consumer; your engine must validate and narrow them into a discriminated-union event log, rebuild aggregate state via typed reducers, apply snapshotting for performance, and fan-out to multiple read-model projections — all with zero `any`.

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
| Discriminated union (`DomainEvent`) | `TODO 1` — union of 4 event types keyed on `type` |
| `unknown` → narrowed type via runtime validation | `TODO 2` — `validateEvent` narrows `unknown` to `DomainEvent` |
| Generic `Result<T, E>` with string-literal error union | `ValidationError`, `ReducerError`, all return types |
| Exhaustive pattern matching on discriminated union | `TODO 3` — `applyEvent` switch over `event.type` |
| Generic data structures (`Snapshot<S>`, `Projection<R>`) | `TODO 4`, `TODO 5` — `Snapshot<AccountState>`, `Projection<R>` |
| Mapped type over tuple (`[K in keyof Ps]`) | `TODO 8` — `runProjections` return type derivation |
| `infer` in conditional type | `TODO 8` — `Ps[K] extends Projection<infer R> ? R : never` |
| `const` type parameter (TS 5.x) | `TODO 8` — `<const Ps extends readonly [...]>` preserves tuple |
| Readonly arrays & `satisfies`-friendly interfaces | Throughout — `readonly` on all state/event shapes |
| Type predicate / user-defined type guard | `TODO 2` — narrowing inside `validateEvent` |


## Bonus

Extend `runProjections` to also accept an optional `Snapshot<AccountState>` and skip events already baked into the snapshot before projecting, without changing the return type signature.
