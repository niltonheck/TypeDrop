# Typed Workflow State Machine with Retry & Cancellation

**Difficulty:** Hard

## Scenario

You're building the job-execution engine for a distributed task platform. Jobs arrive as `unknown` from a queue API; your engine must validate them, drive each job through a strict discriminated-union state machine, execute steps with typed retry logic and AbortController cancellation, and return a strongly-typed execution report — with zero `any`.

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
| Branded types (`string & { __brand }`) | `JobId`, `StepId` |
| Discriminated unions (5+ variants) | `StepState`, `JobState`, `ValidationError`, `ExecutionError` |
| Generic `Result<T, E>` type | Used in all 4 validate/run return types |
| Conditional type (`extends` chain) | `StepSummary<S extends StepState>` |
| Generic interface with conditional field | `StepReport<S extends StepState>` |
| `unknown` → validated domain type narrowing | `validateStep`, `validateJob` |
| Error collection without short-circuit | `validateJob` step loop |
| AbortController / AbortSignal cancellation | `createStepExecutor`, `runStep`, `runJob` |
| Retry logic with typed state transitions | `runStep` |
| Exhaustive `switch`/`if` narrowing | `buildJobReport` over `StepState` |
| `satisfies` operator | Literal `ValidationError` / `ExecutionError` objects |
| Sequential async orchestration | `runJob` |

## Bonus

Add a `runJobWithTimeout` wrapper that accepts an overall `timeoutMs` and aborts the job's AbortController when the timeout fires, then reflects a `Timeout` ExecutionError in the report.
