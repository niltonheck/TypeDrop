# Typed Paginated API Client with Cursor-Based Iteration & Result Monad

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for a feed-based social platform. Timelines, notifications, and search results all arrive in cursor-paginated API responses — your client must iterate pages lazily, surface typed success/failure results per page, and aggregate items across pages into a single strongly-typed collection without ever widening to `unknown` unsafely.

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
| Discriminated union (`status: "ok" \| "err"`) | `Result<T,E>`, `isOk` type guard |
| Generic type parameters (`<T>`, `<A,B>`) | `PageFetcher<T>`, `fetchAllPages`, `mapFetcher`, `withRetry` |
| Branded / nominal types via `unique symbol` | `Cursor` type & `makeCursor` |
| Type guard (`result is Ok<T>`) | `isOk` function |
| Utility / mapped types (`ReadonlyArray`, `readonly`) | `Page<T>`, `FetchAllResult<T>` |
| Higher-order async functions | `mapFetcher`, `withRetry` |
| Sequential async iteration (cursor pagination) | `fetchAllPages` loop |
| Conditional error propagation | `withRetry` retryable check, `fetchAllPages` stop-on-error |

## Bonus

Implement a `takePagesWhile` variant of `fetchAllPages` that accepts a predicate `(page: Page<T>) => boolean` and stops early (without error) when the predicate returns false.
