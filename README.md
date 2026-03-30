# Typed API Response Paginator

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for an analytics dashboard that consumes a paginated REST API. The client must fetch pages sequentially or in parallel up to a concurrency limit, validate each raw response at runtime, and aggregate all records into a typed `Result<T, E>` — with clean handling for partial failures.

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
| Discriminated union (`Result<T,E>`) | `Result` type, all return sites |
| Discriminated union error hierarchy | `PaginatorError` with `kind` tag |
| Runtime narrowing of `unknown`/`Record<string,unknown>` | `validateRecord`, `validateEnvelope` |
| Generics with no `any` | `withConcurrency<T>` |
| `ReadonlyArray` parameter | `withConcurrency` tasks param |
| Concurrency limiting (Promise batching) | `withConcurrency` implementation |
| Typed async composition | `paginateAll` using `withConcurrency` + `FetchPage` |
| Partial failure aggregation | `paginateAll` collecting both errors and valid records |
| `satisfies` / exhaustive pattern matching | Error-kind handling in `paginateAll` |
| Array sort on typed objects | Timestamp sort in `paginateAll` |


## Bonus

Extend `paginateAll` to accept an optional `AbortSignal` in the config and short-circuit any pending fetches when the signal fires, returning a `{ kind: "partial" }` result with whatever records were collected before cancellation.
