# Typed Event-Sourced State Machine

**Difficulty:** Hard

## Scenario

You're building the order-lifecycle engine for a commerce platform. Orders move through a strict set of states via typed events — your state machine must enforce legal transitions at the type level, fold an event log into the current state, and surface a fully typed `Result<T, E>` for every operation with zero `any`.

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
| Branded types (nominal typing) | `OrderId`, `EventId`, `makeOrderId`, `makeEventId` |
| Discriminated unions | `OrderState`, `OrderEvent`, `MachineError`, `Result<T,E>` |
| `Record` mapped type | `LegalTransitions` keyed by `OrderEvent["type"]` |
| `satisfies` operator | `LEGAL_TRANSITIONS` declaration |
| Generic `Result<T, E>` monad | `ok()`, `err()`, `foldEvents()`, `applyEvent()` |
| Conditional types + `Extract` | `StateByKind<K>` resolving a union variant by discriminant |
| Generic functions with type narrowing | `assertState<K>()`, `isTerminal()` |
| Type predicate (`is`) | `isTerminal()` return type |
| Exhaustive event handling | `applyEvent()` switch over `OrderEvent["type"]` |
| State accumulation / fold pattern | `foldEvents()` sequential replay with short-circuit |


## Bonus

Extend `foldEvents` to also return a full typed execution trace — an array of `{ event: OrderEvent; stateBefore: OrderState | null; stateAfter: OrderState }` — alongside the final state, all without `any`.
