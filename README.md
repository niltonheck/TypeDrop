# Typed Retry & Concurrency-Limited Task Runner

**Difficulty:** Medium

## Scenario

You're building the job-execution engine for a data-pipeline orchestrator. Individual tasks are async functions that can fail transiently, so the runner must retry them with exponential back-off, enforce a global concurrency cap so the host isn't overwhelmed, and return a fully-typed settled report for every task — success value or final error — without losing the original task's return type.

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

| Skill | Where in code |
|---|---|
| Discriminated union types (`status: "fulfilled" \| "rejected"`) | `TaskSuccess<T>`, `TaskFailure`, `TaskReport<T>` |
| Generic functions with type parameter inference | `withRetry<T>`, `runWithConcurrencyLimit<T>` |
| Mapped types over tuple `keyof` | `ReportFor<Tasks>` |
| Conditional types with `infer` | `ReportFor` — `Tasks[K] extends Task<infer T>` |
| `unknown` error handling (no `any`) | `TaskFailure.error: unknown`, catch clauses |
| Promise concurrency patterns | Worker-loop pattern in `runWithConcurrencyLimit` |
| Exponential back-off arithmetic | `withRetry` delay calculation |
| Type narrowing via discriminant | Test harness `if (report.status === "fulfilled")` |

## Bonus

Add a heterogeneous tuple overload of `runWithConcurrencyLimit` that accepts `readonly [...Tasks]` and returns `Promise<ReportFor<Tasks>>`, preserving each task's individual return type at its original position.
