# Typed State Machine Engine

**Difficulty:** Medium

## Scenario

You're building the workflow engine for an e-commerce order management system. Each order moves through a strict lifecycle — from placement to fulfillment — and the compiler must enforce that only valid transitions are allowed, that transition guards have access to the right context shape, and that side-effect actions are fully typed per transition.

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

| Skill | Where in code |
|---|---|
| Generic interfaces with constrained type params | `Transition<S, E, C>` definition |
| Optional function properties with typed signatures | `guard` and `action` on `Transition` |
| Generic interface with method signature | `MachineSnapshot<S extends OrderState>` |
| Discriminated union | `TransitionResult` (`ok: true` / `ok: false`) |
| Type narrowing via discriminant | `send()` return branches, test harness `assertFail` |
| `ReadonlyArray` for immutable config | `_transitions` field type |
| `Partial<T>` utility type | `patchContext(patch: Partial<OrderContext>)` |
| Closure capturing machine state | actions in `createOrderMachine` mutating context |
| Strict null / optional chaining | guard?.() call in `send()` and `can()` |

## Bonus

Add a `history` field to `StateMachine` that records every successful transition as `{ from: OrderState; event: OrderEvent; to: OrderState; at: number }` entries, and expose it via a typed `getHistory()` method.
