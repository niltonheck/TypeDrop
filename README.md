# Typed User Session Aggregator

**Difficulty:** Easy

## Scenario

You're building the analytics layer for a SaaS dashboard. Raw session events arrive as `unknown` from a browser telemetry API; your engine must validate them, group them by user, and return a strongly-typed per-user session summary report — with zero `any`.

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
| Branded types (`UserId`) | `UserId` type alias + `toUserId` helper |
| Discriminated union (`Result<T,E>`) | `Result` type declaration, returned by `validateSessionEvent` |
| Mapped types (`EventCounts`) | `EventCounts` definition over `EventCategory` |
| Union type narrowing | `validateSessionEvent` — narrowing `unknown` step by step |
| `ReadonlyArray` / `readonly` modifiers | `UserSessionSummary.uniquePaths`, `AggregationReport.userSummaries` |
| `Map` for grouping | `aggregateSessions` — grouping events by `UserId` |
| `Set` for deduplication | `aggregateSessions` — building `uniquePaths` without duplicates |
| Generic typing | `Result<T, E>` used with concrete types throughout |
| Template-literal / string union guards | `EventCategory` union validated at runtime in `validateSessionEvent` |


## Bonus

Extend `AggregationReport` with a `topPath` field (the single most-visited path across all users, or `null` if there are no valid events) computed in a single additional pass over valid events.
