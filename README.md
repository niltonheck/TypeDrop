# Typed Task Queue Prioritizer

**Difficulty:** Easy

## Scenario

You're building the task scheduling module for a background job runner. Raw task definitions arrive as `unknown` from a job submission API; your module must validate them into strongly-typed `Task` records, sort them by priority and submission time, and return a fully-typed `ScheduleResult` — with zero `any`.

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
| `unknown` → typed narrowing (no `any`) | `validateTask`: checking each field with `typeof` guards |
| Discriminated / union type (`Priority`) | `priority` field validation against `PRIORITY_ORDER` |
| `Record<string, string>` typing | `metadata` validation and `countByPriority` accumulation |
| `as const` tuple for exhaustive membership check | `PRIORITY_ORDER` used to validate priority values |
| Typed return union (`Task \| string`) | `validateTask` return type |
| Interface composition (`ScheduleResult`) | `buildSchedule` return value construction |
| Array sorting with multi-key comparator | Sorting by priority tier index then `submittedAt` |
| `Record<Priority, number>` accumulation | `countByPriority` tallying in `buildSchedule` |

## Bonus

Add a function overload for `buildSchedule` so that when called with an empty array literal `[]` the return type is `ScheduleResult & { queue: [] }`.
