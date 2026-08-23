# Typed Middleware Pipeline with Branded Types & Conditional Inference

**Difficulty:** Hard

## Scenario

You're building the request-processing core for an internal HTTP gateway. Every incoming request passes through a chain of typed middleware — authentication, rate-limiting, body parsing, and authorization — each of which may enrich the context object or short-circuit with a typed error response. The hardest part is ensuring the TypeScript compiler tracks exactly which context properties have been added by each middleware stage, so downstream handlers never access fields that haven't been populated yet.

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
| **Branded / nominal types** (`Brand<T, B>`) | `Brand`, `RequestId`, `UserId`, `AuthToken` type definitions |
| **Discriminated union** | `MiddlewareResult<T, E>` (`status: "continue" \| "halt"`) and `GatewayError` (`kind` field) |
| **Intersection types for progressive enrichment** | `AuthedContext`, `RateLimitedContext`, `ParsedContext` building on each prior type |
| **Generic tuple types & `const` type params** | `composeMiddleware<const Stages extends readonly MiddlewareFn<...>[]>` |
| **Conditional types with `infer`** | `LastOutput<T>` extracting the output type of the last element in a middleware tuple |
| **Exhaustive pattern matching** | `matchGatewayError` switch — compiler error if a `GatewayError` variant is unhandled |
| **Typed higher-order function composition** | `composeMiddleware` threading context through stages with proper type safety |
| **Async / Promise handling** | All middleware and `handleRequest` return `Promise<...>` |
| **`unknown` narrowing at runtime** | `bodyParserMiddleware` result and `authzMiddleware` checking `parsedBody` shape |
| **`satisfies` / `strict: true` compliance** | No `any`, no unsafe casts in user-written code |


## Bonus

Extend `composeMiddleware` so it statically verifies that each middleware's `Out` type is assignable to the next middleware's `In` type — producing a compile-time error if the pipeline stages are ordered incorrectly.
