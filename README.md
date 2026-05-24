# Typed Paginated API Client with Cursor-Based Aggregation

**Difficulty:** Hard

## Scenario

You're building the data-ingestion layer for an analytics dashboard that pulls user activity events from a cursor-paginated REST API. Pages arrive as `unknown`; your client must validate each page, fan out concurrent fetches up to a concurrency limit, aggregate results through a typed single-pass reducer, and surface a strongly-typed report — with zero `any`.

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
| **Branded types** (`Cursor`, `PageSize`) | `makeCursor`, `makePageSize`, `PageFetcher` signature |
| **Discriminated union** (`Result<T,E>`) | All six public functions; error literal narrowing in `runIngestion` |
| **Mapped type over union** (`KindStats`) | `[K in EventKind]` produces exhaustive per-kind record |
| **`unknown` → typed narrowing** (no `as`) | `validatePage` must walk the unknown tree with type guards |
| **Generic interfaces** (`Page<T>`) | `validatePage` returns `Page<ActivityEvent>` |
| **Conditional/union error literal** | `runIngestion` return type unions `"InvalidPageSize" \| "FetchFailed"` |
| **Async concurrency with `Promise.all`** | `fetchAllPages` rolling-window fan-out |
| **Single-pass aggregation** | `aggregateEvents` forbids intermediate arrays/maps |
| **`satisfies` / exhaustive init** | `KindStats` must initialise all four `EventKind` keys |
| **Strict null handling** | `nextCursor: Cursor \| null`, `topRevenueUserId: string \| null` |


## Bonus

Extend `AggregationReport` with a `percentileP95DurationMs` field computed without sorting (hint: reservoir or histogram bucketing), keeping the entire pipeline strictly typed.
