# Typed Workflow State Machine

**Difficulty:** Medium

## Scenario

You're building the order-processing engine for a fulfilment platform. Each order moves through a strict lifecycle — from placement to delivery or cancellation — and only certain transitions are legal at any given state. The challenge is encoding that lifecycle entirely in the type system so that illegal transitions are caught at compile time, not at runtime.

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
| String-literal union types | `OrderState` definition (Req 1) |
| Mapped types | `TransitionMap` over `OrderState` (Req 2) |
| Conditional / indexed types | `LegalTransition<S>` (Req 3) |
| Discriminated union | `OrderEvent` with `type` discriminant (Req 4) |
| Interface with `ReadonlyArray` | `Order` interface (Req 5) |
| Function overloads | `transition` overload signatures (Req 6) |
| `Record<K, V>` utility type | `EVENT_TO_STATE`, `STATE_LEGAL_EVENTS` (provided helpers) |
| Type narrowing (discriminated union) | Inside `transition` implementation |
| `Extract` / indexed access | `OrderEvent["type"]` in `getValidNextEvents` return type |
| Exhaustive state handling | `getValidNextEvents` must cover all `OrderState` values |

## Bonus

Add a per-event overload for each `OrderEvent["type"]` so that `transition(order, shipEvent)` returns `Order & { state: "shipped" }` — a branded/intersected return type that narrows the resulting state at compile time.
