# Typed Middleware Pipeline with Typed Context & Error Propagation

**Difficulty:** Hard

## Scenario

You're building the request-handling core for an internal API gateway. Incoming requests flow through a chain of middleware — authentication, rate-limiting, logging, and transformation — each of which can enrich a shared typed context or short-circuit the pipeline with a structured error. The compiler must catch every invalid context mutation, missing required field, and unhandled error variant.

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
| Discriminated union (`PipelineError`) | `PipelineError` type definition, `matchError` |
| Generic `Result<T, E>` type | `Result` type, all middleware return types |
| Intersection types for context widening | `AuthedContext`, `RateLimitedContext`, `ValidatedContext` |
| Bounded generics (`Out extends In`) | `Middleware<In, Out extends In>` definition |
| Function overloads (2- and 3-arity) | `composePipeline` overload signatures |
| Mapped type over union keys (`ErrorHandlers`) | `ErrorHandlers<E, R>` and `matchError` implementation |
| `Extract` utility type | `ErrorHandlers`, `matchError` handler dispatch |
| Exhaustive pattern matching (compiler-enforced) | `matchError` — missing handler key is a type error |
| Async pipeline / `Promise` chaining | `composePipeline` implementation, `runPipeline` |
| Factory functions returning typed generics | `createAuthMiddleware`, `createRateLimitMiddleware`, `createValidationMiddleware` |

## Bonus

Add a 4-middleware overload to `composePipeline` and a variadic fallback overload that uses a recursive conditional type to infer the final output context type from an arbitrarily long tuple of middleware.
