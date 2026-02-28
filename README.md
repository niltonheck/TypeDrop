# Typed Event Aggregator with Windowed Rollups

**Difficulty:** Medium

## Scenario

You're building the analytics backbone of a real-time dashboard for a SaaS platform. Raw telemetry events (page views, clicks, errors, purchases) stream in continuously, and the dashboard needs per-event-type rollups aggregated over fixed time windows — all with zero `any` and full type safety on every event shape and its aggregated form.

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
| Discriminated union (`kind` field) | `TelemetryEvent` union type |
| Indexed access type (`TelemetryEvent["kind"]`) | `EventKind` derivation |
| `Extract<>` utility type / conditional type | `ExtractEvent<K>` |
| Mapped type over a union | `RollupMap` — `[K in EventKind]` |
| Generic interface with constrained type param | `Reducer<K extends EventKind>` |
| Referencing mapped type values (`RollupMap[K]`) | `Reducer<K>.reduce` signature & `aggregateEvents` return type |
| Type narrowing inside a generic function | `aggregateEvents` — filtering `TelemetryEvent[]` to `ExtractEvent<K>[]` |
| `satisfies` / structural conformance | Concrete reducers typed as `Reducer<"pageView">` etc. |
| Generic function with constrained type param | `aggregateEvents<K extends EventKind>` |
| `Map<string, V>` with typed value | Return type of `aggregateEvents` |


## Bonus

Add a second generic function `aggregateAll` that runs all four reducers in a single pass over the event array and returns a `Map<string, WindowBucket>` where each bucket is a `Partial<RollupMap>` fully typed per window.
