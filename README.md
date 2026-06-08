# Typed Plugin Middleware Chain Executor

**Difficulty:** Hard

## Scenario

You're building the request-processing core for an API gateway platform where operators compose pipelines of plugins (auth, rate-limiting, transformation, logging) loaded at runtime from `unknown` JSON configuration. Each plugin is resolved through a typed registry, executed as an ordered async middleware chain with per-plugin timeout enforcement, and the entire run produces a strongly-typed execution trace — with zero `any`.

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
| Branded / opaque types | `PluginId`, `RequestId`, `toPluginId`, `toRequestId` |
| Discriminated union definition | `PluginConfig` (4 variants with `type` discriminant) |
| Index access / derived type | `PipelineTrace.overallStatus` derived from `PluginOutcome["status"]` |
| Generic type alias | `PluginHandler<C extends PluginConfig>` |
| Mapped type over union keys | `PluginRegistry` mapped over `PluginConfig["type"]` |
| `Extract` utility type | Inside `PluginRegistry` to resolve per-key variant |
| `unknown` → narrowed type (no `as`) | `validatePluginConfig` — full runtime narrowing |
| Generic function | `withTimeout<T>` |
| Custom error class with typed field | `TimeoutError` with `pluginId: PluginId` |
| Async sequential execution + timeout | `executePipeline` orchestration logic |
| `satisfies` / strict return types | `PipelineTrace` return from `executePipeline` |


## Bonus

Extend `executePipeline` to accept an optional `AbortSignal`; if the signal fires mid-chain, mark all remaining plugins as `"skipped"` with reason `"cancelled"` and set `overallStatus` to `"skipped"`.
