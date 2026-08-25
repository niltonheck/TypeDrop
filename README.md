# Typed Concurrent Task Scheduler with Priority Queues & Result Monads

**Difficulty:** Hard

## Scenario

You're building the background job engine for a data-pipeline platform. Jobs arrive with different priorities, resource tags, and retry budgets — the scheduler must run them concurrently up to a configurable concurrency limit, respect priority ordering, surface per-job typed results, and propagate structured errors without ever widening to `unknown` unsafely.

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

| Skill Exercised | Where in the Code |
|---|---|
| **Branded types** — `Brand<T,B>`, `unique symbol`, constructor guards | `JobId`, `TagName`, `makeJobId`, `makeTagName` |
| **Discriminated unions** — `status` discriminant on `Result`, `kind` on `SchedulerError` | `Ok<T>`, `Err<E>`, `SchedulerError` union |
| **Generics with constraints** — `Job<O>`, `JobOutcome<O>`, `SchedulerReport<O>` | All scheduler types and both core functions |
| **`satisfies` operator** — compile-time record completeness check | `PRIORITY_WEIGHT satisfies Record<Priority, number>` |
| **Conditional narrowing** — narrowing `result.status` before accessing `.value` / `.error` | Inside `runJobWithRetry`, test harness |
| **`Extract` utility type** — pulling a specific member from `SchedulerError` union | Test 3 in `challenge.test.ts` |
| **Concurrency limiting** — sliding window of in-flight promises | `runScheduler` implementation |
| **`Promise.allSettled` / manual promise pool** — collect all outcomes without throwing | `runScheduler` implementation |
| **Retry logic with typed error propagation** | `runJobWithRetry` implementation |
| **`Map<K,V>` with branded key type** | `summarizeByTag` return type `Map<TagName, …>` |
| **`ReadonlyArray` & immutable interfaces** | `Job`, `SchedulerReport`, function parameters |

## Bonus

Add a `timeout` field to `Job<O>` and wire up `AbortController` inside `runJobWithRetry` so that any attempt exceeding the timeout resolves as a `job_failed` error with `cause: new Error("timeout")` — fully typed, no `any`.
