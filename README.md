# Typed Workflow Orchestrator

**Difficulty:** Hard

## Scenario

You're building the execution engine for a low-code automation platform. Raw workflow definitions arrive as unknown JSON blobs from a database; your orchestrator must validate them, compile them into a strongly-typed execution graph, run steps through a typed middleware pipeline with retry logic, and surface a discriminated-union result per step — with zero `any`.

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

| Skill | Where in Code |
|---|---|
| Branded types (nominal typing via intersection) | `WorkflowId`, `StepId` — TODO 1 branded constructors |
| Discriminated unions | `WorkflowStep`, `StepOutcome`, `OrchestratorError` — all keyed on `kind`/`status` |
| Generic `Result<T,E>` monad | Used throughout; `Ok`/`Err` constructors, `withRetry`, `runWorkflow` |
| Mapped type over union discriminant | `HandlerRegistry` — TODO 2, keyed by `WorkflowStep["kind"]` |
| `Extract<Union, {kind:K}>` utility type | Inside `HandlerRegistry` mapped type to narrow each handler |
| Conditional / narrowing dispatch | `runWorkflow` step 6c — dispatching via `kind` to registry handlers |
| Middleware composition (higher-order functions) | `composeMiddleware` — TODO 3 |
| Runtime validation (`unknown` → typed) | `parseWorkflowDef` — TODO 4, full structural guard |
| Async retry with exponential back-off | `withRetry` — TODO 5 |
| Exhaustive union handling | `runWorkflow` must handle all four `WorkflowStep` kinds |


## Bonus

Add a `TimeoutStep` kind that cancels via `AbortController` after a configurable `timeoutMs`, updating the registry, middleware pipeline, and `runWorkflow` to handle it exhaustively.
