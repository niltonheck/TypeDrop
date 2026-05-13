# Typed Async Job Scheduler with Priority Queues

**Difficulty:** Hard

## Scenario

You're building the task-execution layer for a distributed background-job platform. Raw job definitions arrive as `unknown` from multiple producer services; your scheduler must validate them, enqueue them into typed priority queues, execute batches with a concurrency limit and per-job timeout, and return a strongly-typed execution report — with zero `any`.

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
| Branded types (`JobId`, `QueueId`) | `makeJobId`, `makeQueueId`, `Job` interface |
| Discriminated union (`JobOutcome`, `ValidationError`) | Types section + `executeJob` return |
| Generic `Result<T, E>` | `validateJob` return type |
| `satisfies` keyword | `PRIORITY_WEIGHT` const |
| `unknown` → typed narrowing (no `any`) | `validateJob` implementation |
| Exhaustive error collection (no short-circuit) | `validateJob` R8 requirement |
| Stable sort with typed comparator | `buildPriorityQueue` |
| `Promise.race` for timeout | `executeJob` R15 requirement |
| Retry logic with attempt tracking | `executeJob` R12/R13 requirements |
| Global concurrency limiter across queues | `runScheduler` R18 requirement |
| `ReadonlyMap` in return type | `SchedulerReport.queues` field |
| `readonly` arrays and interfaces throughout | All interface definitions |


## Bonus

Extend `runScheduler` to accept a per-queue `concurrencyLimit` override via an optional `queueOverrides: Partial<Record<QueueId, { concurrencyLimit: number }>>` field on `SchedulerConfig`, applying the stricter of the global and per-queue limits.
