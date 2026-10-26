# Typed Concurrent Task Scheduler with Retry & Cancellation

**Difficulty:** Hard

## Scenario

You're building the background job engine for a data-pipeline platform. Tasks arrive with priorities, dependencies, and retry policies — the scheduler must run them with a concurrency cap, propagate cancellation cleanly, and return a fully-typed result manifest that distinguishes successes, failures, and cancellations without a single `any` in sight.

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


| TypeScript Skill | Where Exercised |
|---|---|
| **Branded types** (opaque via intersection) | `TaskId`, `Ms`; `toTaskId`, `toMs` constructors (TODO 1) |
| **Discriminated unions** | `RetryPolicy` (`kind` discriminant); `TaskResult` (`status` discriminant) |
| **Conditional types + `infer`** | `OutputTypeOf<T>` (TODO 2) extracts `TOutput` from `TaskDefinition<TOutput>` |
| **Mapped types** | `ScheduleManifest<TRegistry>` maps registry keys → `TaskResult`; `SuccessesOnly` filters with `as` re-mapping |
| **`Extract` utility type** | `collectSuccesses` return type narrows `TaskResult` to `TaskSuccess` variant |
| **Generics with constraints** | `schedule<TRegistry extends TaskRegistry>`, `PriorityQueue<T>`, `collectSuccesses<TRegistry>` |
| **`satisfies` / `const` type params** | Registry literals can use `satisfies TaskRegistry` to preserve literal key types |
| **AbortController / cancellation** | Per-task timeout via `AbortController`; external signal propagation (TODO 6g) |
| **Promise concurrency patterns** | Concurrency cap, `Promise.race` for timeout, sequential retry with delay |
| **Exhaustive discriminant matching** | `retryDelay` switch over `RetryPolicy["kind"]`; manifest queries over `status` |
| **Generic class typing** | `PriorityQueue<T>` with typed comparator (TODO 3) |
| **Error result types** | `TaskFailure` carries `unknown` error; `TaskCancelled` carries reason literal union |


## Bonus

Extend `schedule` to emit structured lifecycle events (task-started, task-retrying, task-settled) through a typed `EventEmitter`-style callback, where the event payload type is narrowed by the event name via function overloads.
