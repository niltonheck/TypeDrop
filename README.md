# Typed Event RSVP Aggregator

**Difficulty:** Easy

## Scenario

You're building the guest-management layer for an event-planning app. Raw RSVP payloads arrive as `unknown` from a public form endpoint; your aggregator must validate them, tally attendance per event, and return a strongly-typed summary — with zero `any`.

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
| Discriminated union (`Result<T,E>`) | `validateRsvp` return type; narrowed via `.ok` in tests |
| Union type narrowing | `status` checked against `RsvpStatus` union literals |
| Branded / literal union (`RsvpValidationError`) | Error codes constrained to exact string literals |
| `readonly` arrays & properties | `Rsvp`, `EventSummary`, `AggregationReport` fields |
| `Readonly<Record<K,V>>` utility type | `summaries` field in `AggregationReport` |
| Runtime `unknown` → typed narrowing | `validateRsvp` guards `typeof`, `in`, range checks |
| `Array.reduce` aggregation | `buildEventSummary` tallying counts & totals |
| Grouping with `Record` / `Map` | `aggregateRsvps` grouping RSVPs by `eventId` |
| Default value handling without `as` | `plusOnes` absent → default `0` inside validator |

## Bonus

Extend `AggregationReport` with a `topEvent` field (type `EventSummary | null`) that points to the event with the highest `totalAttending`, using a conditional type or `Extract` to keep it fully typed.
