# Typed Retry Scheduler with Exponential Backoff

**Difficulty:** Medium

## Scenario

You're building the resilience layer for a microservice that calls unreliable third-party APIs. Each operation is declared with a typed retry policy, and the scheduler must execute it with exponential backoff, surface structured typed outcomes for every attempt, and ultimately resolve to a discriminated Result — the compiler must enforce that policy fields, attempt records, and final outcomes are fully consistent with the declared schema.

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
| Branded / nominal types | `Milliseconds` brand + `ms()` helper |
| Discriminated unions | `AttemptRecord<T>` (`status`) and `SchedulerResult<T>` (`outcome`) |
| Generics | `AttemptRecord<T>`, `SchedulerResult<T>`, `withRetry<T>`, `ExtractSuccess<R>` |
| Conditional types + `infer` | `ExtractSuccess<R>` |
| Utility / function types | `shouldRetry: (error: unknown) => boolean`, optional `sleep` param |
| Type narrowing | Narrowing `AttemptRecord` and `SchedulerResult` by discriminant in tests |
| `unknown` error handling | `error: unknown` in `AttemptRecord` and `shouldRetry` |
| Async / Promise patterns | `withRetry` uses `async/await`, optional injectable `sleep` |
| Strict-mode compliance | No `any`, no `as`, no unsafe casts anywhere |


## Bonus

Add a `timeout` field to `RetryPolicy` (type `Milliseconds`) and abort any single attempt that exceeds it using `Promise.race`, recording it as a failure with a typed `TimeoutError`.
