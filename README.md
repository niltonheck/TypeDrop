# Typed Plugin Middleware Pipeline

**Difficulty:** Hard

## Scenario

You're building the request-processing core for an API gateway. Plugins are registered at startup and form a typed middleware chain — each plugin declares the context fields it *reads* and *writes*, and the pipeline must enforce at the type level that every field a plugin reads has already been produced by an earlier plugin.

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
| Recursive conditional types | `Accumulate<Plugins, Acc>` — accumulates intersection over plugin tuple |
| `infer` keyword | `PluginWrites<P>` and `PluginReads<P>` — extract generic params from Plugin |
| Tuple type iteration / variance | `ValidPipeline<Plugins, Acc>` — validates ordering by recursing over tuple |
| Intersection type accumulation | `Acc & PluginWrites<Plugins[i]>` pattern in `Accumulate` and `ValidPipeline` |
| Conditional type as constraint | `createPipeline` parameter uses `ValidPipeline<Plugins> extends never ? never : Plugins` |
| `const` type parameter (TS 5.x) | `const Plugins` in `createPipeline` generic for tuple inference |
| Generic inference from callback | `makePlugin<Reads, Writes>` infers both params from `execute` signature |
| Result / discriminated union | `Ok<T> \| Err<E>` used throughout; narrowed via `.ok` boolean |
| Sequential async execution | `createPipeline` run loop: `await` each plugin before starting next |
| Short-circuit error propagation | `if (!result.ok) return result` inside the run loop |


## Bonus

Extend `ValidPipeline` to also produce a human-readable template literal error message (e.g. `"Plugin 'RateLimitPlugin' requires field 'userId' not yet in context"`) as the `never` branch payload, surfaced as a diagnostic string in the type error.
