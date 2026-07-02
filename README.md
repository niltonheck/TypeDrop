# Typed Expense Report Aggregator

**Difficulty:** Easy

## Scenario

You're building the expense-report processing module for a finance dashboard. Raw expense entries arrive as `unknown` from a form submission API; your module must validate them into strongly-typed `Expense` records, group them by category, compute per-category and overall totals, and return a fully-typed `ExpenseReport` — with zero `any`.

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
| Type guard with `value is T` narrowing | `isISODateString`, `isExpenseCategory` |
| Branded / nominal types (`ISODateString`) | `ISODateString` type + `isISODateString` guard |
| Discriminated union (`ok: true \| false`) | `ExpenseParseResult` type + `parseExpense` return |
| `unknown` → typed narrowing (no `any`) | `parseExpense` — all field checks on `raw` |
| `const` tuple to derive union membership | `isExpenseCategory` — readonly category array |
| `Map<K, V>` for efficient grouping | `buildExpenseReport` — per-category accumulation |
| Single-pass aggregation with `reduce`/`Map` | `buildExpenseReport` — totals computed in one pass |
| Array sorting with typed comparator | `buildExpenseReport` — A-Z sort of `byCategory` |
| Collecting all errors before returning | `parseExpense` — push to `errors[]` then branch |
| Interface composition & readonly fields | `Expense`, `CategorySummary`, `ExpenseReport` |

## Bonus

Add a generic `Result<T, E>` type and refactor `ExpenseParseResult` to use it, then add a `mapReport` function that accepts a `transform: (e: Expense) => Expense` and returns a new `ExpenseReport` with all valid expenses transformed.
