# Typed Paginated API Client

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for an analytics dashboard that consumes a paginated REST API. Raw page responses arrive as `unknown` from the network; your client must validate each page, lazily accumulate results with a configurable concurrency limit, and surface a discriminated-union outcome per fetch — with zero `any`.

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
| Generic interfaces (`PageResponse<T>`) | §1 — `PageResponse<T>` definition |
| Discriminated union types (`FetchResult<T>`) | §2 — three-variant union with `status` discriminant |
| Type narrowing via `instanceof` and structural checks | §3 — `validatePageResponse`, §4 — `fetchPage` error catch |
| User-defined type guard parameter `(item: unknown) => item is T` | §3 signature, §5 forwarded to `fetchPage` |
| `unknown` → typed narrowing without `any` | §3 — raw payload validation logic |
| Generic utility type composition (`FetchAllSummary<T>`) | §5 return type |
| `Promise.all` with batched concurrency slices | §5 — remaining pages fetched in parallel batches |
| Sequential then parallel async orchestration | §5 — page 1 first, then batched remainder |
| Strict null / exhaustiveness in result accumulation | §5 — filtering "ok" results for `items` array |

## Bonus

Extend `fetchAllPages` to accept an optional `AbortSignal` in `FetchAllOptions` and propagate cancellation so that any in-flight batch is abandoned and a `'failed'` result with message `"Aborted"` is recorded for each unstarted page.
