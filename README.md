# Typed Pagination Aggregator with Cursor-Based Fetching

**Difficulty:** Medium

## Scenario

You're building the data-loading layer for an analytics dashboard that must pull all records from cursor-paginated REST APIs (think GitHub, Stripe, or Notion). Each endpoint returns a typed page of items plus an opaque next-cursor, and you need a generic aggregator that fetches all pages sequentially, enforces a per-fetch timeout via AbortController, and returns a strongly-typed settled result — collected items or a structured error — without any unsafe escape hatches.

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
| Generic types (`Page<T>`, `PaginatorConfig<T>`, `AggregatorResult<T>`) | All three type definitions |
| Discriminated unions (`AggregatorResult`, `FetchError`) | `AggregatorResult` & `FetchError` type definitions |
| Type narrowing via discriminant (`status`, `kind`) | `aggregatePages` return paths & test assertions |
| `AbortController` + `AbortSignal` integration | `aggregatePages` per-page timeout logic |
| `Promise` racing for timeout | `aggregatePages` — racing fetch against a timer abort |
| Conditional/exhaustive error handling | All four `FetchError` kinds handled in `aggregatePages` |
| Generic function with inferred `T` | `aggregatePages<T>` and `paginatorFor<T>` signatures |
| Builder/factory pattern with defaults | `paginatorFor` optional params with defaults |
| `unknown` → typed narrowing without `any` | `transform` callback in `paginatorFor` |
| Sequential async iteration (no `Promise.all`) | Page-by-page loop in `aggregatePages` |

## Bonus

Add an optional external `AbortSignal` parameter to `aggregatePages` so callers can cancel the entire aggregation mid-flight (e.g. user navigates away), and surface it as the `"aborted"` error kind.
