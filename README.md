# Typed Middleware Pipeline with Context Narrowing

**Difficulty:** Hard

## Scenario

You're building the request-processing core of an API gateway. Incoming requests flow through a chain of middleware — authentication, authorization, validation, and enrichment — each step narrowing or extending a shared context object. The compiler must enforce that each middleware receives exactly the context its predecessor produced, that enrichments accumulate correctly, and that the final handler only runs when the fully-enriched context is provably present.

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
| Generic conditional types with `infer` | `MiddlewareTuple<Steps>`, `FinalCtx<Steps>`, `InitialCtx<Steps>` |
| Recursive tuple type validation | `MiddlewareTuple<Steps>` enforcing adjacent In/Out compatibility |
| Discriminated unions | `MiddlewareResult`, `PipelineResult`, `PipelineError` hierarchy |
| Mapped / utility types | `TokenCtx`, `AuthCtx`, `UserCtx` built via intersection (`&`) |
| Generic function with constrained tuple parameter | `createPipeline<Steps extends ...>(steps: MiddlewareTuple<Steps>)` |
| Type inference from last tuple element | `FinalCtx<Steps>` extracting the output of the last middleware |
| Type inference from first tuple element | `InitialCtx<Steps>` extracting the input of the first middleware |
| Exhaustive error narrowing | Test harness narrowing `PipelineError` by `.code` |
| No `any` / no type assertions | Enforced throughout stubs and test harness |
| `satisfies` or `const` generics (optional stretch) | Can be used to annotate `authPipeline` for extra compile-time safety |


## Bonus

As a stretch goal, use `satisfies` to annotate `authPipeline` so the compiler verifies its `.run` signature matches `(ctx: BaseCtx) => Promise<PipelineResult<UserCtx, PipelineError>>` without widening the inferred type.
