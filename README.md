# Typed Finite State Machine Executor

**Difficulty:** Hard

## Scenario

You're building the order-lifecycle engine for an e-commerce platform. Orders move through a strict set of states (Draft → Submitted → Processing → Shipped → Delivered, with cancellation paths), and every transition must be explicitly declared, guard-checked, and side-effected — all with zero runtime surprises and zero `any`.

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
| `Extract<Union, { type: K }>` to narrow discriminated union members | `Transition<S,E>` — `guard` and `effect` parameter types |
| `satisfies` operator to validate array literals without widening | `TRANSITIONS satisfies ReadonlyArray<Transition<...>>` |
| Discriminated union result type (`ok: true/false`) | `TransitionResult` definition |
| Type-safe narrowing without `as` or `any` | Inside `applyEvent` — matching `event.type` to call `effect` safely |
| Generic + constrained type parameters | `Transition<S extends OrderState, E extends OrderEvent>` |
| Mapped/conditional type usage | `Extract<OrderEvent, { type: E["type"] }>` in `guard`/`effect` |
| Sequential async-style control flow with early abort | `runMachine` — stop-on-first-failure loop |
| Exhaustive discriminated-union matching | History entries typed with `from`, `event`, `to`, `at` |


## Bonus

Extend the machine to support a `timeout` field on each `Transition` and a `runMachineAsync` variant that rejects with a typed `TimeoutError` if any single transition's effect takes longer than its declared timeout.
