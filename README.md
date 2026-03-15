# Typed Real-Time Event Stream Processor

**Difficulty:** Hard

## Scenario

You're building the analytics backbone for a live dashboard that ingests a heterogeneous stream of server-sent events (user actions, system alerts, and metric snapshots). Each event must be parsed from raw `unknown` input, routed through a typed middleware pipeline, and aggregated into a strongly-typed per-event-kind summary — all with zero `any`.

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
| Discriminated union narrowing | `parseEvent` — switching on `kind` to narrow `StreamEvent` branches |
| `Extract<Union, { kind: K }>` generic constraint | `runPipeline` signature + `KindMiddlewareMap` to route middleware type-safely |
| Mapped types over a union key | `StreamSummary` defined as `{ [K in EventKind]: KindSummaryMap[K] }` |
| `Result<T, E>` / typed error hierarchy | `parseEvent` return type; `ParseError` discriminated by `code` |
| Generic middleware typing (`Middleware<E extends StreamEvent>`) | `KindMiddlewareMap` — per-kind middleware bound to the correct event subtype |
| Single-pass aggregation with correct types | `buildSummary` — `Record<Severity, number>`, `Record<string, ...>`, `Set<string>` |
| Runtime validation / `unknown` narrowing | `parseEvent` — guard checks for `typeof`, field presence, valid enum values |
| Orchestrator composition | `processStream` — wires `parseEvent` → `runPipeline` → `buildSummary` with error accumulation |


## Bonus

Extend `KindMiddlewareMap` to support an ordered array of middleware per kind, composing them into a full chain where each calls `next` to pass control to the following middleware.
