# Typed Middleware Pipeline with Context Propagation

**Difficulty:** Hard

## Scenario

You're building the request-processing backbone for an HTTP gateway. Middleware handlers are composed into a typed pipeline where each layer can read from and write to a shared context object — the compiler must guarantee that every middleware declares exactly what context keys it reads (its dependencies) and writes (its contributions), that contributions from earlier layers are available to later ones, and that the final handler only executes when all required keys are present in the accumulated context.

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
| Recursive conditional types (`infer`, variadic tuples) | `AccumulateContext<Middlewares, Ctx>` — walks the middleware tuple head-by-tail |
| Mapped types for type merging | `Spread<A, B>` — flattens two object types into one without an intersection |
| Conditional types as type guards | `VerifyReads<Reads, Ctx>` — gates middleware registration on key availability |
| Generic class with accumulating type parameters | `Pipeline<Middlewares, CurrentCtx>` — each `.use()` call widens the type |
| `never` as a compile-time rejection mechanism | `fn: VerifyReads<...> extends true ? MiddlewareFn<...> : never` in `.use()` and `.handle()` |
| Phantom types / structural type bookkeeping | `MiddlewareDescriptor<Reads, Writes>` — carries type information without runtime presence |
| Variadic tuple types (`[...Middlewares, ...]`) | Return type of `.use()` appends a new descriptor to the tuple |
| `satisfies` / strict function typing | `FinalHandler<Ctx>` and `MiddlewareFn<Ctx, Contribution>` with no `any` |
| Runtime composition matching compile-time guarantees | `handle().execute()` dispatches through `_fns` array, threading context forward |
| Discriminated narrowing in middleware bodies | `makeAuthMiddleware` narrows `role` to `"admin" \| "user"` before calling `next` |

## Bonus

Extend `Pipeline` with a `.catch` method that accepts a typed error-handler `(err: unknown, req: RawRequest, ctx: CurrentCtx) => Promise<PipelineResponse>` and wraps every middleware call in a try/catch that invokes it, ensuring the error handler also sees the correctly typed partial context at the point of failure.
