# Typed Concurrent Task Scheduler with Priority Queues & Result Aggregation

**Difficulty:** Medium

## Scenario

You're building the background job runner for a data-pipeline platform. Tasks arrive with different priorities and async work functions; the scheduler must run at most N tasks concurrently, drain them in priority order, and return a strongly-typed aggregated report — successes, failures, and per-task durations — without ever widening to `unknown` unsafely or swallowing errors silently.

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
| Branded types (`Brand<T, B>`, `unique symbol`) | `Concurrency` type, `makeConcurrency` |
| `satisfies` operator with `as const` | `PRIORITY_WEIGHT satisfies Record<Priority, number>` |
| Generic functions with `ReadonlyArray` constraints | `sortByPriority<T>`, `runScheduler<T>` |
| Discriminated union narrowing | `TaskResult<T>` = `TaskSuccess<T>` &#124; `TaskFailure`, `isSuccess` predicate |
| Type predicates (`result is TaskSuccess<T>`) | `isSuccess` return type |
| Conditional / mapped utility types | `SchedulerReport<T>` with `ReadonlyArray<TaskResult<T>>` |
| Concurrency limiting with `Promise` | `runScheduler` — at most N concurrent, slot-refill pattern |
| `Promise.allSettled`-style error isolation | `runScheduler` — failing task must not abort others |
| Aggregation over typed results | `successCount`, `failureCount`, `topResult` computation |
| Stable sort preserving original index | `sortByPriority` + `topResult` tie-breaking in `runScheduler` |


## Bonus

Add a `timeout` option to `Task` and make `runScheduler` automatically reject any task that exceeds its timeout, wrapping the error in a typed `TaskTimeoutError` that extends `TaskFailure`.
