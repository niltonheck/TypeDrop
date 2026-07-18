# Typed In-Memory Event Emitter

**Difficulty:** Easy

## Scenario

You're building the notification hub for a real-time dashboard. UI components subscribe to named events and expect their callbacks to receive exactly the right payload shape — no more, no less. Your task is to implement a strongly-typed `EventEmitter` that maps event names to their payload types and enforces that relationship at every call site.

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
| Generic class with constrained type parameter (`EventMap extends Record<string, unknown>`) | `class EventEmitter<EventMap extends ...>` declaration |
| Mapped/indexed access types (`EventMap[K]`) to derive payload types | All method signatures |
| Keyof constraint on generic parameter (`K extends keyof EventMap`) | Every method's `K` type parameter |
| Returning `this` for fluent chaining | `on`, `off`, `once` return types |
| Correct use of `Map` or object to store heterogeneous listener arrays | Private field declaration |
| `once` pattern — wrapping a listener in a disposable closure | `once()` implementation |
| Boolean return type with meaningful semantics | `emit()` returning `true`/`false` |
| Strict null safety — no `!`, no `as`, no `any` | Entire implementation |


## Bonus

Extend the emitter with a `clear(event?)` method that removes all listeners for a specific event, or all listeners across every event when called with no argument — fully typed.
