# Typed Expense Report Categorizer

**Difficulty:** Easy

## Scenario

You're building the finance module for a small startup's internal tools. Employees submit raw expense entries, and your job is to validate, categorize, and summarize them — with the compiler enforcing every category label, status field, reimbursement rule, and summary shape.

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

| Skill | Where in the code |
|---|---|
| Union type narrowing (`ok: true/false`) | `validateExpense` return type & callers in test harness |
| Discriminated union (`ValidationFailure.reason`) | `ValidationFailure` type + failure collection loop |
| `Record<K, V>` with exhaustive keys | `CategoryCaps = Record<ExpenseCategory, number>` |
| `Partial<Record<K, V>>` for optional accumulation | `EmployeeSummary.byCategory` |
| String → union narrowing without `as` | Category validation inside `validateExpense` |
| `satisfies` / `const` for cap defaults | `DEFAULT_CAPS` constant |
| Generic utility types (`Pick`, `Record`) | `CategoryCaps`, `byCategory` shapes |
| Strict null safety | `Date` parsing, optional category lookup |

## Bonus

Extend `buildEmployeeSummaries` to accept a second optional `caps: CategoryCaps` parameter (defaulting to `DEFAULT_CAPS`) and make the function generic enough that callers can pass organisation-specific caps without losing type safety.
