# Typed Expense Report Summarizer

**Difficulty:** Easy

## Scenario

You're building the core logic for a corporate expense management tool. Finance teams upload raw expense entries and need a strongly-typed summary grouped by category, with per-category totals and an overall grand total — all shapes enforced by the compiler.

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
| Union type (`ExpenseCategory`) | Domain type definition; used as keys throughout |
| Mapped type (`PartialCategoryMap<V>`) | Requirement 1 — generic mapped type with optional values |
| Conditional type for field filtering (`NumericExpenseFields`) | Requirement 2 — `as` key remapping with `extends number` |
| `Record<K, V>` utility type | `ExpenseReport.byCategory` field |
| Generic function return type inference | `extractCategories` — must return `ExpenseCategory[]` without widening |
| `Partial` / optional mapped keys | `PartialCategoryMap` used in `groupByCategory` return |
| Iteration & aggregation (`reduce` / loops) | `summarizeCategory`, `buildExpenseReport` |
| Null-safe handling (`string \| null`) | `earliestDate` / `latestDate` in `ExpenseReport` |
| Strict mode compliance (no `any`) | All stubs and test harness |


## Bonus

Extend `ExpenseReport` with a `topSpender` field typed as `{ submittedBy: string; totalUSD: number }` and compute it inside `buildExpenseReport` using a single additional pass.
