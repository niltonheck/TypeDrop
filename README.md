# Typed Retry-with-Backoff Task Queue

**Difficulty:** Medium

## Scenario

You're building the background job runner for a data-pipeline service. Tasks arrive with typed inputs and outputs, and each task must be retried up to a configurable limit on failure — using exponential backoff — before being marked as permanently failed. The queue must surface per-task results without losing successful jobs, and the whole run must respect a shared AbortSignal for graceful shutdown.

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
| Discriminated union (`status` discriminant) | `TaskResult<T>` — `"fulfilled"` vs `"failed"` variants |
| Generic types with two type parameters | `Task<I, O>`, `QueueResult<I, O>`, `runWithRetry<I, O>`, `runQueue<I, O>` |
| `ReadonlyArray<T>` for immutable collections | `runQueue` parameter & return type |
| Type narrowing via discriminant check | Inside `runWithRetry` — narrowing `TaskResult` after each attempt |
| `Promise.all` for concurrent execution | `runQueue` implementation |
| `AbortSignal` / `AbortController` integration | `abortableSleep`, `runWithRetry` abort handling |
| Async/await with structured error handling | `runWithRetry` retry loop, `try/catch` per attempt |
| Exponential backoff arithmetic | `baseDelayMs * backoffFactor^(attempt-1)` in retry loop |
| No `any`, no `as`, no `!` | Enforced throughout all type definitions and implementations |


## Bonus

Add a `concurrency` option to `runQueue` that limits how many tasks run simultaneously (e.g. concurrency: 2 means at most 2 tasks execute at once), implemented with a typed semaphore — without any third-party libraries.
