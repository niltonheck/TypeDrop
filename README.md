# Typed Workflow State Machine

**Difficulty:** Hard

## Scenario

You're building the order-fulfillment engine for a logistics platform. Every order moves through a strict lifecycle — and your state machine must enforce legal transitions at the type level, accumulate a typed audit log, and return exhaustively-matched `Result<T, E>` outcomes, all with zero `any`.

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

| Skill | Where in the code |
|---|---|
| Discriminated union (`OrderState`) | `TODO 1` — one variant per `StateName`, `kind` field as literal discriminant |
| Mapped / conditional types (`StatePayloadMap`) | `StatePayloadMap` drives payload shape; solver must map over it to build the union |
| Branded / phantom types (`Transition<From,To>`) | `TODO 2` — phantom type params prevent cross-assignment of incompatible transitions |
| `satisfies` operator | `TODO 3` — TRANSITIONS registry validated without widening |
| Template literal types | TRANSITIONS keys are `${StateName}->${StateName}` strings |
| Type narrowing (`unknown` → typed) | `TODO 4c` — narrowing `Record<string, unknown>` payload against known field lists |
| Discriminated-union exhaustive matching | `applyTransition` switch/if-chains over `StateName`; `TransitionError` matching in tests |
| `Result<T, E>` error monad | `applyTransition` and `runWorkflow` return `Result<MachineContext, TransitionError>` |
| Utility types (`Record`, `readonly`) | `transitionCounts: Record<StateName, number>`, readonly arrays/tuples throughout |
| Single-pass `reduce` aggregation | `TODO 6` — `summariseMachine` must not use extra loops or intermediate arrays |
| `as const` + `satisfies` | `STATE_NAMES as const`, TRANSITIONS registry |
| Strict null safety | No `!`, no `as`, no `any` anywhere |


## Bonus

Extend `Transition` so that the registry type itself is a mapped type over a union of `[From, To]` tuples, making it impossible to register a transition that isn't in the legal set without touching the TRANSITIONS object.
