# Typed Event Emitter with Discriminated Subscriptions

**Difficulty:** Medium

## Scenario

You're building the real-time notification layer for a collaborative document editor. Multiple subsystems (presence, cursors, comments, permissions) emit strongly-typed events over a shared bus — subscribers must receive exactly the payload shape for the event they registered for, with no casting and no leaking of unrelated event data.

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
| **Mapped types** (homomorphic) | `ListenerMap` — maps over `DocumentEventMap` keys, preserving per-key payload correlation |
| **Index access types** | `PayloadOf<K>` — `DocumentEventMap[K]` to resolve payload from event name |
| **`keyof` + generic constraint** | `EventNames = keyof DocumentEventMap`; every generic `<K extends EventNames>` |
| **Generic function signatures** | All `TypedEventEmitter` methods (`on`, `once`, `off`, `emit`, `clear`, `listenerCount`) |
| **Template literal types** | `EventNamespace<K>` — `K extends \`${infer NS}:${string}\`` |
| **Conditional types + `infer`** | `EventNamespace` and `EventsInNamespace` (bonus) |
| **`Partial<T>` utility type** | Internal store typed as `Partial<ListenerMap>` (R1) |
| **Readonly arrays in types** | `ListenerMap` values typed as `ReadonlyArray<Listener<K>>` |
| **Closure-based encapsulation** | `createEventEmitter` factory — no class, state hidden in closure |
| **Reference equality / snapshot semantics** | `off` (R4) and `emit` (R5) implementation |


## Bonus

Implement `EventNamespace<K>` and `EventsInNamespace<NS>` as template-literal / conditional types, then use them to type `clearNamespace` so that passing an invalid namespace prefix is a compile-time error.
