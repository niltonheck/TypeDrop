# Typed Book Lending Library: Checkout, Returns & Overdue Tracker

**Difficulty:** Easy

## Scenario

You're building the core logic for a neighbourhood book lending library. Members check out books for a fixed loan period, return them, and the system tracks which loans are overdue — with the compiler enforcing every book shape, loan record, status, and overdue report.

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
| Branded types | `CalendarDate` brand used in all date parameters and record fields |
| Discriminated unions | `LoanStatus` with `status` as the discriminant (`"checked-out"` / `"returned"` / `"overdue"`) |
| Type narrowing | Inside `markOverdue` — narrowing `LoanStatus` before accessing `dueDate` |
| Immutability / spread | `returnBook` and `markOverdue` must return new objects without mutation |
| `ReadonlyArray` | `getOverdueReport` parameter and `OverdueReport.overdueLoans` field |
| Utility types / Record shaping | Defining `Book` and `LoanRecord` with precise field types |
| Typed aggregation | `getOverdueReport` filters, sorts, and picks `mostOverdue` with full type safety |
| `satisfies` / structural typing | Mock data in tests must satisfy `Book` and `LoanRecord` exactly |


## Bonus

Extend `getOverdueReport` to also return a `byMember` field typed as `Record<string, LoanRecord[]>` that groups overdue loans by `memberId`.
