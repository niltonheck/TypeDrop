# Typed Job Queue: Priority Scheduling, Worker Dispatch & Result Aggregation

**Difficulty:** Medium

## Scenario

You're building the scheduling core for a background job processing system. Jobs arrive with typed payloads and priorities, are dispatched to typed worker handlers, and results are aggregated into a structured run report — the compiler must enforce every job variant, worker signature, dispatch outcome, and summary shape.

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
| Discriminated unions (`Job` variants) | `Job`, `EmailJob`, `ResizeJob`, `ReportJob`, `WebhookJob` |
| Generic base interface (`JobBase<K>`) | `JobBase<K extends JobKind>` |
| Mapped type over a union (`WorkerRegistry`) | TODO 3b — `[K in JobKind]: WorkerFn<Extract<Job, { kind: K }>>` |
| Conditional / Extract utility type | `Extract<Job, { kind: K }>` inside `WorkerRegistry` |
| Generic `Result<T, E>` pattern | `JobSuccess<T>`, `JobFailure`, `JobResult<T>` |
| `satisfies` operator for registry validation | TODO 6 — `mockRegistry satisfies WorkerRegistry` |
| `Promise.allSettled` + concurrent dispatch | `runQueue` — dispatching all jobs concurrently |
| Type narrowing via `switch` on discriminant | `dispatchJob` — narrowing `job.kind` to call the right worker |
| Stable sort with custom comparator | `sortByPriority` |
| Typed `RunReport` aggregation | `runQueue` return value |

## Bonus

Extend `RunReport` with a `byKind` field typed as `Record<JobKind, { succeeded: number; failed: number }>` and populate it inside `runQueue`.
