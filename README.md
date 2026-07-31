# Typed Event-Sourced State Machine

**Difficulty:** Hard

## Scenario

You're building the order-lifecycle engine for an e-commerce platform. Orders move through a strict set of states (e.g. `Pending → Confirmed → Shipped → Delivered`, with cancellation possible from some states), and every transition must be recorded as an immutable event in an append-only log. The hardest part is making TypeScript enforce — at the type level — which events are legal from each state, so invalid transitions are caught at compile time, not at runtime.

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
| Discriminated unions | `OrderEvent` union; narrowing in `applyEvent` via `event.type` |
| Mapped types over a union | `TransitionMap` mapped over `OrderState` |
| `satisfies` operator | `TRANSITIONS satisfies TransitionMap` — preserves literal tuples |
| Conditional types + `Extract` | `LegalEvents<S>` resolving to the correct `OrderEvent` sub-type |
| Indexed access types | `typeof TRANSITIONS[S][number]` to get allowed type strings |
| Generic functions with constrained state | `applyEvent<S extends OrderState>(aggregate: { state: S }, event: LegalEvents<S>)` |
| Type predicates | `isTerminal(state): state is "Cancelled" \| "Refunded"` |
| Generic filtering with `Extract` | `getEventsByType<T>` returning `ReadonlyArray<Extract<OrderEvent, { type: T }>>` |
| Immutable / `readonly` patterns | `events: readonly OrderEvent[]`, `ReadonlyArray` returns |
| Runtime validation + typed error handling | `rehydrate` guards illegal transitions via `TRANSITIONS` map |

## Bonus

Extend `applyEvent` to accept an optional `readonly middleware: Array<(agg: OrderAggregate, ev: OrderEvent) => void>` parameter and invoke each middleware after the transition, typing the middleware array so each callback receives the fully-updated aggregate.
