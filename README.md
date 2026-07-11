# Typed User Notification Preferences Merger

**Difficulty:** Easy

## Scenario

You're building the notification settings module for a SaaS platform. Users can configure per-channel preferences (email, SMS, push), and admins can define org-level defaults. Your module must validate raw preference objects arriving as `unknown`, merge user overrides on top of org defaults, and return a fully-typed `ResolvedPreferences` record — with zero `any`.

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
| Mapped type over a union (`Record`-style) | `PreferencesMap` — `{ [K in Channel]: ChannelConfig }` |
| Union type narrowing in a type guard | `isFrequency` — narrowing `unknown` to `Frequency` |
| Structural type guard with property checks | `isChannelConfig` — checking shape of `unknown` |
| `Partial<T>` utility type | `parsePartialPreferences` return type |
| Iterating over `unknown` object safely | `parsePartialPreferences` — `Object.keys` + guard |
| `satisfies` operator | `PLATFORM_DEFAULTS satisfies PreferencesMap` |
| Template / union `Channel` key filtering | `parsePartialPreferences` — checking if key is a `Channel` |
| Composing validated data into a typed result | `mergePreferences` — building `ResolvedPreferences` |


## Bonus

Extend `ResolvedPreferences` with a `skippedChannels` field that lists channels present in `userRaw` that were dropped due to validation failures, using the same `Channel` union type.
