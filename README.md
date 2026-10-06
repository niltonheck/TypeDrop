# Typed Task Priority Queue

**Difficulty:** Easy

## Scenario

You're building the task scheduling layer for a lightweight project management tool. Incoming tasks arrive with different priority levels and metadata; your job is to implement a strongly-typed priority queue that enqueues tasks, dequeues the highest-priority one, and produces a typed summary report — all enforced by the compiler.

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

| TypeScript Skill | Where in the Code |
|---|---|
| Union type (`"low" \| "medium" \| "high"`) | `Priority` type (step 1) |
| Interface definition | `Task` interface (step 2) |
| `satisfies` operator with `Record<K,V>` | `PRIORITY_ORDER` constant (step 3) |
| Generic interface | `PriorityQueue<T>` (step 4) |
| Generic function with `<T>` | `createQueue<T>` (step 5) |
| Bounded generic `<T extends Task>` | `enqueue`, `dequeue`, `summarize` (steps 6–9) |
| Discriminated union | `SummaryResult` with `status` discriminant (step 8) |
| Type narrowing via discriminant | Test harness `if (report.status === "ok")` |
| `Record<Priority, number>` utility type | `SummaryResult.counts` field (step 8) |
| Return type `T \| undefined` | `dequeue` signature (step 7) |

## Bonus

Extend `PriorityQueue<T>` to support an optional `maxSize` cap and have `enqueue` return a `Result<PriorityQueue<T>, "queue-full">` discriminated union instead of the raw queue.
