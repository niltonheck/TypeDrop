# Typed Middleware Pipeline with Context Narrowing

**Difficulty:** Medium

## Scenario

You're building the request-processing core for an HTTP API gateway. Each incoming request passes through a chain of middleware functions that progressively enrich a shared context object — attaching a parsed auth token, validated body, rate-limit metadata, and more — before reaching the final route handler. The hardest part is making TypeScript track exactly which properties have been added to the context at each stage, so the final handler only compiles when all required enrichments are present.

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
| Generic type aliases | `Middleware<TIn, TOut extends TIn>` |
| Function overloads (4-arity) | `createPipeline` overload signatures |
| Intersection types for context accumulation | `TIn & AuthContext`, `TIn & ParsedBodyContext`, etc. |
| Bounded generics (`extends`) | All middleware factories (`TIn extends BaseContext`, `TIn extends BaseContext & AuthContext`) |
| Discriminated union narrowing | `MiddlewareResult<TCtx>` — `{ ok: true }` vs `{ ok: false }` branches |
| Generic propagation through pipeline | Each overload threads `T0 → T1 → T2 → T3 → T4` |
| Async/await with typed Promises | All middleware return `Promise<MiddlewareResult<TOut>>` |
| Utility-style generic wrapping | `makeHandler<TCtx, TResponse>` wraps pipeline + handler |
| `unknown` → typed narrowing | `makeBodyValidatorMiddleware` uses `validate: (raw: unknown) => TBody \| null` |


## Bonus

Add a 5th overload (and matching test) for a pipeline of length 5, then refactor `createPipeline`'s implementation to use a `for...of` loop over the middleware array instead of manual chaining.
