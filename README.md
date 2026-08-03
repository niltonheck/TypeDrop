# Typed Concurrent Task Scheduler with Priority & Retry

**Difficulty:** Hard

## Scenario

You're building the background job engine for a data-pipeline platform. Tasks arrive with priorities, concurrency slots are limited, and flaky tasks must be retried with exponential back-off — all while the scheduler exposes a strongly-typed, generic result stream so callers never lose track of which task produced which outcome.

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
| Branded / opaque types | `TaskId` brand, `makeTaskId` factory |
| Discriminated unions | `RetryPolicy` (none / fixed / exponential), `TaskResult` (fulfilled / rejected) |
| Generic type erasure with `unknown` | `AnyTask`, `AnyResult` — erasing `T` for internal storage |
| Conditional types for method availability | `TaskBuilderMethods<T, S>` — `build()` only when `S extends { hasPriority: true; hasWork: true }` |
| Phantom / state types | `BuilderState` generic parameter on `TaskBuilder<T, S>` |
| User-defined type guards | `extractFulfilled<T>` — `guard: (value: unknown) => value is T` |
| Concurrency control (no library) | `createScheduler` — `concurrency` slot counter |
| Promise composition & racing | `globalTimeoutMs` race against the work loop |
| Retry with exponential back-off | `runWithRetry` helper — all three `RetryPolicy` kinds |
| Custom error classes | `TimeoutError`, `RetryExhaustedError` with typed fields |
| Priority queue ordering | Internal queue sorted desc by priority, FIFO on ties |
| `satisfies` / strict generics | `Task<T>` interface, `TaskBuilder` chain preserving `T` |

## Bonus

Extend the scheduler with a `cancel(id: TaskId): boolean` method that removes a queued (not yet started) task and immediately settles its result slot as rejected with a `CancelledError`.
