# Typed Paginated API Client with Retry & Result Monad

**Difficulty:** Hard

## Scenario

You're building the data-access layer for an analytics dashboard that pulls records from a paginated third-party REST API. The API is unreliable — responses arrive as `unknown`, pages must be fetched concurrently up to a configurable limit, transient failures must be retried with exponential back-off, and every outcome must be surfaced through a typed `Result<T, E>` monad — with zero `any`.

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
| Discriminated union (`tag` field) | `Ok<T>`, `Err<E>`, `Result<T,E>`, `ApiError` |
| Generic type constructors | `ok<T>`, `err<E>`, `mapResult<T,U,E>` |
| User-defined type predicates | `validatePageResponse<T>` (internal item guard + structural check) |
| Conditional type narrowing | `mapResult`, `withRetry`, `renderApiError` switch/if branches |
| Generic utility types | `PageResponse<T>`, `FetchReport<T>`, `PaginatorOptions<T>` |
| `readonly` arrays | `PageResponse.items`, `FetchReport.items`, `FetchReport.errors` |
| Async / Promise orchestration | `withRetry`, `fetchAllPages` |
| Concurrency cap (no library) | `fetchAllPages` sliding-window pool |
| Exhaustive `never` check | `renderApiError` default branch |
| `unknown` → typed narrowing (no `any`) | `validatePageResponse`, `fetchAllPages` try/catch |

## Bonus

Extend `fetchAllPages` to accept an optional `onProgress` callback typed as `(completed: number, total: number) => void` and invoke it after each page settles (success or failure).
