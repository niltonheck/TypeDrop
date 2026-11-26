# Typed Expense Splitter: Group Bills, Share Calculation & Settlement Summary

**Difficulty:** Easy

## Scenario

You're building the core logic for a group travel expense app. Friends log shared bills, the system splits costs by participant, and then produces a typed settlement summary showing exactly who owes whom — with the compiler enforcing every expense shape, split strategy, and debt record.

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

| Skill | Where in Code |
|---|---|
| Discriminated union (`kind` tag) | `SplitStrategy` — `"equal"` vs `"custom"` variants |
| `Record<K, V>` utility type | `shares` field in `"custom"` variant; return types of `computeShares` / `computeBalances` |
| Type narrowing via discriminant | Inside `computeShares` — switching on `expense.split.kind` |
| Mapped / aggregation logic with typed accumulator | `computeBalances` — reducing over `Expense[]` into `Record<string, number>` |
| Composing functions with shared types | `splitExpenses` composes `computeBalances` + `settleDebts` → `SplitSummary` |
| Strict null safety | All fields non-optional; accumulator access guarded with `?? 0` |
| `satisfies` / structural typing | `Expense` and `SplitSummary` enforce all required fields without escape hatches |

## Bonus

Extend `SplitStrategy` with a third `"byWeight"` variant where each participant has a numeric weight and shares are proportional (rounded to whole cents with remainder to the heaviest contributor).
