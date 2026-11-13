# Typed Streaming Log Pipeline with Severity Routing & Structured Sinks

**Difficulty:** Hard

## Scenario

You're building the observability backbone for a cloud platform. Raw log entries arrive from heterogeneous services, each entry carries a discriminated severity level and a service-specific payload, and your pipeline must parse unknown input, route entries through typed middleware transforms, fan-out to multiple structured sinks (console, file, alerting), and produce a final drain report — all enforced by the compiler with no escape hatches.

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


| Skill Exercised | Location in Code |
|---|---|
| Distributive mapped type → discriminated union | `LogEntry` type definition (Section 2) |
| Branded types with `unique symbol` | `Timestamp`, `ServiceName` (Section 1) |
| `unknown` → typed narrowing with type-guard predicates | `parseLogEntry` (Section 4) |
| `Result<T, E>` error monad pattern | `parseLogEntry` return type + `ParseError` (Sections 3–4) |
| Middleware/compose pattern with strong typing | `buildPipeline`, `LogMiddleware` (Section 5) |
| Exhaustive severity rank mapping | `severityFilter` (Section 5) |
| Immutable payload transform without mutation | `serviceRedactor` (Section 5) |
| `Promise.allSettled` for concurrent fan-out | `drainPipeline` (Section 8) |
| Per-sink outcome discrimination (`SinkOutcome`) | `drainPipeline` report assembly (Sections 6–8) |
| `Extract` conditional type for variant narrowing | `SeverityEntries<S>` (Section 9) |
| Mapped `Partial<{ [S in SeverityLevel]: ... }>` return | `groupBySeverity` (Section 9) |
| Type narrowing without `as` casts in groupBy | `groupBySeverity` implementation (Section 9) |


## Bonus

Extend `DrainReport` with a `hotSpots` field: a `Partial<{ [S in SeverityLevel]: number }>` counting how many entries of each severity level actually reached the sinks (post-pipeline), computed without any extra iteration pass.
