# Typed User Session Aggregator

**Difficulty:** Easy

## Scenario

You're building the analytics layer for a SaaS dashboard. Raw session events arrive as `unknown` from a client-side tracking SDK; your engine must validate them, group them by user, and return a strongly-typed per-user session summary — with zero `any`.

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
| Discriminated union (`Result<T>`) | `Ok<T>` / `Err` types; `validateSessionEvent` return type |
| Generics (`Result<T>`, `Ok<T>`) | Type definitions in section 2 |
| Union literal types (`PageName`) | Type alias + runtime `VALID_PAGES` guard |
| `Record<K, V>` mapped type (`PageVisitMap`) | `PageVisitMap` type alias; initialisation in aggregation |
| Type narrowing (`.ok` discriminant) | Callers of `validateSessionEvent` inside `aggregateSessions` |
| `unknown` → typed narrowing | `validateSessionEvent` parameter + `typeof` / `in` checks |
| Interface design | `SessionEvent`, `UserSessionSummary`, `SessionReport` |
| Aggregation logic with typed accumulators | `aggregateSessions` implementation |

## Bonus

Extend `UserSessionSummary` with a `firstSeen` and `lastSeen` ISO timestamp derived from the validated events' `timestamp` fields, without using `any` or type assertions.
