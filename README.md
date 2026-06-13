# Typed Event Sourcing Ledger Reconstructor

**Difficulty:** Medium

## Scenario

You're building the read-model layer for a fintech platform that uses event sourcing. Raw domain events arrive as `unknown` from a Kafka consumer; your reconstructor must validate them, replay them in order against a typed ledger state machine, and produce a strongly-typed account snapshot — with zero `any`.

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
| Branded / nominal types | `AccountId`, `TransactionId` — prevent plain strings leaking into domain fields |
| Discriminated union (events) | `LedgerEvent` — four variants keyed on `type` literal |
| Discriminated union (errors) | `ValidationError`, `ReplayError` — keyed on `kind` literal |
| Generic `Result<T, E>` type | Used as return type of all three exported functions |
| `unknown` → typed narrowing | `parseLedgerEvent` must check shape before constructing `LedgerEvent` |
| Exhaustive branch / type narrowing | `replayEvents` switch/if on `LedgerEvent["type"]` must cover all variants |
| Utility type usage | `ReadonlyArray<LedgerEvent>` in `replayEvents` signature |
| Conditional field extraction | `Extract<…>` used in test harness to narrow `Result` union |
| Type predicate / filter narrowing | `.filter((r): r is Extract<…>)` in test harness |
| Mapped output interface | `LedgerReport` collects snapshot + two error channels |


## Bonus

Extend `replayEvents` to accept a generic `<S>` state parameter and a `reducer: (state: S, event: LedgerEvent) => Result<S, ReplayError>` so the state machine logic is fully decoupled from the snapshot shape.
