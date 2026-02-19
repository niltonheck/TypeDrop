# Typed Workflow State Machine

**Difficulty:** Hard

## Scenario

You're building a backend order-processing engine where each order moves through a strict lifecycle (pending → confirmed → shipped → delivered, with cancellation possible from select states). Every transition must be validated at the type level — illegal state jumps must be a compile error, not a runtime surprise.

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
| Union types | `OrderState` type definition |
| Mapped types | `TransitionMap` over `OrderState` keys |
| `satisfies` operator | `TRANSITION_MAP satisfies TransitionMap` |
| Indexed access types | `ReachableFrom<S>` derived from `TRANSITION_MAP` |
| Generic interfaces | `Order<S extends OrderState>` |
| Discriminated unions | `TransitionEvent` variants with `from`/`to` literal pairs |
| Constrained generics | `transition<S, E extends TransitionEvent & { from: S }>` |
| Type predicates | `isTerminal(order): order is Order<"delivered"> \| Order<"cancelled">` |
| `Partial<Record<K,V>>` utility types | `groupOrdersByState` return type |
| Single-pass reduce | `groupOrdersByState` implementation |
| Type-level equality tests | `_T1`–`_T4` compile-time assertions via `Expect<Equal<...>>` |

## Bonus

Extend `TransitionEvent` and `transition` to support an optional `history` array on `Order` that appends an immutable log entry `{ from, to, actor, at: Date }` on every successful transition, with the log entry type inferred from the event.
