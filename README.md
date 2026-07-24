# Typed Event Emitter with Wildcard Subscriptions & Replay

**Difficulty:** Hard

## Scenario

You're building the real-time notification backbone for a collaborative document editor. Components subscribe to strongly-typed events (e.g. `"cursor:moved"`, `"doc:saved"`, `"user:joined"`), and late-joining subscribers can replay the last N events they missed — all with zero type-unsafe escape hatches.

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
| Generic constraint (`TMap extends BaseEventMap`) | `createEmitter<TMap>()`, `Emitter<TMap>` interface |
| Distributive mapped type for discriminated union | `AnyEvent<TMap>` — `{ [K in keyof TMap]: { event: K; payload: TMap[K] } }[keyof TMap]` |
| Indexed access types (`TMap[K]`) | Every method signature in `Emitter<TMap>` |
| Bounded type parameters (`K extends keyof TMap`) | `.on`, `.once`, `.emit`, `.replay`, `.history`, `.off` |
| `ReadonlyArray<TMap[K]>` return type (no widening) | `.history()` |
| Type-safe `Map` usage without `any` | Internal per-event handler & history storage |
| Discriminated union narrowing at call-site | `test_onAny` — narrowing on `e.event` |
| `satisfies` / structural compatibility check | `DocEditorEvents` shape used in tests |
| No `any`, `as`, or `!` assertions | Entire `challenge.ts` |
| Unsubscribe / cleanup function typing | `Unsubscribe = () => void` returned by all subscription methods |

## Bonus

Extend `.onAny` so the handler also receives a `timestamp: number` (milliseconds since the emitter was created) on every event object, and update `AnyEvent<TMap>` to include it — without widening any existing payload types.
