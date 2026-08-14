# Typed Middleware Pipeline with Typed Context & Error Boundaries

**Difficulty:** Hard

## Scenario

You're building the request-handling core for an internal API gateway. Every inbound request flows through a chain of middleware — authentication, rate-limiting, validation, transformation — each of which can enrich the shared context object, short-circuit with a typed error, or pass control to the next handler. The pipeline must be fully type-safe: each middleware declares what context properties it *reads* and what it *adds*, the compiler enforces correct ordering, and every short-circuit produces an exhaustively-matchable typed error.

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
| Branded types (`Brand<T, B>` with `unique symbol`) | `RequestId`, `makeRequestId` |
| Discriminated unions | `Result<T,E>`, `PipelineError` and all four error variants |
| Generic type parameters with constraints | `Pipeline<Ctx, FinalOutput>`, `Middleware<In, Out, FinalOutput>` |
| Higher-kinded / recursive generic chaining | `.use<NextCtx>()` returning `Pipeline<NextCtx, FinalOutput>` |
| Intersection types for context enrichment | `AuthedContext = BaseContext & {…}`, `ValidatedContext<B> = AuthedContext & {…}` |
| Exhaustive discriminated-union matching | Test 3's `if (e.kind === "rate_limit")` block |
| Generic middleware factories | `withAuth`, `withRateLimit`, `withBodyValidation` |
| `strict: true` compliance (no `any`, no `as`) | All stubs and implementations |
| Async function composition / short-circuit | `Pipeline.run()` short-circuits on `{ ok: false }` |
| Utility pattern: Result monad (`ok` / `err`) | `ok<T,E>()` and `err<T,E>()` helpers |


## Bonus

Extend `Pipeline` with a `.catch<E extends PipelineError>(kind: E["kind"], handler: (e: E) => Promise<Result<FinalOutput, PipelineError>>) ` method that intercepts only that specific error variant and allows recovery without breaking the type chain.
