# Typed Distributed Task Scheduler with Retry Policies & Concurrency Limits

**Difficulty:** Hard

## Scenario

You're building the job-execution engine for a distributed background worker system. Tasks arrive with heterogeneous payloads, each task type carries its own retry policy (fixed delay, exponential backoff, or no retry), execution must respect a global concurrency cap, and the final run report must distinguish succeeded, exhausted, and cancelled outcomes — all enforced by the compiler with no escape hatches.

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
| Discriminated unions (3-variant `RetryPolicy`) | `RetryPolicy` type, `computeNextDelay` switch |
| Generic discriminated union (`Task<TPayload>`) | `Task` type definition, all task variables |
| Conditional / exhaustive narrowing (`switch` on `kind`/`type`) | `computeNextDelay`, `runScheduler` internals |
| Generic utility intersection types (`TaskOutcome & { status: "..." }`) | `partitionOutcomes` return type |
| Concurrency limiting with `Promise` pool | `runScheduler` implementation |
| Retry loop with typed delay policy | `runScheduler` retry logic + `computeNextDelay` |
| `AbortController` / wall-clock timeout (globalTimeoutMs) | `runScheduler` cancellation branch |
| Fully generic return type (`RunReport<TPayload>`) | `runScheduler` return, `partitionOutcomes` input |
| `satisfies` or `const` narrowing on mock data | Test harness task literals |
| No `any` / no type assertions | Entire file, enforced by `strict: true` |

## Bonus

Add a fourth RetryPolicy variant `{ kind: "jitter"; baseDelayMs: number; maxAttempts: number; windowMs: number }` where the actual delay is a random value in `[baseDelayMs, baseDelayMs + windowMs)`, and update `computeNextDelay` and the test harness to cover it.
