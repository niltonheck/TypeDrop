# Typed GroupBy Aggregator with Summary Statistics

**Difficulty:** Easy

## Scenario

You're building the reporting layer for a sales dashboard that receives a flat list of transaction records and must group them by a chosen key, then compute per-group summary statistics (count, sum, min, max, average) — all without losing the original record's type.

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

| TypeScript Skill | Where in Code |
|---|---|
| Constrained generics (`T extends object`, `K extends keyof T`) | `groupBy` signature |
| Mapped types with `as` key remapping | `Group["stats"]` — `[F in keyof T as T[F] extends number ? F : never]` |
| Conditional types (`T[F] extends number ? F : never`) | `Group["stats"]` and `NumericKeys<T>` |
| `Record<string, …>` utility type | `GroupByResult<T, K>` return type |
| Strict property access (no `any`, no `as`) | Throughout `groupBy` implementation |
| Interface design with required fields | `NumericSummary`, `Transaction` |
| `@ts-expect-error` compile-time assertions | Test harness type checks |
| Derived/exported utility type alias | `NumericKeys<T>` |

## Bonus

Extend `groupBy` to accept an optional `sortBy` parameter — a numeric key of T — and return each group's `items` sorted ascending by that field, with the return type updated to reflect the constraint that `sortBy` must be a `NumericKeys<T>`.
