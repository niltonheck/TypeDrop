# Typed Middleware Pipeline with Typed Context Propagation

**Difficulty:** Hard

## Scenario

You're building the request-processing pipeline for an API gateway. Each incoming request flows through a chain of typed middleware layers — authentication, rate-limiting, transformation, and logging — where each layer can enrich a shared typed context object, short-circuit with a typed error response, or pass control to the next handler. The hardest part is ensuring the context type is progressively widened as middleware layers run, and that error variants are exhaustively handled.

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
| Recursive / union-based heterogeneous tuple types | `MiddlewareTuple<TInitial, TFinal, E>` (TODO 1) |
| Generic type threading across a pipeline | `runPipeline` signature & `MiddlewareTuple` definition |
| Discriminated union narrowing | `MiddlewareResult`, `PipelineOutcome`, `handleOutcome` |
| Branded / opaque types | `UserId`, `ClientId` — constructed in `makeAuthMiddleware` |
| Exhaustive `never` check | `handleOutcome` switch over `GatewayError` kinds |
| Intersection type widening (context enrichment) | `AuthContext`, `RateLimitContext`, `TransformContext`, `LogContext` |
| `Partial<Record<K, V>>` safe lookup | `makeRateLimitMiddleware` limits map |
| `satisfies` or construction-function branding | `makeAuthMiddleware` — attaching brand without `as` |
| `unknown` → typed narrowing at runtime | `makeTransformMiddleware` body parsing |
| Async sequential control flow with short-circuit | `runPipeline` implementation |


## Bonus

Extend `MiddlewareTuple` to support chains of arbitrary length using a recursive conditional type with an accumulator, so the pipeline can have any number of layers without adding new union branches.
