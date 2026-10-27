# Typed Paginated API Client with Result Accumulation

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for an analytics dashboard that pulls reports from a paginated REST API. The client must walk pages automatically, accumulate results into typed summaries, and surface per-page errors without losing successfully fetched data.

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
| Branded / opaque types | `PageCursor` brand, `toPageCursor` factory |
| Discriminated unions | `PageResult = PageSuccess \| PageError`, narrowed in `fetchAllPages` |
| Conditional types (distributive) | `PickRows<R, C>` — TODO A |
| Mapped types | `SummaryDisplay` over `ReportCategory` keys — TODO B |
| `Record` utility type | `CategorySummary` definition |
| Explicit return-type annotations | `buildCategorySummary`, `formatSummary`, `fetchAllPages` |
| Single-pass aggregation | `buildCategorySummary` — TODO C |
| Sequential async iteration | `fetchAllPages` cursor-following loop — TODO E |
| Injected typed function dependency | `FetchPage` callback type, passed into `fetchAllPages` |
| `strict: true` / no `any` | Enforced throughout all stubs |

## Bonus

Extend `fetchAllPages` to accept an optional `onProgress` callback typed as `(page: PageSuccess, pageIndex: number) => void` that is called after each successful page, without using `any`.
