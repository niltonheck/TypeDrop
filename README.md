# Typed Job Queue Scheduler with Priority & Concurrency

**Difficulty:** Medium

## Scenario

You're building the background-job engine for a data-processing platform. Raw job definitions arrive as `unknown` from a REST API; your scheduler must validate them, dispatch jobs by priority through a typed concurrency-limited runner, and return a strongly-typed execution report — with zero `any`.

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
| Discriminated union (`kind` discriminant) | `JobDefinition` type (Req 1) |
| `readonly` fields on union variants | All three `JobDefinition` variants |
| Generic `Result<T, E>` type | `Result` definition (Req 2) |
| `Extract<Union, { kind: K }>` utility type | `JobHandlerMap` mapped type (Req 4) |
| Mapped type over union keys | `JobHandlerMap` (Req 4) |
| `Record<K, V>` utility type | `PriorityWeight` |
| Type narrowing via `kind` discriminant | `parseJobDefinition` switch/if-chain (Req 3) |
| `unknown` → typed narrowing / runtime validation | `parseJobDefinition` (Req 3) |
| `Promise.all` / concurrency-limited async execution | `runScheduler` (Req 5c) |
| Stable sort with typed comparator | Priority sort in `runScheduler` (Req 5b) |
| Typed error handling (catch + Result) | Job execution try/catch in `runScheduler` (Req 5d) |
| `satisfies` or structural compatibility check | `defaultHandlers` must type-check against `JobHandlerMap` |

## Bonus

Extend `SchedulerReport` with a `byKind` breakdown — a `Record<JobDefinition["kind"], { fulfilled: number; rejected: number }>` — populated entirely from the outcomes array using a single-pass `reduce`.
