# Typed Concurrent API Client with Retry, Cancellation & Result Aggregation

**Difficulty:** Hard

## Scenario

You're building the data-fetching layer for a distributed dashboard that fans out requests to multiple third-party microservices simultaneously. Each endpoint has its own response shape, requests must be cancellable, failed requests are retried with exponential back-off, and the final aggregated report is a discriminated-union result per endpoint — all enforced by the compiler with zero `any`.

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
| Discriminated union (`Result<T,E>`) | `TODO (1)` — `status: "ok"` / `status: "err"` branches |
| Discriminated union (`FetchError`) | `TODO (2)` — `kind` discriminant across 3 error shapes |
| `infer` in conditional types | `TODO (4)` — `EndpointResponse<E>` extracts `T` from `Endpoint<T>` |
| Mapped types over generic record | `TODO (5)` — `AggregatedResults<M>` maps each key to its typed `Result` |
| `satisfies` operator | `defaultRetryConfig satisfies RetryConfig` stub; test harness `satisfies EndpointMap` |
| Generic function with constrained type params | `fetchWithRetry<T>`, `fetchAll<M extends EndpointMap>`, `unwrapOr<T,E,F extends T>` |
| `Extract` utility type | `isOk` return annotation narrows via `Extract<Result<T,E>, { status: "ok" }>` |
| Type guard (`is` predicate) | `isOk` — narrows `Result<T,E>` to its ok branch |
| `Promise.allSettled` + concurrency | `TODO (7)` — fan-out without sequential blocking |
| `AbortController` / `AbortSignal` | `TODO (6)` — cancellation path in `fetchWithRetry`, global timeout in `fetchAll` |
| Exponential back-off retry logic | `TODO (6e)` — `baseDelayMs * 2^attempt` with `shouldRetry` predicate |
| Mapped type preserving key structure | `rawResponses: { [K in keyof M]: unknown }` in `fetchAll` signature |

## Bonus

Extend `fetchAll` to accept an optional `concurrencyLimit: number` that caps how many `fetchWithRetry` calls run simultaneously, using a semaphore implemented with plain Promises and no external libraries.
