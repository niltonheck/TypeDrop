# Typed Real-Time Sensor Stream Aggregator

**Difficulty:** Medium

## Scenario

You're building the ingestion layer for an IoT monitoring platform. Raw sensor readings arrive as `unknown` from a WebSocket feed; your engine must validate them, group them by device and metric type via a strongly-typed pipeline, and produce a per-device aggregated summary — with zero `any`.

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
| Discriminated unions (narrowing on `kind`) | `SensorReading` union + `parseSensorReading` narrowing |
| Mapped types over a union (`[K in SensorKind]`) | `DeviceSummary` metric fields |
| `Partial<>` utility type | `DeviceSummary` — optional metric keys |
| `Record<K, V>` utility type | `DeviceAggregation` definition |
| `Result<T, E>` monad (no throw, no `any`) | `parseSensorReading` return type |
| Unknown → typed narrowing with runtime checks | `parseSensorReading` body |
| Typed error hierarchy (union of literal kinds) | `ParseError.kind` discriminant |
| `reduce` / single-pass aggregation | `aggregateReadings` groupBy + stats |
| Strict `null` / `undefined` handling | `firstSeen`/`lastSeen` init, optional metric keys |
| Template-style typed report shape | `FeedReport` combining aggregation + error metadata |

## Bonus

Extend `DeviceSummary` with a `trend` field per metric kind — a template literal type `"rising" | "falling" | "stable"` — computed from whether the last reading's value is higher, lower, or equal to the first reading's value for that kind.
