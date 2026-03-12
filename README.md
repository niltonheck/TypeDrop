# Typed Expense Report Summariser

**Difficulty:** Easy

## Scenario

You're building the finance module for a small business app. Raw expense entries arrive as unknown JSON from a mobile upload, and you must validate them, categorise them, and produce a per-category summary — all with zero `any` and fully typed results.

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
| Discriminated union (`Result<T,E>`) | `Result` type definition (Requirement 1) |
| `unknown` → typed narrowing | `validateExpense` — field-by-field checks without `any` |
| Type guard (`value is ExpenseCategory`) | `isExpenseCategory` return type annotation |
| `interface` design with `unknown` field | `ValidationError.rawValue: unknown` |
| `Map<K, V>` with typed keys | `groupByCategory` return type |
| Utility / iteration patterns | `buildReport` — reduce over Map entries, sort |
| Collect-all-errors validation pattern | `validateExpense` accumulates `ValidationError[]` |
| Strict null safety | All object field accesses guarded before use |


## Bonus

Extend `ExpenseReport` with a `topSpender: string` field — the `submittedBy` value whose expenses sum to the highest total — and compute it inside `buildReport`.
