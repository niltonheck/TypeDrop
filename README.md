# Typed Event Analytics Aggregator

**Difficulty:** Medium

## Scenario

You're building the analytics engine for a SaaS dashboard. Raw events stream in from the client SDK — page views, button clicks, form submissions, and errors — and your job is to parse, validate, and aggregate them into a per-session summary report, with the compiler enforcing every event shape, aggregation field, and result type with no escape hatches.

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
| Discriminated union (`kind` field) | `AnalyticsEvent` union type, `parseEvent` switch/narrowing |
| `Extract` conditional type | `EventOfKind<K>` — TODO A |
| Generic `Map`-based groupBy | `groupBy<T, K>` — TODO B |
| `unknown` → typed narrowing (no `as`) | `parseEvent` — TODO C |
| `Result<T, E>` / `ParseResult<T>` pattern | `ParseOk` / `ParseErr` / `ParseResult<T>` |
| Single-pass reduce / accumulator | `aggregateEvents` session loop — TODO D |
| Type predicate (`is`) in filter | `filterByKind` — TODO E |
| `satisfies` / strict return types | `SessionSummary` and `AggregationReport` shapes |


## Bonus

After completing the core challenge, add a generic `foldReport` function that accepts an `AggregationReport` and a `Record<AnalyticsEvent["kind"], (count: number) => string>` visitor, and returns a per-session string summary for each event kind — fully typed with no index signatures.
