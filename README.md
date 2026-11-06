# Typed Event Stream Aggregator with Windowed Rollups

**Difficulty:** Medium

## Scenario

You're building the analytics pipeline for a real-time monitoring dashboard. Raw telemetry events stream in from multiple services, and your job is to validate them, bucket them into fixed time windows, and compute per-metric rollups — with the compiler enforcing every event shape, window boundary, aggregation kind, and output record.

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

| Skill Exercised | Where in the Code |
|---|---|
| Union / literal types | `MetricName`, `AggregationKind` — compiler rejects unknown string literals |
| Discriminated union | `ValidationResult<T>` — `ok: true/false` discriminant lets callers pattern-match safely |
| Mapped type over a union | `MetricAggregationConfig` — `[K in MetricName]: AggregationKind` enforces exhaustive config |
| Nested `Record` / `Partial<Record>` | `WindowedGroups` — three-level indexed structure with correct partiality |
| Generic result type | `ValidationResult<T>` and `ValidationResult<never>` for rejected events |
| Runtime type narrowing (unknown → typed) | `validateEvent` — guards against every field without `any` or `as` |
| `readonly` arrays & interfaces | `TelemetryEvent`, `RollupRecord`, function parameters — immutability enforced |
| Exhaustive `switch` / union dispatch | `aggregate` — every `AggregationKind` branch must be handled |
| Template literal type (implicit) | `windowKey` string format `"${startMs}-${endMs}"` documented in types |
| Pipeline composition | `processEventStream` — chains validate → group → aggregate → sort |

## Bonus

Add a sixth function `detectAnomalies` that accepts the `RollupRecord[]` output and a `threshold: Partial<Record<MetricName, number>>`, returning only those rollup records whose `result` exceeds the threshold for their metric — typed so the return is always `RollupRecord[]` and missing threshold entries are silently skipped.
