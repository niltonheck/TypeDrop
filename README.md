# Typed State Machine Executor with Transition Guards

**Difficulty:** Hard

## Scenario

You're building the order-lifecycle engine for a fulfilment platform. Each order moves through a strict set of states (e.g. `pending → confirmed → shipped → delivered`), and every transition must pass a typed guard before it fires. The engine must enforce exhaustive state/event coverage at the type level, accumulate a typed audit log, and surface a discriminated `Result` for every attempted transition — with zero `any`.

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

| Skill | Where in `challenge.ts` |
|---|---|
| Branded types (`unique symbol`) | `OrderId`, `makeOrderId` |
| Mapped types with optional keys | `TransitionMap` — `[S in OrderState]?` / `[E in OrderEvent]?` |
| Conditional / `Exclude` utility type | `TransitionDef<S>.target: Exclude<OrderState, S>` |
| Discriminated union | `AuditEntry` (kind: `"transition"` \| `"guard_denied"` \| `"invalid_transition"`) |
| `Extract` utility type | `TransitionSuccess.auditEntry`, `TransitionFailure.auditEntry` |
| Generic type constraint (`T extends TransitionMap`) | `buildTransitionMap<T extends TransitionMap>` |
| `satisfies`-style dual constraint | `buildTransitionMap` call-site literal preservation |
| Exhaustive narrowing | `replayToState` — result `ok` discriminant drives summary counters |
| `readonly` / immutability discipline | `OrderContext.meta`, `TransitionDef.guards`, `getAuditLog()` return type |
| Class with private state & typed methods | `StateMachine` — `transition`, `getAuditLog`, `getAuditLogFor` |

## Bonus

Extend `StateMachine` with a generic `onTransition<E extends OrderEvent>(event: E, handler: (entry: Extract<AuditEntry, { kind: "transition"; event: E }>) => void): void` hook that fires typed callbacks only for the specific event they were registered for.
