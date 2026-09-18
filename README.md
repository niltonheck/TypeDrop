# Typed Middleware Pipeline with Context Propagation

**Difficulty:** Medium

## Scenario

You're building the request-processing core for a lightweight HTTP framework. Incoming requests flow through a chain of strongly-typed middleware functions — authentication, logging, rate-limiting, body parsing — each of which may enrich a shared context object before passing control to the next handler. The compiler must enforce that every middleware only reads context properties that have already been added by a preceding middleware, and that the final handler receives the fully-enriched context.

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
| Generic type accumulation (`TIn & TOut`) | `Pipeline<TCtx>` and `.use()` return type |
| Conditional / constrained generics | `withParsedBody<T, TIn extends { rawBody: string }>` |
| Discriminated / literal types | `AuthError.code = "UNAUTHORIZED" as const`, `role: "admin" \| "user"` |
| Higher-kinded function types | `Middleware<TIn, TOut>` — function that receives `next` typed to `TOut`-enriched ctx |
| Builder / fluent pattern with type threading | `createPipeline(...).use(...).use(...).run(...)` |
| Promise-based async control flow | All middleware and `.run()` return `Promise<void>` |
| Typed error classes | `AuthError extends Error` with `readonly code` literal |
| No `any` / `as` / `!` under strict mode | Enforced throughout stubs and expected in solution |


## Bonus

Add a `withRateLimit(maxRps: number)` middleware that tracks call timestamps in a closure and throws a typed `RateLimitError` (with `code: "RATE_LIMITED"` and `retryAfterMs: number`) when the limit is exceeded — and wire it into the test harness.
