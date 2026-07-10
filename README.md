# Typed Event Aggregator with Time-Window Bucketing

**Difficulty:** Medium

## Scenario

You're building the analytics ingestion layer for a real-time monitoring dashboard. Raw events arrive as `unknown` from a webhook stream; your aggregator must validate them into strongly-typed `MonitoringEvent` records, bucket them into fixed time windows, and produce a fully-typed `WindowSummary` per bucket — with zero `any`.

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
| Discriminated union narrowing | `parseEvent` — switching on `category` to narrow `AlertEvent \| InfoEvent \| MetricEvent` |
| Runtime validation of `unknown` | `parseEvent` — guarding every field before returning a typed value |
| `Record<K, V>` mapped utility type | `CategoryCounts`, `SeverityCounts` — exhaustive key coverage over union literals |
| Template / branded string type | `BucketKey = string` typed alias used consistently as a distinct key type |
| Generic function with constrained type param | `groupBy<T, K extends string>` — K inferred from the key function's return type |
| `Map<K, V>` with generic key | `groupBy` return type `Map<K, T[]>` preserving caller's key type |
| Interface composition via extension | `AlertEvent`, `InfoEvent`, `MetricEvent` all extend `BaseEvent` |
| Single-pass aggregation with `Map` | `aggregateEvents` — bucket accumulation without multiple array passes |
| Set-based deduplication | `sources` field — unique source strings via `Set` or manual tracking |
| Exhaustive category/severity initialisation | `categoryCounts` and `severityCounts` — all union members initialised to 0 |

## Bonus

Extend `WindowSummary` with a `topSources` field typed as a tuple `[string, number][]` (source → event count pairs) sorted descending by count, and populate it inside `aggregateEvents`.
