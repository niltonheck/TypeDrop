# Typed Job Queue Processor

**Difficulty:** Medium

## Scenario

You're building the background job processing engine for a task automation platform. Raw job payloads arrive as `unknown` from a message broker; your processor must validate them, dispatch each job to a strongly-typed handler, enforce per-job-type retry policies, and produce a discriminated-union result per job — with zero `any`.

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
| Discriminated union (`Job`) | `TODO 1` — union of three job interfaces |
| `satisfies` operator | `TODO 2` — `JOB_RETRY_POLICIES satisfies Record<…>` |
| Generic discriminated-union result (`JobResult<J>`) | `TODO 3` — `JobSuccess<J> \| JobFailure<J>` |
| Generic type alias (`JobHandler<J>`) | `TODO 4` — function type parameterised on `J` |
| Distributive mapped type (`HandlerMap`) | `TODO 5` — `[K in Job["kind"]]: JobHandler<Extract<Job,{kind:K}>>` |
| Runtime narrowing / `unknown` → typed (`parseJob`) | `TODO 6` — `in` + `typeof` guards, no assertions |
| Async retry loop with `Promise` + timing (`processJob`) | `TODO 7` — attempt counter, `sleep`, `Date.now()` |
| Lookup by discriminant + orchestration (`dispatch`) | `TODO 8` — kind-keyed handler/policy lookup |

## Bonus

Extend `dispatch` to accept a concurrency limit and process an array of raw jobs in parallel batches, returning `JobResult<Job>[]`.
