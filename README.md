# Typed Task Priority Queue

**Difficulty:** Easy

## Scenario

You're building the task management feature for a lightweight project tool. Users submit raw task entries, and your engine must validate them, assign a computed urgency tier, and serve them back in priority order — all with zero `any`.

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
| Union types (`RawPriority`, `TaskStatus`, `UrgencyTier`) | Type declarations, `computeUrgency` signature |
| `Result<T, E>` / discriminated union narrowing | `validateTask` return type & callers |
| `unknown` narrowing without `as` or `any` | `validateTask` input parameter |
| Mapped / literal type `Record<UrgencyTier, Task[]>` | `groupByUrgency` return type |
| Discriminated union exhaustiveness (`ValidationErrorKind`) | `validateTask` error construction |
| Typed array sorting with multi-key comparator | `buildPriorityQueue` sort step |
| Interface design with computed fields | `Task.urgencyTier` |
| Utility accumulation pattern (collect all errors) | `buildPriorityQueue` loop |


## Bonus

Extend `buildPriorityQueue` to accept a generic `filters` parameter typed as `Partial<Pick<Task, 'status' | 'priority'>>` and apply them before sorting, without widening any return types.
