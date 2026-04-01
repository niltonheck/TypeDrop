# Typed Notification Dispatcher

**Difficulty:** Medium

## Scenario

You're building the notification service for a SaaS platform. The system must dispatch typed notifications across multiple channels (email, SMS, push), fan out deliveries concurrently with a configurable limit, and collect a fully typed per-channel Result for every recipient — with zero `any`.

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

| Skill | Where in code |
|---|---|
| Discriminated unions | `Notification = EmailNotification \| SmsNotification \| PushNotification` |
| Branded types | `RecipientId`, `NotificationId` — `Brand<T, B>` pattern |
| Mapped + conditional types | `ChannelSenders` mapped over `"email" \| "sms" \| "push"` with `Extract<Notification, { channel: K }>` |
| Utility types (derived) | `DispatchSummary` built from `Result<…>` without hand-writing the union |
| Generic constrained types | `ChannelSender<N extends Notification>` |
| Runtime narrowing / validation | `validateNotification(raw: unknown) → Result<Notification, ValidationError>` |
| `Result<T, E>` error handling | Every function returns `Result` — no throwing after stubs |
| Concurrency with limit | `fanOutDispatch` batches dispatches by `concurrencyLimit` using `Promise.all` |
| Type narrowing via channel | `dispatch` switches on `notification.channel` to select the right sender |
| `satisfies` / exhaustive checks | Encouraged in `dispatch` switch to ensure all channels handled |

## Bonus

Extend `DispatchSummary` with a `byChannel` field typed as `{ [K in Notification["channel"]]: number }` that counts successes per channel.
