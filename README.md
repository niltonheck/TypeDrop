# Typed Event Emitter State Machine

**Difficulty:** Hard

## Scenario

You're building the order-lifecycle engine for a fulfilment platform. Each order moves through a strict set of states (e.g. `pending → confirmed → shipped → delivered`), and only specific transitions are legal. The engine must emit strongly-typed events for every transition so that downstream listeners receive exactly the right payload shape — and the TypeScript compiler rejects any attempt to fire an illegal transition or attach a listener to a non-existent event.

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

| Skill Exercised | Where in the Code |
|---|---|
| **Mapped types** over a union (`[S in OrderState]`) | `LegalTransitions` (TODO 1) |
| **Readonly tuple** literals as mapped-type values | `LegalTransitions` — each value is `readonly [...]` |
| **Discriminated union** with shared & variant fields | `TransitionEvent<F, T>` (TODO 2) |
| **Generic type parameters** with `extends` constraints | `TransitionEvent<F extends OrderState, T extends OrderState>` |
| **Template literal types** as object keys | `EventMap` key pattern `${F}:${T}` (TODO 3) |
| **Distributive mapped types** (nested iteration over two unions) | `EventMap` — maps F then T to produce all `"F:T"` keys |
| **`satisfies` operator** for runtime/compile-time alignment | `LEGAL_TRANSITIONS … satisfies Record<…>` |
| **Generic class methods** (`on<K>`, `off<K>`, `transition<T>`) | `OrderStateMachine` (TODO 4) |
| **Type narrowing** (discriminated union variants in listeners) | Test harness — listeners narrow `event.kind` |
| **Method chaining** with `this` return type | `on()` / `off()` return `this` |
| **No `any` / no `as`** throughout | Entire file |

## Bonus

As a stretch goal, add a `history(): ReadonlyArray<TransitionEvent<OrderState, OrderState>>` method that returns an immutable log of every event the machine has ever emitted, with the array typed so callers can discriminate each entry by `kind`.
