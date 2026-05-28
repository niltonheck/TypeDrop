# Typed Middleware Pipeline Builder

**Difficulty:** Medium

## Scenario

You're building the request-processing layer for an internal API gateway. Incoming requests pass through a chain of typed middleware handlers — each one can enrich the context, short-circuit with a typed error, or pass control to the next handler — all with zero `any`.

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
| Generic type parameter chaining (`C & Extra`) | `Pipeline.use<Extra>()` return type |
| Discriminated union narrowing | `StepResult<C>`, `MiddlewareError`, `PipelineResult<T>` |
| Conditional / intersection type accumulation | `Pipeline<C>` widening through `.use()` calls |
| Default generic type parameters | `Middleware<C, Extra = Record<string, never>>` |
| Exhaustive `switch` on discriminated union | `describeError()` — all 5 `kind` variants |
| Typed builder / fluent API pattern | `Pipeline.use()` returning `Pipeline<C & Extra>` |
| Closure-based stateful middleware | `rateLimitMiddleware` counter in closure |
| `Promise`-based async middleware chain | `Pipeline.run()` sequential awaiting |
| Error result type (`PipelineResult<T>`) | `run()` return, try/catch → `{ kind: "internal" }` |
| No `any` / no type assertions | Enforced throughout all stubs and implementations |


## Bonus

Extend `Pipeline` with a `.catch<E extends MiddlewareError["kind"]>(kind: E, recover: (err: Extract<MiddlewareError, { kind: E }>) => Promise<StepResult<C>>): Pipeline<C>` method that intercepts a specific error kind and attempts recovery before propagating.
