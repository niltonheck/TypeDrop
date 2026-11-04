# Typed API Response Paginator with Result Accumulation

**Difficulty:** Medium

## Scenario

You're building the data-sync layer for a dashboard that ingests records from a paginated REST API. Pages arrive one at a time, each fetch can fail independently, and the final accumulation must be fully typed — distinguishing partial successes from total failures so the UI can render the right state.

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
| Discriminated union (`status: "ok" \| "err"`) | `Result<T,E>`, `ok()`, `err()` |
| Generics with multiple type parameters | `paginateAll<TItem>`, `filterItems<TItem, TNarrowed>`, `PageFetcher<TItem>` |
| `extends` constraint on generic | `TNarrowed extends TItem` in `filterItems` |
| Type guard / narrowing | `filterItems` guard parameter `(item: TItem) => item is TNarrowed` |
| Branded / nominal types | `ValidPageNumber` with `unique symbol`, `toValidPageNumber` |
| Sequential async with error capture | `paginateAll` — no throw, all errors in `failures` |
| Discriminated literal outcome | `PaginationSummary.outcome: "full" \| "partial" \| "empty"` |
| `ReadonlyArray` usage | `ApiPage.items`, `PaginationSummary.items`, `filterItems` return |

## Bonus

Extend `paginateAll` to accept an optional `concurrency` parameter (default 1) that fetches up to N pages in parallel using `Promise.allSettled`, while still preserving item order by page number in the final summary.
