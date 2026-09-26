# Typed Expense Splitter

**Difficulty:** Easy

## Scenario

You're building the core logic for a group expense-splitting app (think Splitwise). Friends log shared expenses, and the app must calculate how much each person owes or is owed — producing a strongly-typed settlement summary the compiler fully understands.

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


| TypeScript Skill | Where It Appears |
|---|---|
| Discriminated union narrowing (`kind` field) | `computeBalances` — switching on `SplitRule.kind` |
| `Record<K, V>` utility type | `Balances`, `SplitRule.participants`, `computeBalances` return type |
| Template literal return type | `formatSettlement` return type annotation |
| Interface design & composition | `Expense`, `Settlement`, `SplitSummary` |
| `strict: true` — no implicit `any` | All four functions must compile cleanly |
| Type alias vs interface distinction | `Balances` (alias) vs `Settlement`, `SplitSummary` (interfaces) |
| Explicit return type annotation | Required on `splitExpenses` (`SplitSummary`) |
| Union type (`SplitRule`) | Defined and narrowed throughout `computeBalances` |


## Bonus

Extend `SplitSummary` with a `perPersonSummary` field typed as `Record<Participant, { paid: number; owes: number; net: number }>` and populate it inside `splitExpenses`.
