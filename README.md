# Typed HTTP Retry Client with Exponential Backoff & Error Classification

**Difficulty:** Medium

## Scenario

You're building the resilient HTTP layer for a microservice platform. Transient network errors and rate-limit responses should be retried with exponential backoff, while client errors (4xx) must be surfaced immediately — all with fully typed request/response shapes and a structured Result type so callers never need to guess what went wrong.

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
| Branded primitive types | `HttpStatus` brand + `toHttpStatus` |
| Discriminated union (3 members) | `HttpError` with `kind` discriminant |
| Generic `Result<T, E>` type | Requirement 2 — `Result` & `HttpResult` |
| Interface design | `RequestConfig<TBody>`, `RetryPolicy`, `RawResponse` |
| Generic function type alias | `Transport` (Requirement 4) |
| Type narrowing via `if/switch` | `classifyResponse`, `renderError` |
| Exhaustive `never` check | `renderError` default branch |
| Async/retry loop with generics | `fetchWithRetry<TBody>` |
| Exponential backoff math | `exponentialDelay` |
| Generic typed wrappers | `get<TResponse>` and `post<TBody>` |

## Bonus

Extend `RetryPolicy` with an optional `maxDelayMs` cap so exponential delays never exceed a configurable ceiling, and update `exponentialDelay` to respect it.
