# Typed Event Emitter with Discriminated Union Payloads

**Difficulty:** Easy

## Scenario

You're building the real-time notification layer for a project management app. UI components subscribe to named events (task assigned, comment posted, status changed), and every listener must receive a payload that is already narrowed to the correct shape — no casting, no guessing.

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

| Skill Exercised | Where in the Code |
|---|---|
| Discriminated union (`AppEvent`) | `TODO 1` — union of three event types keyed on `type` |
| Distributive mapped type (`EventMap`) | `TODO 2` — maps `AppEvent["type"]` → full event shape |
| Generic listener type (`Listener<K>`) | `TODO 3` — function type parameterised on `K extends keyof EventMap` |
| Bounded generics (`K extends keyof EventMap`) | `on()`, `off()`, `emit()` — every public method is fully generic |
| `keyof` and indexed access types (`EventMap[K]`) | `emit()` signature — parameter type derived from the map |
| `Map` with typed keys | `_listeners` field — `Map<keyof EventMap, ...>` |
| Type narrowing via discriminant | `emit()` body — `event.type` used to look up listeners |
| `satisfies` operator (test harness) | Mock data validated against `AppEvent` without widening |

## Bonus

Add a `once<K extends keyof EventMap>(event: K, listener: Listener<K>): void` method that auto-deregisters the listener after its first invocation.
