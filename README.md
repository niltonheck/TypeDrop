# Paginated API Client with Typed Result Accumulation

**Difficulty:** Hard

## Scenario

You're building a typed API client for an analytics platform that exposes cursor-based paginated endpoints. The client must traverse all pages concurrently (up to a configurable limit), accumulate results into a strongly-typed aggregate, and surface per-page errors without aborting the entire fetch — all without a single `any` or type assertion.

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
| **Branded types** with `unique symbol` | `Cursor`, `EndpointPath`, `brand<T>` helper, `makeCursor`, `makeEndpointPath` |
| **Generic constraints** (`K extends string \| number \| symbol`) | `aggregateBy<T, K>` |
| **Discriminated unions** | `FetchResult<T>` (`ok: true/false`), `AccumulatedResult<T>` (`ok: true/false`) |
| **Conditional narrowing** | `handleAccumulatedResult` — TypeScript must narrow `result` in each branch |
| **Higher-order generic functions** | `PageFetcher<T>`, `withConcurrencyLimit<R>`, `fetchAllPages<T>` |
| **Concurrency limiting** (Promise pool) | `withConcurrencyLimit` — at most `limit` in-flight at once |
| **Cursor-based pagination** traversal | `fetchAllPages` — chains pages via `nextCursor`, stops when absent |
| **Partial failure collection** | `fetchAllPages` — failed pages recorded in `errors`, traversal continues |
| **Utility / mapped types** | `FetchAllOptions` optional fields, `AccumulatedResult` combining ok/error shapes |
| **Result order preservation** | `withConcurrencyLimit` returns results indexed to original task order |


## Bonus

Extend `fetchAllPages` to accept an optional `AbortSignal`; when the signal fires, stop enqueuing new pages and resolve immediately with whatever has been collected so far.
