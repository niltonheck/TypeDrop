# Typed Paginated API Client with Cursor-Based Pagination

**Difficulty:** Hard

## Scenario

You're building the data-access layer for an analytics dashboard that fetches large datasets from a REST API using cursor-based pagination. The client must be fully generic over the resource shape, enforce that every page request and response is structurally consistent, accumulate results across pages with a typed concurrency limit, and surface every failure through a discriminated Result type — the compiler must make it impossible to misuse the cursor, mix up resource types, or silently swallow errors.

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
| Branded types (`Cursor`) | `makeCursor`, `PageFetcher<T>` parameter, `Page<T>.nextCursor` |
| Generic interfaces & type aliases | `Page<T>`, `PageFetcher<T>`, `PaginatedClientOptions<T>`, `AccumulatedResult<T>` |
| Discriminated union (Result) | `Result<T, E>` — `ok: true` / `ok: false` variants |
| Discriminated union (FetchError) | `NetworkError`, `ParseError`, `CursorError`, `TimeoutError` + `FetchError` union |
| Exhaustive narrowing with `never` | `exhaustiveFetchError` — switch over all `FetchError` kinds |
| Generic async function | `fetchAllPages<T>` — typed end-to-end without `any` |
| `Promise.race` for timeout | REQ-5 — racing fetcher vs. a `setTimeout`-based rejection |
| Concurrency limiting with `Promise.all` | REQ-4 — chunked / sliding-window batch execution |
| Optional callback typing | `onPageFetched?: (pageIndex: number, items: T[]) => void` |
| Type narrowing in catch blocks | REQ-6 — checking `kind` property to classify thrown errors |

## Bonus

Extend `fetchAllPages` to accept an optional `AbortSignal` in `PaginatedClientOptions` and honour cancellation — if the signal fires, resolve immediately with a new `AbortError` FetchError variant instead of continuing to the next batch.
