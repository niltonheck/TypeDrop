# Typed Paginated API Client with Cursor-Based Iteration

**Difficulty:** Medium

## Scenario

You're building the data-access layer for an analytics dashboard that streams records from a paginated REST API. The API uses cursor-based pagination, returns heterogeneous resource types, and can fail mid-stream — your client must expose a strongly-typed async generator that yields individual records, handles errors as typed Results, and supports early cancellation via AbortSignal.

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

| Skill | Where exercised |
|---|---|
| Discriminated union (`ok: true / false`) | `Ok<T>`, `Err<E>`, `Result<T,E>` — Req 1 |
| Discriminated union with 3 variants | `FetchError` (`kind` literal) — Req 2 |
| Generic type with optional field | `Page<T>` — Req 3 |
| Default generic parameter (`U = T`) | `PaginatedFetchOptions<T, U>` — Req 4 |
| `infer` in conditional type | `UnwrapPage<P>` — Req 5 |
| Mapped type + `readonly` + generic wrapping | `PageSummary<T>` — Req 6 |
| Async generator (`async function*`) | `paginatedFetch` — Req 7 |
| AbortSignal / DOMException handling | `paginatedFetch` requirements 7c–7e |
| Generic async generator with default type param | Function signature — Req 8 |
| Driving async generator to completion | `collectResults` — Req 9 |
| Type-guard functions (`result is Ok<T>`) | `isOk` / `isErr` — Req 10 |

## Bonus

Add a `maxPages?: number` option to PaginatedFetchOptions and enforce it inside the generator so iteration stops after that many pages even if more cursors remain.
