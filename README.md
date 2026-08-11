# Typed Async Task Scheduler with Concurrency Limits & Retry

**Difficulty:** Hard

## Scenario

You're building the job-execution engine for a data-pipeline platform. Hundreds of heterogeneous tasks arrive at once, each with its own input/output type, priority, and retry policy — the scheduler must cap concurrent execution, retry failed tasks with typed error classification, and return a discriminated settlement record for every task so callers can exhaustively handle successes and failures without casting.

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
| Branded/opaque types | `TaskId` type + `makeTaskId` factory |
| Discriminated unions | `RetryPolicy`, `TaskSettlement`, `TaskError` with `kind` discriminant |
| Generic interfaces with two type params | `Task<I, O>` definition |
| Mapped + conditional types with `infer` | `TaskSettlements<T>` — extracting `O` from `Task<I,O>` over a tuple |
| `const` type parameter (`const T`) | `runScheduler<const T>` preserving tuple literal types |
| `Extract<>` utility type | `handleSettlement` handler parameters |
| Concurrency limiting (semaphore pattern) | `runScheduler` slot-based queue |
| `AbortController` / `Promise.race` | Per-task timeout in `withTimeout` helper |
| Retry with exponential back-off | `runWithRetry` implementing all three `RetryPolicy` variants |
| Priority-based task ordering | Sorting by `high → medium → low` before queue drain |
| No `any` throughout | Enforced by `strict: true`; only branded-type `as` cast permitted |


## Bonus

Extend `runScheduler` to accept an optional `onProgress` callback typed as `(settlement: TaskSettlement<unknown>, completed: number, total: number) => void` that fires after each task settles, letting callers stream progress without waiting for all tasks to finish.
