# Typed Paginated API Client with Aggregation

**Difficulty:** Medium

## Scenario

You're building the data-access layer for an analytics dashboard that pulls records from a paginated REST API. The client must handle cursor-based pagination transparently, aggregate results in a single pass, and surface typed summaries — the compiler must enforce that every page shape, cursor token, and aggregation result matches the schema declared up front.

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
| Branded types (`Brand<B, T>` phantom intersection) | `Brand<B,T>`, `SaleId` |
| Generic type aliases (`Page<T>`, `FetchPage<T>`) | Requirements 1–2 |
| Generic interface (`Aggregator<T, S>`) | Requirement 4 |
| Generic async function (`fetchAllPages<T>`) | Requirement 3 |
| Multi-type-param generic (`paginatedAggregate<T, S>`) | Requirement 5 |
| Union types as field types (`region`, `currency`) | `SaleRecord` |
| `Record<K, V>` utility type | `countByRegion` in `SaleSummary` |
| Indexed access type (`SaleRecord["region"]`) | `countByRegion` key type |
| Nullable field typing (`largestSale: SaleRecord \| null`) | `SaleSummary` |
| Single-pass aggregation pattern | `paginatedAggregate` implementation |
| No `any`, no unsafe `as` in challenge stubs | Entire `challenge.ts` |

## Bonus

Extend `paginatedAggregate` to accept an optional `concurrencyLimit` that pre-fetches up to N pages in parallel when cursors are known ahead of time.
