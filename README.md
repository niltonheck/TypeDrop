# Typed Paginated API Client with Result Chaining

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for an admin dashboard that queries a paginated REST API. Each endpoint returns a different resource shape, and the client must transparently walk pages, accumulate results, and surface typed errors — all without a single `any`.

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

| Skill | Where in Code |
|---|---|
| Discriminated union (`Result<T,E>`, `ApiError`) | `Result`, `Ok`, `Err`, `ApiError` types |
| Generic type parameters with constraints | `fetchAllPages<T>`, `groupById<T extends {id:string}>`, `pipeResults<T,E>` |
| Utility types & `readonly` fields | `Page<T>`, `User`, `AuditLog`, `ReadonlyMap` |
| Type narrowing (`typeof`, `in`, literal checks) | `validateUser`, `validateAuditLog`, `validatePage` |
| `PageFetcher<T>` function type alias | Req 4 type alias |
| Sequential async iteration (no `Promise.all`) | `fetchAllPages` loop |
| Functor/monad-style chaining | `mapResult`, `flatMapResult` |
| Single-pass accumulation with early exit | `pipeResults`, `fetchAllPages` |
| Runtime validation of `unknown` without `as` | `validateUser`, `validateAuditLog`, `validatePage` |
| Generic `Map`-based index | `groupById` → `ReadonlyMap<string, T>` |

## Bonus

Implement a generic `retryFetcher<T>(fetcher: PageFetcher<T>, maxRetries: number): PageFetcher<T>` wrapper that retries only on `NetworkError` up to `maxRetries` times before propagating the error.
