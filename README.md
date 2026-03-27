# Typed Student Grade Book Aggregator

**Difficulty:** Easy

## Scenario

You're building the reporting module for an online learning platform. Teachers submit raw grade entries for students across multiple subjects, and your aggregator must validate the entries, compute per-student summaries, and assign letter grades — all with fully typed inputs and outputs.

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
| **Branded types** | `ValidScore` (TODO 1) — nominal wrapper over `number` |
| **Mapped / utility types** | `ValidatedEntry` (TODO 2) — `Omit` + intersection or `Omit<RawGradeEntry, "score"> & { score: ValidScore }` |
| **Union types** | `LetterGrade` (domain type), `ValidScore \| null` return of `toValidScore` |
| **Type narrowing** | `toValidScore` (TODO 3) — narrows `number` → `ValidScore` without assertions |
| **Discriminated / constrained params** | `toLetterGrade` (TODO 4) — accepts only `ValidScore`, not plain `number` |
| **Iteration & groupBy aggregation** | `aggregateGrades` (TODO 5b–5c) — grouping, deduplication, averaging |
| **Sorting** | `subjects` sorted A→Z (TODO 5c), `summaries` sorted by `studentId` (TODO 5d) |
| **Result/output shape typing** | `GradeBookResult` separating valid summaries from errors |

## Bonus

Extend `GradeBookResult` with a `classAverage: number` field and a `topStudentId: string` field, computing both in a single additional pass over the generated summaries.
