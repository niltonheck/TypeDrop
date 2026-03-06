# Typed Real-Time Event Aggregator with Windowed Metrics

**Difficulty:** Hard

## Scenario

You're building the analytics backbone of a live-streaming platform. Raw telemetry events (views, reactions, chat messages, errors) arrive in bursts and must be funnelled through a strongly-typed aggregation pipeline that groups them into fixed time windows, computes per-event-kind statistics, and surfaces a typed Result for every query — all with zero `any`.

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
| **Branded / opaque types** | `TimestampMs`, `WindowId` — prevent raw numbers/strings being passed as window IDs |
| **Discriminated union** | `TelemetryEvent` union over `kind`; exhaustive switch in `renderMetrics` |
| **Conditional / mapped types** | `EventMetrics<K>` maps `EventKind` → correct metrics shape; `WindowSnapshot.metrics` mapped type |
| **Generics with constrained type params** | `getMetricsForKind<K extends EventKind>` returns `Result<EventMetrics<K>, …>` inferred without assertions |
| **Result / Either pattern** | `Result<T,E>`, `Ok<T>`, `Err<E>` used throughout all public methods |
| **Typed error hierarchy** | `AggregatorError` discriminated union with `WINDOW_NOT_FOUND`, `EMPTY_WINDOW`, `INVALID_RANGE` |
| **Exhaustiveness checking** | `assertNever` used in `renderMetrics` switch over `EventKind` |
| **Iteration & aggregation** | Mode computation (topEmoji, mostFrequentCode), uniqueUsers via Set, avgDurationMs |
| **Map / Record usage** | Internal window → events map; `emojiBreakdown: Record<string, number>` |
| **`satisfies` / no `any`** | Entire file compiles under `strict: true` with zero `any` or type assertions in stubs |


## Bonus

After implementing the core challenge, add a `mergeWindows(ids: WindowId[]): Result<WindowSnapshot, AggregatorError>` method that deep-merges metrics from multiple windows into a single synthetic snapshot, preserving correct generic typing throughout.
