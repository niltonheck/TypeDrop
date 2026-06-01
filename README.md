# Typed Real-Time Event Stream Aggregator

**Difficulty:** Hard

## Scenario

You're building the ingestion layer for a live operations monitoring platform. Raw telemetry events arrive as `unknown` over a simulated stream; your engine must validate them into a discriminated-union event type, route them through per-kind typed reducer functions, enforce a sliding time-window deduplication strategy, and produce a strongly-typed per-source aggregation report — with zero `any`.

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
| **Branded / opaque types** | `Brand<Base,Tag>`, `EventId`, `SourceId`, `Timestamp` |
| **Discriminated union** | `TelemetryEvent` with `kind` discriminant; `EventOfKind<K>` helper |
| **`Extract` utility type** | `EventOfKind<K extends TelemetryEvent["kind"]>` |
| **Mapped type + conditional type** | `AccumulatorMap` mapping `kind` → accumulator |
| **Generic function with indexed access** | `initialAccumulator<K>(kind): AccumulatorMap[K]` |
| **`satisfies` operator** | `return { ... } satisfies TelemetryEvent` in `parseEvent` |
| **Runtime `unknown` → typed narrowing** | `parseEvent` — no casts until all checks pass |
| **Pure typed reducers** | `reduceMetric`, `reduceLog`, `reduceAlert` — exhaustive kind dispatch |
| **Stateful closure with typed interface** | `createDeduplicator` returning `{ isSeen }` |
| **`Record<K, V>` with union key** | `eventCounts: Record<TelemetryEvent["kind"], number>` |
| **`Map<K, V>` with branded key** | `sources: Map<SourceId, SourceReport>` |
| **Exhaustive switch / type narrowing** | `applyReducer` helper switching on `event.kind` |


## Bonus

Extend `aggregateStream` to accept an optional `filterKinds: ReadonlyArray<TelemetryEvent["kind"]>` parameter typed as a const-generic so the returned `AggregationReport["sources"]` only carries accumulator keys for the filtered kinds.
