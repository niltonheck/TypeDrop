# Typed Retry-with-Backoff Fetcher

**Difficulty:** Medium

## Scenario

You're building the resilient HTTP layer for a microservice that calls third-party APIs known to occasionally return transient errors. Each request must be retried with exponential backoff, errors must be classified as retryable or fatal, and every outcome — success or exhausted retries — must be surfaced as a fully-typed `FetchResult<T>` with zero `any`.

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
| Discriminated union (`outcome` field) | `FetchResult<T>` = `FetchSuccess<T> \| FetchExhausted \| FetchFatal` |
| Generic function with type inference | `fetchWithRetry<T>` infers `T` from `BodyValidator<T>` |
| Conditional type narrowing logic | `classifyError` — status-based branching |
| Type guard functions (`result is …`) | `isSuccess`, `isExhausted`, `isFatal` |
| Higher-order typed callbacks | `FetchAdapter` and `BodyValidator<T>` as typed function types |
| `strict: true` compliance (no `any`) | Entire file — `unknown` used for raw body, never `any` |
| Pure helper with optional config field | `computeDelay` reads `config.maxDelayMs?` with `?? Infinity` |
| Async/await with error handling | `fetchWithRetry` retry loop with `try/catch` around adapter call |

## Bonus

Extend `RetryConfig` with an optional `shouldRetry?: (error: ClassifiedError) => boolean` hook and honour it in `fetchWithRetry` so callers can override the default classification logic.
