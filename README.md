# Typed Expense Report: Categorisation, Budgets & Summary Rollup

**Difficulty:** Medium

## Scenario

You're building the expense-management core for a finance tool. Raw expense submissions arrive as `unknown` JSON, must be validated into strongly-typed records, checked against per-category budgets, and rolled up into a typed summary report — with the compiler enforcing every shape, status flag, and aggregation result.

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
| Discriminated union (`Result<T>`) | `Result<T>` type + `parseExpense` return type |
| Discriminated union with variant-specific fields (`BudgetStatus`) | `BudgetStatus` type + `evaluateBudget` return type |
| Discriminated union (`ParseError` kinds) | `ParseError` type + `parseExpense` error paths |
| `unknown` → typed narrowing / runtime validation | `parseExpense` implementation |
| Generic type parameter (`Result<T>`) | `Result<T>` definition and `parseExpense` |
| `readonly` array parameters | `evaluateBudget`, `buildSummary` signatures |
| `satisfies` operator | Test harness TEST 5 |
| Union type literal (`ExpenseCategory`) | `ExpenseCategory` type + category validation |
| Exhaustiveness check via `never` | `formatBudgetStatus` stretch goal |
| Mapped/conditional aggregation logic with full type safety | `buildSummary` implementation |


## Bonus

Add a `groupBySubmitter` function typed as `(expenses: readonly Expense[]) => Record<string, Expense[]>` that groups valid expenses by `submittedBy`, using a `Record` return type inferred entirely from the data.
