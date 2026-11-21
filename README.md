# Typed HTTP API Client: Paginated Fetch, Response Validation & Retry

**Difficulty:** Medium

## Scenario

You're building the data-fetching core for a dashboard that pulls paginated records from a REST API. Raw responses arrive as `unknown`, must be validated into strongly-typed pages, retried on transient failures with a typed retry policy, and aggregated into a single typed collection — all enforced by the compiler with no escape hatches.

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
| Discriminated union narrowing (`ApiError["kind"]`) | `fetchPageWithRetry` — switching on `error.kind` to decide retry vs. immediate return |
| Generic types (`Page<T>`, `Result<T,E>`, `Ok<T>`, `Err<E>`) | `parseUserPage` return type, `fetchPageWithRetry`, `fetchAllUsers` |
| `unknown` → typed narrowing via validator helpers | `parseUserPage` — must use `validatePageEnvelope` + `validateUser` without casting |
| `Partial<Record<K, V>>` mapped type | `groupUsersByRole` return type, `UserSummary.byRole` |
| Typed error hierarchy & exhaustive handling | `fetchPageWithRetry` R7/R8/R9 — retryOn check, exhausted wrapping |
| Sequential async iteration with early exit | `fetchAllUsers` — page-by-page loop, stop on first Err |
| Result monad chaining (no throw) | All four functions — only `ok()`/`err()` constructors used |
| Const enum-like union literals (`User["role"]`) | `groupUsersByRole`, `summariseUsers` |
| Interface design & `satisfies`-compatible shapes | `UserSummary`, `RetryPolicy`, `PageRequest` |
| Linear backoff with typed delay injection | `fetchPageWithRetry` R7 — `delay(policy.baseDelayMs * attempt)` |


## Bonus

Extend `fetchAllUsers` to accept a `concurrency` option (default 1) and fetch up to that many pages in parallel using `Promise.all`, while still preserving page order in the final array.
