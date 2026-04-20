# Typed Event Stream Aggregator

**Difficulty:** Medium

## Scenario

You're building the real-time analytics backend for a product telemetry platform. Raw event objects arrive as `unknown` from a WebSocket feed; your aggregator must validate them, route them to per-event-type handlers, and produce a strongly-typed session summary — with zero `any`.

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

| Skill | Where in the code |
|---|---|
| Discriminated union (`TelemetryEvent`) | TODO (1) — `kind` as discriminant across 5 variants |
| Type narrowing / type-guard (`parseTelemetryEvent`) | TODO (2) — `unknown → TelemetryEvent \| null` with no `as` |
| Mapped type over a union (`EventHandlerMap`) | TODO (3) — `{ [K in EventKind]: ... }` |
| `Extract<>` utility type | TODO (3) — `Extract<TelemetryEvent, { kind: K }>` per handler |
| `Record<K, V>` utility type | TODO (4), TODO (6) — `clicks`, `kindCounts` |
| `Set<string>` in typed interfaces | TODO (4) — `currencies` field |
| Generic + constrained function | TODO (3) — `createHandlerMap` |
| `satisfies` or exhaustive kind routing | TODO (5) — routing via `EventHandlerMap` ensures exhaustiveness |
| Structured aggregation report type | TODO (6) — `AggregationReport` |

## Bonus

After the aggregator works, add a generic `replaySession<K extends EventKind>(report: AggregationReport, kind: K): Array<Extract<TelemetryEvent, { kind: K }>>` that reconstructs the original typed events for one kind from the summary data.
