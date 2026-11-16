# Typed Task Scheduler with Priority Queues & Retry Policies

**Difficulty:** Medium

## Scenario

You're building the job-runner core for a background task platform. Tasks arrive with typed payloads, priority levels, and retry policies; your scheduler must enqueue them, drain them in priority order with a concurrency cap, and surface a typed run report — all enforced by the compiler with no escape hatches.

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
| **Branded types** | `TaskId = string & { readonly __brand: "TaskId" }` — prevents mixing raw strings with task IDs |
| **Union of numeric literals** | `Priority = 1 \| 2 \| 3` — constrains priority to exactly three levels |
| **Discriminated unions** | `AttemptOutcome` (`status: "success" \| "failure"`) and `TaskResult` (`status: "succeeded" \| "failed"`) |
| **Generics** | `Task<P>` payload type flows through `enqueue<P>` and `runWithRetry<P>` without widening |
| **Typed interfaces** | `Scheduler` interface separates contract from implementation |
| **Promise.all for concurrency** | Batching tasks within a priority bucket up to `maxConcurrency` |
| **Sequential async control flow** | Processing priority buckets one after another before starting the next |
| **Retry logic with async/await** | `runWithRetry` loops up to `maxAttempts`, awaits `sleep` between tries |
| **Aggregation & reporting** | `RunReport` built by reducing `TaskResult[]` into counts |
| **Strict null safety** | No `any`, no non-null assertions in stubs; `unknown` used for internal queue storage |

## Bonus

Add a `timeout` field to `RetryPolicy` and cancel any handler that runs longer than `timeout` ms using `AbortController`, recording a `"failure"` outcome with message `"timed out"`.
