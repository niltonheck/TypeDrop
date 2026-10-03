# Typed Notification Router

**Difficulty:** Easy

## Scenario

You're building the notification dispatch layer for a team productivity app. The system receives raw notification events from various channels (email, push, SMS), routes each one to the correct typed handler, and produces a structured delivery summary — all enforced by the compiler with no unsafe casts.

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

| Skill | Where in the code |
|---|---|
| Discriminated unions | `NotificationEvent = EmailEvent \| PushEvent \| SmsEvent` |
| Mapped types | `ChannelEventMap` mapping `Channel` → event type |
| Conditional types | Value side of `ChannelEventMap` (or equivalent) |
| Type narrowing via `switch` | Inside `createRouter`'s `route` function |
| `Partial<Record<...>>` utility type | `byChannel` field of `DeliverySummary` |
| `Record<K, V>` utility type | `counts: Record<DeliveryStatus, number>` |
| Single-pass `reduce` | `summarise` implementation |
| `strict: true` compliance | No `any`, no `as`, no `!` throughout |

## Bonus

Extend `DeliveryResult` with a generic `metadata` field typed as `Readonly<Partial<ChannelEventMap[Channel]>>` and thread it through the router so each result carries a read-only snapshot of the original event fields.
