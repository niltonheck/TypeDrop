# Typed Paginated API Client with Result Accumulation

**Difficulty:** Medium

## Scenario

You're building the data-sync engine for an analytics dashboard that pulls records from a paginated REST API. Each page of results must be fetched sequentially, validated from `unknown` into a typed shape, and accumulated into a single `PagedResult<T>` — stopping early on fatal errors and surfacing per-page failures without losing successfully fetched data.

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
| Branded / nominal types | `PageToken` definition |
| Discriminated union | `SyncError = ValidationError \| FetchError` |
| Mapped types | `Schema<T> = { [K in keyof T]: string }` |
| Generic type-guard (`raw is T`) | `validateRecord<T>` signature & return |
| `Record<string, unknown>` narrowing (no `any`) | Inside `validateRecord` implementation |
| Generic async function with explicit return type | `fetchAllPages<T>(...): Promise<PagedResult<T>>` |
| Sequential async iteration (not `Promise.all`) | Loop with `await fetcher(token)` |
| Error accumulation without throwing | `try/catch` inside loop, push `FetchError` then `break` |
| Utility type usage | `PagedResult<T>` fields, `Fetcher` type alias |


## Bonus

Extend `fetchAllPages` to accept an optional `maxPages` limit and, when that limit is reached, include a synthetic `FetchError` with `message: "maxPages limit reached"` in the result.
