# Typed Workflow Orchestrator

**Difficulty:** Hard

## Scenario

You're building the execution engine for a low-code automation platform. User-defined workflow definitions arrive as `unknown` from a configuration store; your orchestrator must validate them, topologically sort their steps into dependency-respecting execution stages, run each stage with typed retry/timeout policies, and emit a discriminated-union execution report per step — with zero `any`.

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
| Branded / opaque types | `StepId` brand, `toStepId()` cast, `HandlerRegistry` keys |
| Discriminated unions | `StepReport` (`StepSuccess \| StepFailure \| StepSkipped`), `ValidationResult<T>` |
| Mapped / Record types | `StepContext`, `HandlerRegistry` as `Record<StepId, StepHandler>` |
| Generic result type | `ValidationResult<T>` used in `validateWorkflow` |
| `satisfies` operator | `registry satisfies HandlerRegistry` in test harness |
| Runtime type narrowing (`unknown` → typed) | `validateWorkflow` — full structural validation of `unknown` input |
| Conditional status derivation | `WorkflowReport.status` derived from all `StepReport` kinds |
| `Promise.all` concurrency | `executeStage` runs all steps in a stage concurrently |
| `Promise.race` for timeout | `withTimeout` raced against each attempt in `executeStep` |
| Retry with exponential back-off | `withRetry` — `baseDelayMs * 2^(attempt-1)` delay loop |
| Topological sort (Kahn's algorithm) | `buildExecutionStages` — BFS-based stage bucketing |
| Cycle detection | `validateWorkflow` (DFS) and defensively in `buildExecutionStages` |
| Error hierarchy (`extends Error`) | `TimeoutError` with typed fields `stepId` and `timeoutMs` |
| Never-throw async boundary | `executeStep` must return `StepReport` — never throw |
| `ReadonlySet` / immutable accumulation | `failedStepIds: ReadonlySet<StepId>` in `executeStage` |

## Bonus

Extend `HandlerRegistry` to a generic `TypedHandlerRegistry<S extends WorkflowDef>` so TypeScript enforces that every `stepId` declared in a given `WorkflowDef` has exactly one corresponding handler entry — no more, no fewer.
