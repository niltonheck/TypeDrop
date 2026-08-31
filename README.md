# Typed In-Memory Event Emitter with Listener Registry

**Difficulty:** Easy

## Scenario

You're building the event bus for a real-time dashboard application. UI components subscribe to typed events (user login, metric update, alert fired), and the compiler must guarantee that every listener receives exactly the right payload shape — no casting, no guessing.

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
| Mapped types (`{ [K in keyof T]: ... }`) | `ListenerRegistry` type definition |
| Generic constraints (`E extends keyof AppEventMap`) | `on`, `off`, `emit`, `listenerCount` methods |
| Index access types (`AppEventMap[E]`) | `Listener<E>` type & `emit` parameter |
| Union / literal types | `"low" \| "medium" \| "high"` in `AppEventMap` |
| Class field typing without `any` | `private registry` field declaration |
| Keyof iteration for initialisation | `constructor` — seeding the registry |
| Function type signatures | `Listener<E>` generic type alias |

## Bonus

Extend EventEmitter with a generic `once<E>(event: E, listener: Listener<E>): void` method that automatically removes the listener after it fires exactly one time.
