# Typed Job Queue Scheduler

**Difficulty:** Medium

## Scenario

You're building the background-job layer for a workflow automation platform. Raw job definitions arrive as `unknown` from a user-facing API; your scheduler must validate them, assign each job to a typed priority lane, execute lanes with a configurable concurrency limit, and return a strongly-typed execution report — with zero `any`.

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
| Union types (`Priority`, `JobResult` discriminated union) | `Priority`, `JobSuccess`, `JobFailure`, `JobResult` |
| Mapped types / `Record` utility | `PriorityQueues`, `SchedulerReport.results` |
| Runtime narrowing of `unknown` → typed interface | `validateJob` — guards for each field |
| Typed callback / function type alias | `JobRunner` type alias |
| `Promise.allSettled` / concurrency pool | `executeLane` sliding-window implementation |
| Sequential async orchestration | `runScheduler` — high → normal → low lane ordering |
| Discriminated union narrowing (`status` field) | `runScheduler` — tallying succeeded vs failed |
| `ReadonlySet` and `const`-width types | `VALID_PRIORITIES` set used in `validateJob` |
| Default parameter typing | `runScheduler` — `concurrency: number = 3` |
| Aggregation with `reduce` / accumulator pattern | `SchedulerReport` construction in `runScheduler` |


## Bonus

Add a `timeout` field to `Job` and make `executeLane` race each `runner` call against `AbortSignal.timeout(job.timeout)`, capturing a `JobFailure` with reason `"timed out"` when exceeded.
