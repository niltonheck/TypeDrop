# Typed Paginated API Client with Retry & Result Aggregation

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for an analytics dashboard that pulls records from a paginated REST API. Pages must be fetched sequentially, transient errors should be retried with exponential back-off, and the final result must be a typed aggregate — all without a single `any` or unsafe cast.

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
| Discriminated union (`Result<T,E>`) | `Ok`, `Err`, `Result` types; narrowing via `.tag` in tests |
| Generic type parameters | `Result<T,E>`, `Page<T>`, `FetchPage<T>`, `withRetry<T>`, `fetchAllPages<T>`, `aggregateRecords<T>` |
| Constrained generics (`T extends Record<string, unknown>`) | `aggregateRecords` signature |
| `keyof T` and index access | `groupKey: keyof T` and `items[groupKey]` inside `aggregateRecords` |
| Typed async callback / higher-order function | `FetchPage<T>` type alias; `withRetry` wrapping `() => Promise<Result<T,E>>` |
| Sequential async iteration (pagination loop) | `fetchAllPages` — `while` loop driven by `nextCursor` |
| Exponential back-off with `Promise`-based delay | `withRetry` — delay doubling on each retry |
| `Map<string, T[]>` data structure | Return type of `aggregateRecords` |
| `satisfies` / readonly modifiers | `readonly` fields on `Ok`, `Err`, `ApiError`, `Page` |
| No `any` / no type assertions | Enforced throughout all stubs and test harness |

## Bonus

Add a `fetchAllPagesConcurrent` variant that fetches up to N pages in parallel when cursors are known ahead of time, preserving item order in the result.
