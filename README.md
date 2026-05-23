# Typed Task Priority Queue

**Difficulty:** Easy

## Scenario

You're building the scheduling layer for a project management tool. Tasks arrive as `unknown` from a REST API; your engine must validate them, insert them into a typed priority queue, and drain them in order — returning a strongly-typed execution plan with zero `any`.

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
| Union types (`Priority`) | `type Priority`, `isValidPriority` |
| `readonly` arrays & fields | `Task.tags`, `ExecutionPlan.orderedTasks`, `drain()` return type |
| `Record<Priority, number>` utility type | `ExecutionPlan.taskCountByPriority` |
| `as const` tuple for ordered keys | `PRIORITY_ORDER` |
| Runtime type narrowing / type guard | `isValidPriority`, `validateTask` |
| `unknown` → typed narrowing (no `any`) | `validateTask` parameter |
| Generic class with typed private state | `TaskQueue` |
| Stable sort with typed comparator | `TaskQueue.drain()` |
| Exhaustive `Record` initialisation | `buildExecutionPlan` — zero-initialise all Priority keys |
| Error propagation contract | Requirement #12 in `buildExecutionPlan` |

## Bonus

Extend `TaskQueue` to accept a generic type parameter `<T extends { priority: Priority }>` so it can queue any prioritisable item, not just `Task`.
