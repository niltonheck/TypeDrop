# Typed In-Memory Event Bus with Subscription Management

**Difficulty:** Medium

## Scenario

You're building the real-time notification core for a collaborative document editor. Components across the app publish and subscribe to strongly-typed events (cursor moves, document edits, user presence changes); the event bus must guarantee that every subscriber receives exactly the payload shape its event defines — and the compiler must reject any mismatched publish or subscribe call.

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
| Mapped type indexing (`AppEventMap[K]`) | `EventPayload<K>` type alias |
| `keyof` to derive a union | `EventName` type alias |
| Generic type alias with constraint | `EventHandler<K>` |
| Branded / nominal types | `SubscriptionToken` |
| Generic interface methods with inferred `K` | `IEventBus.on`, `.emit`, `.once` |
| Internal generic data structure (no `any`) | subscription registry inside `createEventBus` |
| Discriminated-union-style internal record | `{ token, handler, once }` entries |
| `satisfies` or explicit return-type annotation | `createEventBus` return type |
| Correct `listenerCount` after mutations | Tests 2, 3, 5 |
| `once` self-removal logic | Test 5 & 6 |

## Bonus

Extend the bus with a `pipe` method that forwards all events from one bus instance into another, returning an `off`-able token to stop forwarding.
