# Typed Hierarchical State Machine

**Difficulty:** Hard

## Scenario

You're building the order-lifecycle engine for an e-commerce platform. Orders flow through a strict set of states (e.g. `Pending → Confirmed → Shipped → Delivered`, with `Cancelled` reachable from several states), and each transition may carry a typed payload. Your task is to implement a strongly-typed hierarchical state machine where invalid transitions are rejected at the type level, transition guards receive the correct context, and every state's entry/exit hooks are fully typed — with zero `any`.

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

| Skill exercised | Where in the code |
|---|---|
| Mapped types (`{ [K in ...]: ... }[Key]`) | `OrderEvent` discriminated union construction |
| Generic constraints on multiple type params | `TransitionDef<From, To, Ev>` with `extends` bounds |
| Conditional / narrowed context types | `TransitionContext<S, Ev>` threading through hooks & guards |
| Discriminated union exhaustive handling | `send()` matching `OrderEvent` by `name` |
| `readonly` arrays & immutability | `transitions` param, `history()` return type |
| Utility type composition (`keyof`, index access) | `OrderEventName`, `OrderEventMap[Ev]` |
| `satisfies` / structural conformance | `StateHooks` mapped over `OrderState` |
| Result / Either pattern | `TransitionResult<To>` union with `ok` discriminant |
| Type-safe factory function | `createOrderMachine` wiring concrete `TransitionDef` instances |
| No `any` / no `as` / no `!` | Enforced throughout all stubs and required in implementation |

## Bonus

Extend `StateMachine` with a generic `subscribe<S extends OrderState>(state: S, cb: (ctx: TransitionContext<S, OrderEventName>) => void): () => void` method that lets callers register typed observers for a specific state's entry and returns an unsubscribe function.
