# Typed Middleware Pipeline with Branching & Typed Context

**Difficulty:** Hard

## Scenario

You're building the request-processing core for an API gateway. Incoming requests flow through a chain of middleware functions that can read and write a strictly-typed context object, short-circuit the pipeline by returning an early response, or pass control to the next middleware — all while preserving full type safety across every stage of the chain.

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
| Generic type parameters with constraints | `Pipeline<TCtx>`, `MiddlewareFn<TCtx, TPatch extends object>` |
| Mapped / utility types (`Merge`, `Omit`) | `Merge<A, B>` used to widen context across `.use()` calls |
| Discriminated union narrowing | `PipelineResponse` (`OkResponse \| ErrorResponse`), narrowed in test harness and internally |
| Builder pattern with accumulating type state | `Pipeline<TCtx>.use()` returning `Pipeline<Merge<TCtx, TPatch>>` |
| Higher-kinded / fluent generic chaining | Each `.use()` call produces a new `Pipeline` with a richer `TCtx` |
| Contextual type enforcement | `withAuth` requires `{ token: string }` in ctx; `withRateLimit` requires `{ userId: string }` |
| `Record<string, never>` for empty patch | `withRateLimit` and terminal middleware use `Record<string, never>` as `TPatch` |
| Async / Promise composition | `run()` chains middleware via `next()` callbacks returning `Promise<PipelineResponse>` |
| Structural subtyping | `object` as a base context type accepted by `withLogging` |
| `satisfies` / `const` assertions (optional stretch) | Can be used to validate pre-built middleware shapes |


## Bonus

Add a `withTimeout(ms: number)` middleware factory that short-circuits with a 503 `ErrorResponse` if the rest of the pipeline does not resolve within `ms` milliseconds, using `Promise.race` and a typed cancellation signal.
