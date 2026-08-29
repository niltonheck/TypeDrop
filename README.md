# Typed Middleware Pipeline with Inferred Context Accumulation

**Difficulty:** Hard

## Scenario

You're building the request-handling core for an internal HTTP gateway. Middleware layers run sequentially, each one reading from — and optionally enriching — a typed context object. The compiler must guarantee that a middleware can only access fields that prior layers have already attached, and that the final handler receives the exact accumulated context type — no more, no less.

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
| Generic type parameters with constraints (`TOut extends TIn`) | `Middleware<TIn, TOut>`, `Pipeline<TCtx>.use<TOut extends TCtx>` |
| Discriminated union (`ok: true/false`) | `MiddlewareResult<TOut>` — both branches |
| Builder / fluent interface pattern with accumulating generics | `Pipeline<TCtx>.use()` returning `Pipeline<TOut>` |
| `infer` in conditional types | `ExtractCtx<P extends Pipeline<infer TCtx>>` |
| Mapped types with `as` key remapping | `ContextDiff` — filtering keys not in `TBefore` |
| Template literal types | Composed middleware name `"${mwA.name}+${mwB.name}"` (string concat at runtime, type-level template literal pattern) |
| Short-circuit / sequential async execution | `run()` and `composeMiddleware()` implementations |
| Structured error types (no `unknown`) | `MiddlewareError` with `layer`, `code`, `message` |
| `Record<string, unknown>` as a safe `BaseCtx` bound | All generic constraints throughout |
| `satisfies` / strict `no-any` compliance | Entire file compiles under `strict: true` with no `any` |

## Bonus

Extend `Pipeline` with a `catch` method that accepts a typed error handler `(err: MiddlewareError) => Promise<MiddlewareResult<TCtx>>` and returns a new pipeline that recovers from failures instead of short-circuiting.
