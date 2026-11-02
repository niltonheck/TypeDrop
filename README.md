# Typed Async Job Queue with Retry & Concurrency Control

**Difficulty:** Medium

## Scenario

You're building the background job runner for a SaaS platform. Jobs arrive with varying priorities and retry budgets, must be executed with a bounded concurrency limit, and each outcome — success, failure, or exhausted retries — must be captured in a fully typed result record that downstream consumers can pattern-match exhaustively.

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

| Skill | Where in code |
|---|---|
| Branded / nominal types | `JobId` definition & `makeJobId` factory |
| Generic interfaces | `Job<T>` interface |
| Discriminated union (3 members) | `JobOutcome<T>` type |
| Type narrowing / exhaustive matching | `summariseOutcomes` switch on `status` |
| Async retry logic | `runJob` attempt loop |
| Bounded concurrency with `Promise` | `runQueue` concurrency pool |
| Utility / mapped types (`QueueSummary`) | `summariseOutcomes` return type |
| `strict: true` compliance (no `any`) | Entire file |

## Bonus

Extend `runQueue` to accept an optional `onProgress` callback typed as `(outcome: JobOutcome<T>, remaining: number) => void` that fires after each job settles.
