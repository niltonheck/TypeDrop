# Typed Plugin Middleware Pipeline

**Difficulty:** Hard

## Scenario

You're building the extensibility layer for a developer-facing HTTP gateway. Third-party plugins are registered into a typed middleware pipeline where each plugin declares the context shape it reads, the context shape it writes, and whether it can fail — the compiler must enforce that plugins are composed in a valid order (i.e. a plugin's required reads are always satisfied by prior writes), that error-producing plugins are handled, and that the final resolved context type is derived structurally from the full chain.

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


| TypeScript Skill | Where in the Code |
|---|---|
| Mapped types (`Omit<Acc, keyof Writes> & Writes` pattern) | `MergeCtx<Acc, Writes>` |
| Conditional types for structural key checking | `SatisfiedBy<Required, Acc>` |
| Recursive conditional types with `infer` over tuples | `PipelineFinalCtx<Plugins, InitCtx>` |
| Distributive conditional types + `infer` for union extraction | `PipelineErrors<Plugins>` |
| Template literal types | `composePlugins` → `"${A.name}+${B.name}"` name |
| Generic inference anchor (`definePlugin` factory) | `definePlugin<Reads, Writes, EBrand>` |
| `const` type parameter for tuple literal preservation | `buildPipeline<const Plugins>` |
| Branded types | `PluginError<Brand>` |
| Typed async sequential execution with timing | `buildPipeline` → `execute` implementation |
| Generic constraint chaining across composed generics | `composePlugins` signature with `MergeCtx` in return |


## Bonus

After implementing the core pipeline, add a `withTimeout` wrapper that takes a `PluginDef` and a millisecond limit and returns a new `PluginDef` with `EBrand` extended by `"timeout"`, cancelling the inner `run` promise via `AbortController` if it exceeds the deadline.
