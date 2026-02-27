# Typed Paginated API Client with Retry & Concurrency

**Difficulty:** Hard

## Scenario

You're building a typed data-ingestion pipeline for an analytics platform. Remote REST endpoints return paginated results, requests can fail transiently, and multiple endpoints must be fetched in parallel — but with a concurrency cap to avoid hammering the servers.

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
| Discriminated union (`ok`/`false` tag) | `Result<T,E>`, `Ok<T>`, `Err<E>`, `ApiError` |
| Generic type parameters | `Result<T,E>`, `PagedResponse<T>`, `FetchPage<T>`, all five functions |
| Type narrowing via discriminant | `withRetry` — branching on `result.ok` and `error.kind` |
| Branded / tagged union for errors | `ApiError` — `"transient"` vs `"permanent"` variants |
| Utility / mapped types | `IngestResult<T>` composes `Result` with inline object types |
| `ReadonlyArray` for immutability | `fetchWithConcurrencyLimit`, `ingestEndpoints` parameters |
| Concurrency limiting (no Promise.all over full set) | `fetchWithConcurrencyLimit` — sliding-window pool |
| Sequential async iteration | `fetchAllPages` — follows `nextPage` chain |
| Retry with delay | `withRetry` — transient vs permanent branching + `setTimeout` |
| End-to-end composition of typed abstractions | `ingestEndpoints` wires all five helpers together |


## Bonus

Extend ingestEndpoints to accept an optional AbortSignal that, when triggered, cancels all in-flight page fetches and immediately returns whatever results have already settled.
