# Typed Event Bus with Subscriber Registry

**Difficulty:** Medium

## Scenario

You're building the internal messaging backbone for a collaborative document editor. UI components publish strongly-typed domain events; other components subscribe to specific event kinds and must receive exactly the right payload shape — with zero `any`.

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
| Discriminated union (`AppEvent`) | `AppEvent` type definition; `publish` narrows via `event.kind` |
| `Extract<>` utility type | `EventByKind<K>` — resolves union member by `kind` literal |
| Mapped types over a union | `SubscriberRegistry` maps every `EventKind` to `Set<Subscriber<K>>` |
| Generic type parameter constraints (`K extends EventKind`) | `subscribe<K>`, `subscriberCount<K>`, `filterEvents<K>` |
| Type narrowing without assertions | `filterEvents` — filter + type predicate or `Extract`-based guard |
| `Set<T>` with generic element type | `SubscriberRegistry` values; add/delete in `subscribe` |
| `satisfies` / `reduce` to build typed registry | `constructor` — building `SubscriberRegistry` from `ALL_KINDS` |
| Return-type inference from generics | `filterEvents` returns `EventByKind<K>[]` inferred from `K` |
| Callback / function types | `Subscriber<K>` alias; used as Set element type |

## Bonus

Add a one-time `subscribeOnce<K extends EventKind>` method that automatically unsubscribes after the first matching event is received.
