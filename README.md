# Typed Event Emitter with Discriminated Payloads

**Difficulty:** Easy

## Scenario

You're building the notification layer for a real-time collaboration tool. Components fire strongly-typed domain events (user joined, document edited, cursor moved) and listeners must only receive the exact payload shape for the event they subscribed to — no casting, no `any`.

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
| `interface` as an event map / type registry | `EventMap` definition |
| Generic type alias with constrained type parameters | `Listener<E, K>` type alias |
| Mapped/indexed access types (`E[K]`) for payload inference | `Listener`, `emit`, `once` signatures |
| `keyof` constraint on generic parameters | `on`, `off`, `emit`, `once` methods |
| Generic class with constrained type parameter | `TypedEmitter<E extends EventMap>` |
| Type-safe internal data structure (no `any`) | Listener storage in `TypedEmitter` |
| Factory function with explicit return type annotation | `createRoomEmitter(): TypedEmitter<EventMap>` |
| `once` — closures + self-removing listener pattern | `once` method implementation |

## Bonus

Add a `listenerCount<K extends keyof E>(event: K): number` method that returns the number of currently active listeners for a given event.
