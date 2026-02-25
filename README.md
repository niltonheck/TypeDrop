# Typed Middleware Pipeline Builder

**Difficulty:** Medium

## Scenario

You're building the request-handling core of an internal HTTP gateway. Middleware functions transform a typed context object one step at a time — the challenge is composing them into a pipeline where each middleware's output type flows into the next middleware's input type, all enforced at compile time.

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
| Conditional types (`infer`) | `Awaited_<T>`, `PipelineOutput<Middlewares>` |
| Recursive / variadic tuple conditional types | `PipelineOutput` — `[...infer _Init, infer Last]` |
| Generic function inference (no manual type params) | `compose<A,B,C>`, `composeAsync<A,B,C>` |
| Discriminated union return type | `PipelineResult<T>` — `{ ok: true }` vs `{ ok: false }` |
| Branded / nominal types | `Brand<T, B>`, `AuthedContext` |
| Mapped/utility types | `Record<string, string>` in `RequestContext` |
| Error handling with typed narrowing | `runPipeline` catch block, `PipelineResult` narrowing in tests |
| `satisfies` / const typing style | `withAuth` typed as `Middleware<RequestContext, AuthedContext>` |


## Bonus

Extend `composeAsync` into a variadic `pipeAsync(...middlewares)` that accepts any number of async middlewares and threads the types through the entire chain using recursive conditional types.
