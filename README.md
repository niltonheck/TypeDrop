# Typed Job Queue with Priority Scheduling & Result Collection

**Difficulty:** Medium

## Scenario

You're building the task-scheduling core for a background job processor. Jobs arrive with different priorities and payload shapes, a concurrency-limited runner executes them, and every result — success or failure — is collected into a strongly-typed summary the compiler fully understands.

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
| Discriminated union (`kind` discriminant) | `Job` type definition |
| Generic types with `extends` constraint | `JobSuccess<J>`, `JobFailure<J>`, `JobResult<J>`, `JobHandler<J>` |
| Mapped type over a union's keys | `HandlerRegistry` mapped over `Job["kind"]` |
| `Extract<>` utility type for variant lookup | `JobByKind<K>` helper |
| Type narrowing at runtime | `getSuccesses` filtering by `kind` and `status` |
| Concurrency-limited async execution | `runQueue` with `concurrency` slots |
| Discriminated union narrowing (`status`) | `JobResult<J>` discrimination in `runQueue` summary |
| No `any` / no unsafe casts | Entire file — strict mode enforced |

## Bonus

Add a `retryQueue` function that accepts the `QueueSummary`, re-runs only the `retryable` failed jobs, and returns a merged `QueueSummary` — with the compiler enforcing that only `JobFailure` entries with `retryable: true` are re-dispatched.
