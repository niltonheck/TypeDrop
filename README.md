# Typed Paginated API Response Aggregator

**Difficulty:** Medium

## Scenario

You're building the data-sync layer for a dashboard that pulls records from a paginated REST API. The fetcher must handle typed pages, collect results across all pages with a concurrency limit, and surface either a fully aggregated dataset or a structured `Result<T, E>` error — with zero `any`.

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
| Generic functions & types (`<T>`) | `aggregatePages<T>`, `Page<T>`, `ApiRecord<T>`, `PageFetcher<T>` |
| Discriminated union narrowing | `FetchError` kind field; `Result<T,E>` ok field in `aggregatePages` & `formatFetchError` |
| Result / Either monad pattern | `Ok<T>`, `Err<E>`, `Result<T,E>`, `ok()`, `err()` constructors |
| Exhaustive switch (no `any`) | `formatFetchError` must handle all 4 `FetchError` kinds |
| Concurrency limiting with `Promise.all` | Batching pages into chunks of `config.concurrency` in TODO-2 |
| Conditional control flow with typed errors | `failFast` branching in TODO-3 produces `Err<AggregateError>` vs records accumulation |
| Array sorting with typed comparator | `createdAt` ISO string sort in TODO-4 |
| `satisfies` / strict no-`any` compliance | Entire file compiles under `strict: true` with no `any` or `as` |

## Bonus

Add a `retries` field to `AggregateConfig` and retry each failed page up to that many times with exponential back-off before recording it as a failure.
