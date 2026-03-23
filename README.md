# Typed Plugin Middleware Chain Executor

**Difficulty:** Hard

## Scenario

You're building the extensibility core for a developer platform where third-party plugins can register typed middleware that transforms a shared request context. Each plugin declares the exact context shape it reads and the shape it writes, and the chain executor must thread them together in order — surfacing typed errors and a full execution trace through a `Result<T, E>` monad with zero `any`.

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
| Discriminated union (`Result<T,E>`) | `TODO 1` — `ok`/`err` variants with `ok: true/false` discriminant |
| Generic constraints (`Out extends In`) | `MiddlewareFn<In, Out>` and `Plugin<In, Out>` — ensures plugins only add to context |
| Discriminated union with 3 variants | `TODO 3` — `PluginError` with `kind` discriminant |
| Generic interface definition | `TODO 4` — `Plugin<In, Out>` with `timeoutMs` + `run` |
| Generic `Result` wrapping custom types | `TODO 5` — `ChainResult<Ctx>` wraps `ChainSuccess`/`ChainFailure` |
| Fluent builder pattern with generics | `TODO 6` — `PluginRegistry.register()` returns `this` |
| `Promise.race` for timeout enforcement | `TODO 7 R3` — race between plugin and a timeout promise |
| Sequential async iteration | `TODO 7 R2` — for-loop (not `Promise.all`) over plugins |
| Trace accumulation & early exit | `TODO 7 R4/R5` — push `TraceEntry` before resolving, break on error |
| Exhaustive `switch` on `never` | `TODO 8` — `formatPluginError` default branch proves exhaustiveness |


## Bonus

Add a `PluginRegistry.unregister(id: string): this` method and verify that plugins removed before `executeChain` is called are not executed.
