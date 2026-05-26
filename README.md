# Typed Event Aggregator with Discriminated Union Streams

**Difficulty:** Medium

## Scenario

You're building the analytics ingestion layer for a real-time monitoring dashboard. Raw telemetry events arrive as `unknown` from a WebSocket feed; your engine must validate them, fan them into typed streams by category, and produce a strongly-typed per-category summary report — with zero `any`.

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
| Discriminated union definition | `TypedEvent` — three members keyed on `category` |
| Deriving a union of literal types from a discriminated union | `EventCategory` — extracted from `TypedEvent["category"]` |
| `Extract<>` / conditional type narrowing on a union | `EventByCategory<C>` — resolves to the specific union member |
| Conditional type mapping to a concrete type | `SummaryByCategory<C>` — maps category → summary |
| `ParseResult` discriminated union (`ok` flag) | `ParseResult` — `{ ok: true; value }` / `{ ok: false; error }` |
| Runtime `unknown` → typed narrowing without `as` | `validateRawEvent` + `parseEvent` |
| Generic function with return type inferred from type parameter | `extractCategory<C>` and `summarize<C>` |
| Single-pass aggregation with `Record` | `summarize` — `byName`, `actionBreakdown`, `topCode` logic |
| Exhaustive category handling | `summarize` — all three branches must be handled |

## Bonus

Implement a sixth function `aggregateAll(raws: unknown[]): { error: ErrorSummary; metric: MetricSummary; audit: AuditSummary }` that runs a single `ingestEvents` pass and returns all three summaries in one strongly-typed object.
