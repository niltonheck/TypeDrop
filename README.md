# Typed Middleware Pipeline with Retry & Cancellation

**Difficulty:** Hard

## Scenario

You're building an internal HTTP gateway layer that processes outgoing requests through a chain of typed middleware (auth injection, logging, rate-limit headers). Each middleware can transform the request context, short-circuit with a typed error, and the pipeline runner supports per-request cancellation and automatic retry with exponential back-off.

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
| **Branded / opaque types** | `Milliseconds` brand; `ms()` helper; `backoff` return type |
| **Generic type aliases** | `Middleware<TBody, TResponse, TError>`, `Executor<…>` — TODO (a) & (b) |
| **Discriminated unions** | `PipelineResult` = `PipelineSuccess \| PipelineFailure`; narrowing in test harness |
| **Conditional / structural interface design** | `RetryPolicy<TError>` with optional `retryIf` predicate — TODO (c) |
| **Readonly arrays & interface composition** | `PipelineOptions.middlewares: readonly Middleware<…>[]` — TODO (d) |
| **Higher-order generic functions** | `withBearerAuth`, `withRequestLogger`, `withRateLimitHeader` — TODOs (g–i) |
| **Promise concurrency & AbortController** | `sleep` abort handling — TODO (e); `runPipeline` signal check — TODO (f) |
| **Recursive async dispatch pattern** | `dispatch(index, ctx)` inside `runPipeline` — TODO (f) |
| **Retry + exponential back-off logic** | `runPipeline` R3 loop + `exponentialBackoff` — TODOs (f) & (j) |
| **`Extract` utility type** | Test harness narrowing: `Extract<typeof result, { kind: "success" }>` |


## Bonus

Extend `RetryPolicy` with a `jitter` boolean flag, and when true, add a random ±20 % variance to the back-off duration inside `runPipeline` (the result must still be typed as `Milliseconds`).
