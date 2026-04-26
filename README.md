# Typed Real-Time Metrics Aggregator

**Difficulty:** Hard

## Scenario

You're building the telemetry ingestion pipeline for a distributed observability platform. Raw metric events arrive as `unknown` from multiple instrumentation agents; your engine must validate them, route each event to a strongly-typed aggregator strategy, perform single-pass windowed aggregation with concurrency-safe flushing, and emit a discriminated-union report per metric series — with zero `any`.

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

| Skill | Where in Code |
|---|---|
| `Extract<Union, Constraint>` utility type | `ValidatedEvent<K>`, `flush` return type, `summariseReports` return type |
| Branded / opaque types | `MetricName`, `AgentId`, `WindowMs`, `TimestampMs` — used throughout |
| Generic interface with constrained type param | `AggregatorStrategy<K extends RawMetricEvent["kind"]>` |
| Mapped type over union keys | `StrategyRegistry` — `{ [K in RawMetricEvent["kind"]]: () => AggregatorStrategy<K> }` |
| Template literal type | `SeriesKey = \`${MetricName}::${AgentId}\`` |
| `unknown` → discriminated union narrowing | `validateEvent` — full runtime guard without `as`/`any` |
| `Promise.all` with per-item error capture | `MetricsAggregator.flushAll` — `.then/.catch` per series |
| Discriminated union exhaustive switch | `formatReport` — `never`-typed default branch |
| Single-pass aggregation | `summariseReports` — one loop, three buckets |
| Conditional/mapped type field remapping | `ValidatedEvent<K>` — `Omit` + branded field intersection |

## Bonus

Extend `MetricsAggregator` with a `flushConcurrent(limit: number): Promise<FlushReport[]>` method that flushes at most `limit` series at a time using a typed concurrency-limited `Promise` pool, without any external libraries.
