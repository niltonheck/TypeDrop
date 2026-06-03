# Typed Workflow State Machine Executor

**Difficulty:** Hard

## Scenario

You're building the execution engine for a no-code automation platform where users define multi-step workflows as JSON. Raw workflow definitions arrive as `unknown` from a REST API; your engine must validate them, execute each step through a typed strategy registry, enforce per-step retry logic with exponential back-off, and produce a strongly-typed execution report — with zero `any`.

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
| Discriminated union (`StepDefinition` with 4 variants) | `StepDefinition` type (§2) |
| Branded / opaque types (`WorkflowId`, `StepId`) | §1, used throughout |
| Generic mapped type over union keys (`StepOutput<K>`, `HandlerRegistry`) | §4, §7 |
| `Extract<Union, { kind: K }>` to link keys to variants | `StepOutput`, `HandlerRegistry` (§4, §7) |
| Generic async function with constrained type param (`withRetry<T>`) | §9 |
| `AbortSignal` / `AbortController` cancellation | `withRetry` (§9), `executeWorkflow` (§10) |
| Exponential back-off with abort-aware delay | `withRetry` (§9) |
| Runtime `unknown` → typed narrowing / validation | `parseWorkflowDefinition` (§8) |
| Sequential async execution with conditional branching | `executeWorkflow` (§10) |
| Per-kind `Record` aggregation (`summary` field) | `WorkflowExecutionReport` (§5), `executeWorkflow` (§10) |
| `satisfies` operator (optional enhancement) | `HandlerRegistry` literal in test harness |
| `StepResult<K>` generic result type | §4 |

## Bonus

Add a `timeoutMs`-per-step field to each `StepDefinition` variant and enforce individual step timeouts *in addition to* the global workflow timeout, using `Promise.race` between the handler and a per-step `AbortController`.
