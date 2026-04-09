# Typed API Pagination Crawler

**Difficulty:** Medium

## Scenario

You're building the data-sync layer for a SaaS dashboard that must pull all records from a paginated REST API. Pages arrive as unknown JSON; your crawler must validate each page, fetch all pages concurrently up to a limit, and aggregate the results into a fully typed report — with zero `any`.

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
| Type guard with `value is T` | `isProductCategory`, `validateProduct`, `validateRawPage` |
| Discriminated union narrowing | `Result<T,E>` / `CrawlError` consumed in `crawlAllPages` |
| `Record<K, V>` with exhaustive keys | `CategoryReport = Record<ProductCategory, CategoryStats>` |
| Generic function with type parameter | `withConcurrencyLimit<T>` |
| `ReadonlyArray<T>` input typing | `withConcurrencyLimit` parameter |
| Concurrency limiting (Promise queue) | `withConcurrencyLimit` implementation |
| Unknown → typed narrowing at runtime | `validateProduct`, `validateRawPage` |
| Result/Either error pattern | `Ok<T>`, `Err<E>`, `Result<T,E>` threaded through crawler |
| Exhaustive category initialisation | Zero-init all four `ProductCategory` keys in `crawlAllPages` |
| Async error containment (no throws) | `crawlAllPages` catch blocks → `CrawlError` accumulation |

## Bonus

Extend `crawlAllPages` to accept an optional `AbortSignal` and record a `kind: "timeout"` CrawlError for any page fetch that is cancelled mid-flight.
