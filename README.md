# Typed Paginated API Client with Retry, Cancellation & Result Aggregation

**Difficulty:** Hard

## Scenario

You're building the data-fetching core for an analytics dashboard that streams paginated reports from a REST API. Each page must be fetched with exponential-backoff retry, the entire operation must be cancellable via an AbortSignal, and every page's records must be aggregated into a single typed summary — with the compiler enforcing every fetch shape, error variant, and aggregation contract.

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

| Skill exercised | Where in the code |
|---|---|
| Branded types (`Brand<T, B>`) | `PageCursor` — prevents raw strings being passed as cursors |
| Discriminated union narrowing | `FetchError` — every `kind` branch must be handled in retry logic |
| Generic `Result<T, E>` monad | Return type of `fetchPageWithRetry` and `fetchAllPages` |
| Recursive type (`MaxRetriesExceeded`) | `FetchError.lastError: FetchError` — self-referential union member |
| `ReadonlyArray` & `readonly` propagation | `RetryConfig.nonRetryableKinds`, `ReportPage.records`, `ReportRecord` fields |
| `Record<K, V>` with union key | `byRegion: Record<ReportRecord["region"], RegionSummary>` |
| Injected typed function dependency | `PageFetcher` type used as a parameter, enabling mock injection in tests |
| Exponential back-off with `AbortSignal` | `fetchPageWithRetry` — async delay + signal pre-check before each attempt |
| Pure aggregation with `reduce` / `Map` | `aggregateRecords` — single-pass fold, no side-effects |
| Sequential async orchestration | `fetchAllPages` — `while` loop with `await`, cursor threading |

## Bonus

Add a generic `mapResult<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E>` utility and use it inside `fetchAllPages` to round all `avgBounceRate` values to 4 decimal places before returning — without any type assertions.
