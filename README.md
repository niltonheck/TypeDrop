# Typed Job Queue Scheduler with Priority & Retry

**Difficulty:** Medium

## Scenario

You're building the background job processing layer for a SaaS platform. Raw job definitions arrive as `unknown` from a REST API; your scheduler must validate them, enqueue them by priority, execute them with concurrency limits, and produce a strongly-typed execution report — with zero `any`.

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
| Discriminated union (`Job` by `kind`) | `Job` type definition; `validateJob` narrowing per-kind |
| Mapped type enforcing completeness | `HandlerRegistry = { [K in JobKind]: JobHandler<K> }` |
| `Extract<>` utility type | `JobHandler<K>` parameter: `Extract<Job, { kind: K }>` |
| Generic `Result<T, E>` monad | `validateJob` return type; callers must narrow `ok` before use |
| Tagged/discriminated error union | `ValidationError` with `tag` field; exhaustive checks in tests |
| `satisfies` / const-type discipline | `HandlerRegistry` in test harness must satisfy mapped type |
| Type narrowing via control flow | `validateJob` — each `if` block narrows `raw` progressively |
| `Promise`-based concurrency pool | `runScheduler` — sliding-window concurrency with `maxAttempts` |
| Single-pass `reduce` aggregation | `buildReport` — one `reduce` over `JobOutcome[]` |
| Stable sort with typed comparator | `enqueueByPriority` — `Priority`-keyed rank map, no mutation |


## Bonus

Extend `runScheduler` to accept an optional `onProgress` callback typed as `(outcome: JobOutcome, remaining: number) => void` and invoke it after each job completes, using a template literal type to enforce that `remaining` is always a non-negative integer branded as `type NonNegInt = number & { readonly __brand: "NonNegInt" }`.
