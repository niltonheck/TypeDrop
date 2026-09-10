# Typed Expense Splitter with Settlement Calculation

**Difficulty:** Easy

## Scenario

You're building the core logic for a group-trip expense-splitting app. Participants log expenses paid on behalf of the group, and the app must compute each person's net balance and produce the minimal list of cash transfers needed to settle all debts — with the compiler enforcing every shape along the way.

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
| Branded / nominal types | `Cents` type + `asCents()` factory |
| Discriminated union (`kind` discriminant) | `SplitError` union with 3 variants |
| Union result type (`ok: true / false`) | `SplitResult` discriminated on `ok` |
| Type narrowing (no assertions) | `formatSummary` narrowing `result.ok` |
| `readonly` arrays & interfaces | All domain interfaces + function params |
| Utility type usage (`readonly`) | `Expense.splitAmong`, function signatures |
| Strict null avoidance | All logic paths covered without `any` or `as` |
| Greedy algorithm with typed output | Transfer settlement loop in `computeSplit` |

## Bonus

Extend `SplitError` with a fourth variant `"UNKNOWN_SPLIT_MEMBER"` that fires when a name in `splitAmong` is not in the participants list, and carry the offending name as a typed field.
