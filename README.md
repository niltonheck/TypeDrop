# Typed Event RSVP Aggregator

**Difficulty:** Easy

## Scenario

You're building the RSVP processing module for an event management platform. Raw RSVP submissions arrive as `unknown` from a webhook; your module must validate them into strongly-typed `Rsvp` records, tally responses by status, and return a fully-typed `RsvpSummary` — with zero `any`.

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
| Union types (`RsvpStatus`) | `type RsvpStatus` definition |
| Discriminated union / Result type | `type Result<T>` with `ok: true/false` variants |
| Mapped / Record utility type | `counts` field in `RsvpSummary` typed as `Record<RsvpStatus, number>` |
| Generic type parameter | `Result<T>` generic used in `parseRsvp` and `aggregateRsvps` return types |
| `unknown` → typed narrowing | `parseRsvp` narrowing `raw` with `typeof`, `in`, value checks |
| Exhaustive status guard | Checking all three `RsvpStatus` literals in `parseRsvp` |
| Type-safe aggregation | `aggregateRsvps` iterating, filtering, and tallying with full type coverage |
| `strict: true` compliance | No `any`, no type assertions, all fields explicitly typed |


## Bonus

Extend `RsvpSummary` with a `topGuest` field typed as `Rsvp | null` that holds the valid, matching RSVP with the highest `guests` count (or `null` if none exist).
