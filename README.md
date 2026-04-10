# Typed Task Queue Scheduler

**Difficulty:** Easy

## Scenario

You're building the background job runner for a productivity app. Raw task definitions arrive from a local database as unknown blobs; your scheduler must validate them, sort them by priority and deadline, and return a fully typed execution plan — with zero `any`.

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
| Union types (`Priority`, `ValidationError`) | `type Priority`, `type ValidationError` |
| Discriminated unions | `Result<T,E>` with `ok: true/false`, `ValidationError` with `kind` |
| Generics | `Result<T, E>` type alias |
| Branded / nominal types | `ScheduleRank = number & { readonly __brand: "ScheduleRank" }` |
| `satisfies` operator | `PRIORITY_WEIGHTS … satisfies Record<Priority, number>` |
| `Record<K, V>` utility type | `Record<Priority, number>` in `satisfies` constraint |
| Type narrowing (`unknown` → typed) | `validateTask` narrows `unknown` to `Task` |
| Interfaces & typed return shapes | `Task`, `ScheduledTask`, `ExecutionPlan` |
| Strict null / type guards | Field-by-field checks inside `validateTask` |
| Array sorting & aggregation | `scheduleTasks` — sort by rank, re-number, sum minutes |


## Bonus

Extend `scheduleTasks` to accept an optional `filter` callback typed as `(task: Task) => boolean` and apply it after validation but before ranking, using a generic overload so the return type stays `ExecutionPlan`.
