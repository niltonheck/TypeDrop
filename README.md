# Typed Job Queue Retry Scheduler

**Difficulty:** Medium

## Scenario

You're building the background job processing layer for a workflow automation platform. Jobs can succeed, fail with a retryable error, or fail fatally — your scheduler must execute them with typed retry policies, collect per-job outcomes, and surface a structured run report through a `Result<T, E>` type with zero `any`.

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
| Generic `Result<T, E>` type | `[1]` — two-variant union used throughout |
| Discriminated union narrowing | `[2]` `JobError` — `kind` tag used in `scheduleJob` to branch retry logic |
| Generics on types and functions | `Job<P>`, `JobOutcome<P>`, `scheduleJob<P>` |
| `Promise.race` for timeouts | `[7]` — `withTimeout` helper wraps each attempt |
| `Promise.all` for concurrency | `[8]` — `runQueue` fans out all jobs concurrently |
| Retry loop with conditional logic | `[7]` — only "retryable" errors continue the loop |
| Aggregate reduction over outcomes | `[8]` — `RunReport` counts derived from `JobOutcome[]` |
| Strict-mode, no `any` | All stubs and implementations throughout |


## Bonus

Extend `RunReport` with a `totalAttempts` field and a `p99LatencyMs` estimate computed from per-outcome attempt counts multiplied by the job's `backoffMs`.
