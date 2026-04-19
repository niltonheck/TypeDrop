# Typed Workflow Orchestrator

**Difficulty:** Hard

## Scenario

You're building the workflow execution engine for a low-code automation platform. Raw workflow definitions arrive as unknown JSON from a user-facing editor; your orchestrator must validate them, compile each step into a strongly-typed execution graph, run steps with concurrency limits and retry logic, and emit a discriminated-union result per step — with zero `any`.

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
| Branded types | `WorkflowId`, `StepId` — used throughout, constructed only via safe constructors |
| Discriminated union narrowing | `validateStep` narrows on `kind`; `StepResult` narrowed in report assembly |
| Mapped type with `Extract` | `StepHandlerMap` — each key maps to a handler typed over its exact step shape |
| `Result<T,E>` monad | `validateStep`, `validateWorkflow`, `topoSort` all return `Result` |
| `unknown` → typed narrowing (no `as`) | `validateWorkflow` must safely narrow `unknown` input |
| Generic utility types (`Extract`) | `StepHandlerMap` uses `Extract<WorkflowStep, { kind: K }>` |
| Concurrency limiting | `orchestrate` must cap simultaneous running steps to `config.concurrency` |
| Retry with exponential back-off | `orchestrate` retries up to `maxRetries` with `retryBaseMs * 2^attempt` delay |
| Topological sort (graph algorithm) | `topoSort` must handle DAG ordering and cycle detection |
| Conditional type branching logic | `ConditionStep` outcome drives which branch step is skipped |
| `satisfies` operator (optional stretch) | Handlers object can be typed with `satisfies StepHandlerMap` |
| Outcome derivation from discriminated results | `outcome` field computed from `StepResult[]` union members |


## Bonus

After the workflow completes, add a `criticalPath` field to `ExecutionReport` typed as `StepId[]` that lists the longest dependency chain (by total `durationMs`) from start to finish.
