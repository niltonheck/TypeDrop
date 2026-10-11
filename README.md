# Typed Event Emitter with Discriminated Listeners

**Difficulty:** Easy

## Scenario

You're building the notification layer for a real-time dashboard. UI components subscribe to named events, and the compiler must guarantee that every listener receives exactly the payload shape its event name implies — no runtime surprises, no casting.

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

| TypeScript Skill | Where It Appears |
|---|---|
| Generic classes (`TypedEmitter<TMap extends EventMap>`) | Class declaration |
| Bounded generics (`K extends keyof TMap`) | Every method signature |
| Indexed access types (`TMap[K]`) | `Listener<TMap[K]>` and `payload: TMap[K]` |
| Index signature interfaces | `EventMap` base interface |
| Interface extension | `DashboardEventMap extends EventMap` |
| Union literal types | `severity: "low" \| "medium" \| "high"` in payload |
| Generic factory functions | `createEmitter<TMap>()` |
| `Map` / `Set` data structures | Internal listener storage |

## Bonus

Add a `clear<K extends keyof TMap>(event: K): void` method that removes all listeners for a given event, and verify that `listenerCount` returns 0 afterwards.
