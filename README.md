# Typed Middleware Pipeline Executor with Typed Context & Error Lanes

**Difficulty:** Hard

## Scenario

You're building the request-processing core for an API gateway. Every inbound request passes through a configurable middleware pipeline — authentication, rate-limiting, transformation, and logging — where each middleware can enrich a shared typed context, short-circuit with a typed error, or pass control to the next stage. The compiler must enforce every middleware shape, context mutation, error variant, and exhaustive final outcome with no escape hatches.

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
| Branded types (`RequestId`, `UserId`) | §1 — `makeRequestId`, `makeUserId`, used in `AuthError`, `makeAuthMiddleware` |
| Generic interfaces with constrained type parameters | §2 — `PipelineContext<TExtra extends Record<string, unknown>>` |
| Discriminated unions (3-way and 4-way) | §4 — `MiddlewareResult<TOut>`, §6 — `PipelineOutcome<TFinal>`, §3 — `PipelineError` |
| Generic type aliases with `extends` constraints | §5 — `Middleware<TIn, TOut extends TIn>`, §4 — `MiddlewareResult<TOut>` |
| Exhaustive switch/if-else over discriminated unions | §8 — `reportOutcome` outer switch + inner `error.kind` switch |
| Type narrowing via `outcome` discriminant | §7 — `runPipeline` result handling, §8 — `reportOutcome` |
| Async/await sequential execution with try/catch | §7 — `runPipeline` middleware loop |
| Generic function with bounded type parameter | §7 — `runPipeline<TFinal>`, §8 — `reportOutcome<TFinal>` |
| Typed factory functions returning specific Middleware shapes | §9 — `makeAuthMiddleware`, `makeRateLimitMiddleware`, `makeLoggingMiddleware` |
| `readonly` and `Readonly<>` for immutability | §2 — `PipelineContext.headers`, §3 — all error variants |


## Bonus

Extend `PipelineContext` so that `makeAuthMiddleware`'s output type is statically visible to downstream middleware — i.e., a middleware declared after auth can access `context.extra.authenticatedUserId` with full type safety, without any casting.
