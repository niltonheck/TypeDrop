# Typed Workflow Orchestrator with Conditional Branching

**Difficulty:** Hard

## Scenario

You're building the workflow engine for a business-process automation platform. Raw workflow definitions arrive as `unknown` from a configuration API; your orchestrator must validate them, execute each step through a typed middleware pipeline, conditionally branch based on strongly-typed step outcomes, and produce a fully-typed execution trace — with zero `any`.

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
| Discriminated unions (`WorkflowStep`, `WorkflowError`, `StepTrace`) | Types §2, §3, §7; used throughout `validateWorkflowDefinition` & `run` loop |
| `Result<T, E>` monad with typed error hierarchy | §1 — returned by every step, validated, propagated in `run` |
| `unknown` → typed narrowing (no `any`, no `as`) | `validateWorkflowDefinition` TODO (2) — all guards must be manual |
| Generic mapped type (`StepRegistry<R>`) | §6 — constrains registry shape; `createOrchestrator` generic param |
| `Extract<E, { kind: K }>` conditional type | `narrowError` TODO (5) — handlers map must narrow each error variant |
| Mapped type over union keys (`{ [K in E["kind"]]: ... }`) | `narrowError` signature — exhaustive handler record |
| `infer` / `Record<WorkflowStep["type"], string[]>` | `extractStepIds` TODO (4) — return type derived from union |
| Middleware chain (higher-order async functions) | `StepMiddleware` type §8; wired in `createOrchestrator` TODO (3d) |
| `Promise.race` for timeout handling | `createOrchestrator` TODO (3b-iii) — TimeoutError as Result, not throw |
| Exhaustive `switch`/discriminant matching | `run` loop over step types; `narrowError` dispatch |
| `reduce` for aggregation without loops | `extractStepIds` TODO (4) |


## Bonus

Extend `createOrchestrator` to accept a `maxConcurrentTransforms` option and use a semaphore-style counter to limit how many transform steps may execute simultaneously across concurrent `run` calls.
