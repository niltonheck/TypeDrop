# Typed Middleware Pipeline with Typed Context & Error Boundaries

**Difficulty:** Hard

## Scenario

You're building the request-processing core for a Node.js-style API gateway. Each incoming request flows through a chain of middleware functions that progressively enrich a typed context object — the compiler must guarantee that later middleware can only read properties that earlier middleware has already written, and that every error path is exhaustively handled through a typed Result boundary.

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
| Discriminated union narrowing | `AppError` union, `handleError` switch, `Result<T,E>` checks |
| Generic class with accumulating type parameter | `Pipeline<Ctx>` + `.pipe<Adds>()` returning `Pipeline<Ctx & Adds>` |
| Intersection types for context widening | `Ctx & Adds` in `MiddlewareFn` and `Pipeline` |
| Conditional / never-based exhaustiveness | `default: never` branch in `handleError` |
| Generic utility functions without `any` | `ok`, `fail`, `mapResult`, `collectResults` |
| Immutability pattern on builder | `.pipe()` must return a new instance, not mutate |
| Promise-based async control flow | `Pipeline.run()` sequential async chain with short-circuit |
| `satisfies` / `const` type params (bonus) | Can be applied to `AppError` literal `kind` values |

## Bonus

Make `Pipeline` implement a `Symbol.asyncIterator` that yields each intermediate `Result<BaseContext, AppError>` as middleware runs, allowing callers to observe the context as it grows step by step.
