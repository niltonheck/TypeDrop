# Typed Event Log Aggregator with Discriminated Unions

**Difficulty:** Medium

## Scenario

You're building the analytics layer for a SaaS platform's audit dashboard. Raw event log entries stream in as `unknown` from a Kafka consumer; your engine must validate them, narrow each to its correct discriminated-union variant, and produce a strongly-typed per-user activity summary — with zero `any`.

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
| Discriminated unions (`kind` discriminant) | `PageViewEvent`, `ApiCallEvent`, `ErrorEvent`, `AuditEvent` union |
| Generic Result monad (`Ok`/`Err`) | `Result<T, E>` type + usage in `parseEvent` return type |
| `unknown` → typed narrowing (no `as`) | `parseEvent` — field-by-field type guards |
| Exhaustive kind matching | `parseEvent` payload switch/if ladder covering all three variants |
| Mapped/Record utility type | `UserSummaryMap = Record<string, UserSummary>` |
| Single-pass aggregation with `reduce`/`for…of` | `aggregateEvents` — requirement 5-e |
| Explicit return types on all exported functions | `parseEvent`, `aggregateEvents`, `processEventLog` |
| `Set` or equivalent for de-duplication | `uniquePaths` de-duplication in `aggregateEvents` |
| Strict null handling (`null` check) | `avgApiLatencyMs: number \| null` computed correctly |
| Pipeline composition | `processEventLog` wiring `parseEvent` → `aggregateEvents` |

## Bonus

Extend `UserSummary` with a `topEndpoint: string | null` field — the most frequently called API endpoint for that user (null if no api_call events) — computed in the same single pass.
