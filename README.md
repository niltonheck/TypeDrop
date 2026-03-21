# Typed Expense Report Aggregator

**Difficulty:** Easy

## Scenario

You're building the expense reporting module for a small business finance tool. Employees submit raw expense entries from a form, and your engine must validate them, tag each with a derived reimbursement status, and produce a grouped, fully typed summary — with zero `any`.

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
| Union types (`ExpenseCategory`, `ReimbursementStatus`, `ValidationError`) | Type definitions, `validateExpenseEntry`, `deriveStatus` |
| Discriminated unions (narrowing by `.kind`) | `deriveStatus` return branches, `ReimbursementStatus` union |
| `Result<T, E>` pattern (generic type alias) | `validateExpenseEntry` return type, `buildExpenseReport` internals |
| `unknown` → typed narrowing (no `any`) | `validateExpenseEntry` — all `RawExpenseEntry` fields are `unknown` |
| `Record<K, V>` utility type | `CategorySummary.byStatus` field |
| `ReadonlyArray` & `readonly` properties | `ExpenseReport`, `TaggedExpenseEntry` fields |
| `satisfies` / exhaustive status mapping | `buildExpenseReport` category summary accumulation |
| Iteration & single-pass aggregation | `buildExpenseReport` — groupBy category, sum, sort |
| Interface extension (`TaggedExpenseEntry extends ExpenseEntry`) | `TaggedExpenseEntry` definition |
| Type guard / narrowing in control flow | `validateExpenseEntry` field checks, `deriveStatus` comparisons |


## Bonus

Extend `buildExpenseReport` to also return a `perEmployee` map typed as `Record<string, { totalUSD: number; count: number }>`, computed in the same single pass as the category summaries.
