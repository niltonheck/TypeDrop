# Typed Middleware Pipeline with Typed Context & Error Boundaries

**Difficulty:** Hard

## Scenario

You're building the request-processing core for a high-throughput HTTP gateway. Incoming requests pass through a chain of typed middleware layers — auth, rate-limiting, transformation, and logging — each of which can enrich a shared context object or short-circuit the pipeline with a strongly-typed error. The hardest part is making the context type accumulate correctly as it flows through each middleware stage.

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
| **Branded types** (`Brand<T, Tag>`) | `UserId`, `TraceId`, `TenantId` — §1 |
| **Generic interfaces** (`PipelineError<K>`) | §4 — `kind` field narrows to the exact `K` |
| **Discriminated union** (`Result<T,E>`, `AnyPipelineError`) | §5 — `ok` discriminant; §4 — `kind` discriminant |
| **Intersection type accumulation** (`BaseContext & AuthFields & …`) | §3 — `FullContext`; §8 middleware signatures |
| **Generic function types** (`Middleware<In, Out extends In>`) | §6 — `Out extends In` constraint enforces monotonic enrichment |
| **Runtime type narrowing / validation** (`validateRequest`) | §7 — `unknown → RawRequest` with guards |
| **Closure-captured typed state** (`makeRateLimitMiddleware`) | §8b — `store` captured in closure, `Map<UserId, number>` |
| **Exhaustive switch + `never` check** (`reportError`) | §10 — compiler enforces all `PipelineErrorKind` branches |
| **`Promise`-based async pipeline** (`runPipeline`) | §9 — sequential await with typed short-circuit |
| **`satisfies` / `const` assertions (optional stretch)** | Anywhere a `satisfies` could tighten inference |


## Bonus

Refactor `runPipeline` to accept a variadic, type-safe array of middleware stages whose context types chain automatically — so adding a new stage is a single-line change with full compile-time verification of the accumulated context shape.
