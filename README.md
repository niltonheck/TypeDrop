# Typed Notification Preference Engine

**Difficulty:** Medium

## Scenario

You're building the notification settings module for a SaaS platform. Users configure per-channel delivery rules (email, SMS, push), and your engine must validate raw unknown config payloads, merge them with system-level defaults, and produce a resolved, strongly-typed preference map — surfaced through a `Result<T, E>` type so callers can handle every failure mode explicitly.

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
| Discriminated union (`Result<T,E>`) | `Ok<T>`, `Err<E>`, `Result<T,E>` types; `ok()` / `err()` helpers |
| Mapped types | `UserPreferences` (`[C in Channel]?:`), `ResolvedPreferences` (`[C in Channel]:`), `ChannelSummaryMap` |
| Interface with literal-keyed union | `ChannelOptionMap` — each `Channel` key maps to a distinct options shape |
| `satisfies` keyword | `SYSTEM_DEFAULTS … satisfies ResolvedPreferences` |
| Template literal types | `ChannelSummaryKey = \`${Channel}_summary\`` |
| Type narrowing / unknown → typed | `parsePreferences` narrows `unknown` field-by-field without `as` or `any` |
| Discriminated union error hierarchy | `PreferenceError` with `validation_error` and `unknown_channel` variants |
| Result chaining / composition | `resolvePreferences` composes `parsePreferences` → `mergeWithDefaults` |
| Generic helper constructors | `ok<T>()` and `err<E>()` are fully generic |
| Exhaustive narrowing | `describeResolved` must handle each `Channel` branch |


## Bonus

Extend PreferenceError with a third variant `{ kind: "conflicting_hours"; message: string }` and emit it from parsePreferences when `quietHoursStart === quietHoursEnd` for an SMS channel block.
