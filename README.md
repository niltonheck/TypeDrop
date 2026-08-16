# Typed Event Emitter with Discriminated Payloads

**Difficulty:** Medium

## Scenario

You're building the real-time notification hub for a collaborative document editor. Components across the app subscribe to strongly-typed events (cursor moves, edits, presence changes, errors) — the emitter must guarantee that every listener receives exactly the payload shape its event name promises, with no casting and no missed cases.

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
| Generic class with constrained type parameter (`TMap extends EventMap`) | `TypedEmitter<TMap>` class declaration |
| Mapped-type key narrowing via `K extends keyof TMap` | All five `TypedEmitter` methods |
| Precise payload inference (`TMap[K]`) eliminating the need for `any` | `emit`, `on`, `once`, `off` parameter types |
| `Listener<TPayload>` type alias (callback typing) | `Listener<TMap[K]>` in every method signature |
| `Unsubscribe` function-type alias | Return type of `on`, `once`, `replayLast` |
| `WeakMap` or instance-level cache for per-emitter state without mutating the public API | `replayLast` implementation |
| Higher-kinded generic helper (`replayLast<TMap, K extends keyof TMap>`) | `replayLast` function signature |
| Variadic rest parameter with `ReadonlyArray` constraint | `mergeEmitters(...emitters: ReadonlyArray<TypedEmitter<TMap>>)` |
| `satisfies` or `interface extends EventMap` concrete specialisation | `DocEventMap extends EventMap` |
| Discriminated union payload types | `DocErrorPayload.code` union literal |

## Bonus

Add a `pipe` method to `TypedEmitter` that accepts a second `TypedEmitter` whose map is a subtype of the first, and automatically forwards all matching events — fully typed with no casting.
