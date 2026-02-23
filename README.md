# Typed Reactive State Machine

**Difficulty:** Hard

## Scenario

You're building the core of a checkout flow for an e-commerce platform. The checkout process moves through well-defined states (idle → validating → payment → confirmed / failed), and every transition must be explicitly allowed, carry typed payloads, and notify strongly-typed subscribers — all enforced at compile time.

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
| Discriminated union (`kind` / `type` discriminant) | `CheckoutState`, `CheckoutEvent` |
| Mapped types over a union | `TransitionMap` keyed by `CheckoutEvent["type"]` |
| Conditional types for narrowing | Mapping event `type` → narrowed event & state types in `reduce` |
| Exhaustive `never` check | `assertNeverState` used inside `send()` |
| Generic / utility types (`Extract`, `Pick`, etc.) | Narrowing valid `from` states per event in `TransitionMap` |
| Class with private state & typed methods | `CheckoutMachine` (state, subscribers, `send`, `subscribe`, `reset`) |
| Subscriber / callback typing | `Subscriber` type, `subscribe()` returning `() => void` |
| `Set` for deduplication | Subscriber registry inside `CheckoutMachine` |
| Single-pass `reduce` | `cartTotal` implementation |
| Template literal or branded types (bonus) | `orderId` could be branded as `OrderId` |


## Bonus

Brand the `orderId` string as `type OrderId = string & { readonly __brand: "OrderId" }` and propagate that brand through `ConfirmedState`, `SUBMIT_PAYMENT`, and `cartTotal`'s return type.
