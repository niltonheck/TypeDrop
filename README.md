# Typed Task Queue with Priority & Status Tracking

**Difficulty:** Easy

## Scenario

You're building the background-job manager for a lightweight project management tool. Tasks arrive with different priorities and move through a fixed lifecycle; the UI needs a typed queue that enforces valid status transitions, aggregates task counts by status, and surfaces the next task to process — all with the compiler catching every invalid shape.

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

| Skill Exercised | Where in the Code |
|---|---|
| Union types (`Priority`, `TaskStatus`) | `type Priority` and `type TaskStatus` declarations |
| Interface design with optional fields | `Task` interface (`startedAt?`, `finishedAt?`) |
| `Record<K, V>` with exhaustive keys | `VALID_TRANSITIONS` and return type of `summariseByStatus` |
| `satisfies` operator for type-safe literals | `VALID_TRANSITIONS … satisfies Record<TaskStatus, …>` |
| `ReadonlyArray<T>` for immutable inputs | Parameters of `nextToProcess` and `summariseByStatus` |
| Immutable update pattern (no mutation) | `transitionTask` must return a new object |
| Type narrowing / conditional logic | Priority ordering in `nextToProcess` |
| Exhaustive key presence in a `Record` | All four statuses always present in `summariseByStatus` |

## Bonus

Add a generic `filterByStatus` function whose return type narrows the `status` field to the exact `TaskStatus` literal passed in, using a generic type parameter constrained to `TaskStatus`.
