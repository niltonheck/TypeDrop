# Typed Paginated API Client with Result Accumulation

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for an analytics dashboard that pulls records from a cursor-based REST API. Raw pages arrive as `unknown` from each fetch; your client must validate each page, accumulate typed records across pages, respect a configurable item cap, and surface per-page errors without aborting the entire run — all with zero `any`.

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
| Discriminated union (`Result<T,E>`, `PageError`) | `Result`, `PageError` types; returned by `validatePage` and `fetchAllPages` |
| `unknown` → typed narrowing (no `any`) | `validatePage` — narrowing `raw.data`, each record field, `metadata` values |
| Mapped / record types (`Record<string, string>`) | `AnalyticsRecord.metadata`, metadata validation loop |
| Generic utility type (`Result<T, E>`) | Defined once, used for both `ValidPage` and `string` error |
| Injected typed callback / abstraction | `PageFetcher` function type passed into `fetchAllPages` |
| Async iteration & sequential Promise chaining | `fetchAllPages` cursor loop with `await` per page |
| Exhaustive error variant handling | `cappedAt`, `kind` discrimination in accumulation logic |
| Interface design with optional semantics | `nextCursor: string \| null`, `cappedAt: number \| null` |

## Bonus

Extend `PageFetcher` to accept an `AbortSignal` and make `fetchAllPages` cancel remaining fetches when the signal fires, surfacing a new `PageError` kind `"aborted"`.
