# Typed Workflow State Machine Executor

**Difficulty:** Hard

## Scenario

You're building the automation backbone for a CI/CD platform. Each pipeline is a finite state machine whose transitions are guarded by typed conditions, carry typed payloads, and emit strongly-typed side-effect events — all resolved through a `Result<T, E>` monad with exhaustive error handling and zero `any`.

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
| Discriminated union (`Result<T,E>`, `TransitionError`, `WorkflowEvent`, `AnyWorkflowState`) | Requirements 1, 5, 7, `AnyWorkflowState` union |
| Mapped type over a string union (`StatePayloadMap`, `AllowedTransitions`) | Requirements 3, 4 |
| Intersection type for discriminated state payload | `WorkflowState<K>` — `{ kind: K } & StatePayloadMap[K]` |
| Indexed access type (`AllowedTransitions[From][number]`) | `Guard<From, To>` constraint, `transition()` signature |
| Generic class with constrained type parameters | `StateMachine.transition<To>()` |
| Variadic rest parameter with generic element type | `...guards: ReadonlyArray<Guard<StateKind, To>>` |
| `unknown` → typed narrowing without `any` | `validatePayload` — switch + field-level typeof checks |
| `Record<K, V>` utility type | `RunReport.byFinalState` |
| Single-pass `reduce` aggregation | `aggregateRuns` |
| Exhaustive event derivation (no fallthrough) | `StateMachine` — event emission switch |


## Bonus

Extend `StateMachine` to accept an optional `timeout` (ms) per transition and return `Err<TransitionError>` with a new `TimedOut` variant if `validatePayload` + guards collectively exceed it — using `Promise`-based guards and `Promise.race`.
