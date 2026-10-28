# Typed Library Book Checkout Tracker

**Difficulty:** Easy

## Scenario

You're building the checkout desk software for a public library. Books are checked out and returned by members, and you need to track availability, compute overdue fines, and produce a per-member borrowing summary — with the compiler enforcing every status, field name, and summary shape.

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
| Branded / nominal types (`ISBN`, `MemberID`) | Type definitions + `toISBN` / `toMemberID` helpers |
| Discriminated union narrowing (`Book` status) | `isOverdue` type predicate, `calculateFine` switch/if |
| Type predicate (`book is CheckedOutBook`) | `isOverdue` return type |
| Utility / readonly types (`Readonly` fields) | All domain types use `readonly` |
| Aggregation with `Map` / `Record` | `buildLibraryReport` per-member grouping |
| `satisfies` / exact shape enforcement | `LibraryReport` and `MemberSummary` return types |
| No `any` / no unsafe assertions | Enforced throughout stubs and test harness |
| Date arithmetic (ISO string comparison) | `calculateFine` days-overdue calculation |

## Bonus

Extend `MemberSummary` with a `status` field typed as `"good standing" | "overdue" | "suspended"` (suspended when `totalFinesDue > 20`) and derive it with a conditional type rather than an `if` statement.
