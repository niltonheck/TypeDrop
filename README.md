# Typed Event Emitter with Wildcard Subscriptions

**Difficulty:** Medium

## Scenario

You're building the real-time notification core for a collaborative document editor. Components across the app subscribe to strongly-typed events — cursor moves, document edits, presence updates — and the compiler must guarantee that every listener receives exactly the payload shape its event carries, with no unsafe casting.

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
| Branded types (phantom property intersection) | `Unsubscribe` type definition |
| Distributive / mapped types | `WildcardListener<TMap>` definition |
| Generic constraints (`K extends keyof TMap`) | All five class methods |
| Discriminated union envelopes | `onAny` listener parameter & `emit` implementation |
| `Map` / `Set` generic typing | Internal listener storage |
| `strict: true` compliance (no `any`, no `as` in stubs) | Entire file |
| Utility type literacy (`keyof`, indexed access `TMap[K]`) | `Listener<TPayload>`, method signatures |

## Bonus

Extend `TypedEmitter` with an `offAll<K extends keyof TMap>(event?: K): void` method that removes all listeners for a specific event when an event name is given, or clears every listener (including wildcards) when called with no argument — fully typed with an optional parameter overload.
