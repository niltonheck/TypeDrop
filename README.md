# Typed Event Emitter with Middleware Pipeline

**Difficulty:** Medium

## Scenario

You're building the core event bus for a real-time collaboration tool. Components emit strongly-typed events, middleware can transform or gate events before they reach subscribers, and every handler is guaranteed by the compiler to receive the exact payload shape for its event.

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

| TypeScript Skill | Where in Code |
|---|---|
| Generic constraint `E extends EventName` | `on`, `once`, `emit`, `listenerCount` signatures |
| Mapped-type index access `AppEventMap[E]` | `Payload<E>` alias, used throughout |
| Discriminated / union return type `Payload<E> \| null \| undefined` | `MiddlewareResult<E>`, `AnyMiddleware` |
| Generic method returning `this` | `use(): this` for fluent chaining |
| `Promise`-based async iteration | `emit()` middleware loop with `await` |
| `Map` and `Set` with generic types | `handlers: Map<EventName, Set<Handler<EventName>>>` |
| Structural subtyping at storage boundary | Storing `Handler<E>` in `Set<Handler<EventName>>` |
| Literal union type | `EmitStatus`, `reason` field in `user:left` |

## Bonus

Add a typed `off(event, handler)` method that removes a specific handler by reference, and extend `EmitRecord` with a `duration` field (in ms) measuring how long the middleware + handler pipeline took.
