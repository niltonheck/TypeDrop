# Typed Streaming Log Aggregator with Plugin Pipeline

**Difficulty:** Hard

## Scenario

You're building the observability backbone for a cloud-native platform. Raw log entries stream in from multiple services, pass through a typed plugin pipeline (enrichment → filtering → transformation), and are aggregated into per-service health summaries — the compiler must enforce plugin input/output contracts, discriminated log levels, and exhaustive aggregation shapes with zero escape hatches.

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
| Branded / nominal types | `ServiceId` brand, `makeServiceId` validator |
| Discriminated union design | `LogEntry` — each `level` literal carries unique extra fields |
| Generic interfaces with constraints | `Plugin<In extends RawLogEntry, Out extends RawLogEntry>` |
| Variadic tuple types & rest generics | `buildPipeline<Stages extends Plugin<…>[]>(...plugins: Stages)` |
| Conditional types (`infer`) | `PipelineInput<Stages>` / `PipelineOutput<Stages>` extracting first/last plugin I/O |
| Mapped types | `LevelCounts` — `{ [L in LogLevel]: number }` forces all levels present |
| `Extract` utility type | Narrowing `LogEntry` variants in test and inside `parsePlugin` |
| Exhaustive `assertNever` pattern | `aggregateLogs` switch over `LogLevel` with `assertNever` guard |
| Result / Either monad | `Result<T, E>` discriminated union + `runPipelineWithResult` |
| Async sequential pipeline execution | `buildPipeline` chains `plugin.process()` calls in order |
| Runtime validation & safe coercion | `makeServiceId` in fatal `affectedServiceIds` parsing |
| No `any` / no type assertions | Enforced throughout all stubs and implementations |

## Bonus

Extend `buildPipeline` to accept an optional `concurrencyHint` option and, when set, process entries through each plugin in parallel batches of that size using `Promise.all` instead of one monolithic call.
