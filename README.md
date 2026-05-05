# Typed Notification Dispatcher

**Difficulty:** Medium

## Scenario

You're building the notification layer for a multi-channel SaaS platform. Raw notification payloads arrive as `unknown` from an internal message bus; your dispatcher must validate them, route each to the correct typed handler via a discriminated union, execute all handlers with a per-channel retry policy, and return a strongly-typed dispatch report — with zero `any`.

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
| Discriminated union (`NotificationPayload`) | TODO 1 — union of 4 channel payload types |
| Mapped type over union discriminant (`ChannelRegistry`) | TODO 2 — `{ [K in NotificationPayload["channel"]]: RetryPolicy }` |
| Generic type alias (`ChannelHandler<P>`) | TODO 3 — `(payload: P) => Promise<void>` |
| Mapped type + `Extract` utility type (`HandlerMap`) | TODO 4 — maps each channel key to its narrowed handler type |
| `unknown` → typed narrowing / runtime validation | TODO 5 — `validatePayload` with per-channel guards |
| Result/discriminated-union error type (`ValidationResult`) | TODO 5 — `{ ok: true, value }` / `{ ok: false, error }` |
| Async retry logic with typed outcomes (`DispatchOutcome`) | TODO 6 — `dispatchOne` with attempt counting |
| `Promise.all` for concurrent batch execution | TODO 7 — `dispatchBatch` |


## Bonus

Extend `DispatchOutcome` to include a `durationMs` field measuring wall-clock time per dispatch, and update both `dispatchOne` and `dispatchBatch` to populate it without changing any existing type signatures.
