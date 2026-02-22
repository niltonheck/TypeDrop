# Typed Event Log Parser

**Difficulty:** Easy

## Scenario

You're building a monitoring dashboard for a cloud platform. Raw event logs arrive as untyped JSON blobs — your job is to safely parse them into a discriminated union of strongly-typed events, then aggregate counts and extract the latest timestamp per event kind.

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
| Discriminated union (`AppEvent`) | `AppEvent = DeployEvent \| ErrorEvent \| ScaleEvent \| AlertEvent` |
| Type narrowing without `as` / `any` | `parseEvent`: checking `kind`, field presence, and types via `typeof` / `in` guards |
| `unknown` input validation | `parseEvent(raw: unknown)` and `parseEventLog(raw: unknown)` |
| Literal type validation at runtime | Checking `severity` against `"low" \| "medium" \| "high" \| "critical"` |
| Mapped type over a union | `EventSummary`: `[K in EventKind]: { count: number; latestTimestamp: number \| null }` |
| Exhaustive initialisation (compile-time safety) | `summariseEvents` must seed all `EventKind` keys |
| Aggregation with `reduce` or loop | `summariseEvents`: counting and tracking max timestamp |
| Array narrowing | `parseEventLog`: `Array.isArray` guard before mapping |


## Bonus

Extend `parseEvent` to collect all validation failure reasons and return a `Result<AppEvent, string[]>` type instead of `AppEvent | null`.
