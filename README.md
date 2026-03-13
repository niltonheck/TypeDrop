# Typed Concurrent Task Scheduler with Priority Queues

**Difficulty:** Hard

## Scenario

You're building the background job engine for a data-pipeline platform. Tasks arrive with a priority level and resource tags, must be executed with a concurrency cap per resource group, and every outcome — success, failure, or cancellation — must be surfaced through a fully typed Result hierarchy with zero `any`.

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

| Skill | Where in Code |
|---|---|
| Branded types (`unique symbol`) | `TaskId` brand declaration + `makeTaskId` |
| Discriminated unions | `TaskError` (kind), `TaskResult<T>` (status), `Priority` |
| Generics | `TaskDefinition<T>`, `TaskResult<T>`, `Scheduler.submit<T>` |
| Mapped types | `SchedulerStats.totals` derived from `GroupCounts` keys |
| `satisfies` operator | `PRIORITY_ORDER satisfies Record<Priority, number>` |
| `Record<K,V>` utility type | `PRIORITY_ORDER`, `SchedulerStats.perGroup` |
| `keyof` | `{ [K in keyof GroupCounts]: number }` in `SchedulerStats` |
| Concurrency control | Per-group + global caps, priority queue dispatch loop |
| Promise composition | Timeout race, `Promise.race`, queued promise resolution |
| Error handling | Typed `TaskError` hierarchy surfaced via `TaskResult` |
| Strict null safety | No `!`, no `as`, no `any` throughout |

## Bonus

Add a `Scheduler.drain(): Promise<void>` method that resolves only once every currently queued and running task has settled.
