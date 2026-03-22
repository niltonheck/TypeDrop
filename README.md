# Typed Notification Dispatch Router

**Difficulty:** Medium

## Scenario

You're building the notification layer for a SaaS platform. Users can subscribe to different channels (email, SMS, push), and your router must validate raw subscription configs, fan out typed messages to each channel's handler, and collect a structured per-channel delivery report — surfaced through a `Result<T, E>` type with zero `any`.

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


| Skill Exercised | Where in `challenge.ts` |
|---|---|
| Discriminated union types | `Channel`, `NotificationMessage`, `DispatchError` |
| Mapped types over a union key | `DeliveryOutcome` (`Channel["kind"]` as key universe) |
| Generic type aliases | `ChannelHandler<C, M>` |
| Mapped type with `Extract<>` | `HandlerRegistry` (per-kind handler narrowing) |
| `Result<T, E>` / error monad | `validateSubscription` return, `dispatchNotifications` return |
| Runtime type narrowing (`unknown` → typed) | `validateSubscription` — parsing `raw.channels` |
| `Promise.all` concurrent dispatch | `dispatchNotifications` — R7 |
| Exhaustive channel matching | `dispatchNotifications` — R5/R6 per-channel routing |
| `readonly` arrays | `ValidatedSubscription.channels`, function params |
| `strict: true` / no `any` | Entire file |


## Bonus

Brand `userId` as a `NonEmptyString` using a branded type so the compiler rejects plain `string` assignments without an explicit validation call.
