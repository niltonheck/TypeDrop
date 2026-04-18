# Typed Notification Router

**Difficulty:** Medium

## Scenario

You're building the notification dispatch layer for a multi-channel messaging platform. Raw notification payloads arrive as unknown JSON from a message queue; your router must validate them, fan-out to the correct typed channel handlers, and produce a structured per-recipient delivery report — with zero `any`.

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
| Discriminated union (`channel` discriminant) | `NotificationPayload`, `DeliveryResult` |
| `Extract<>` utility type for variant narrowing | `HandlerRegistry` mapped type |
| Mapped type over union keys | `HandlerRegistry` |
| Generic type with constraint (`T extends NotificationPayload`) | `ChannelHandler<T>` |
| Runtime validation of `unknown` → narrow typed result | `validatePayload` |
| Type narrowing via discriminant (`channel` switch) | `validatePayload` internals |
| `Promise.allSettled` for concurrent fan-out | `routeNotifications` |
| `satisfies` operator for registry builder | `createRegistry` |
| Structured aggregation of typed results | `DispatchReport` assembly |
| User-defined type guard (inline filter predicate) | test harness `filter` calls |

## Bonus

Add a `retryOnFailure` wrapper around each handler call that retries up to 2 times (with exponential backoff) before recording a `DeliveryFailure`, and express the retry count as a branded `type RetryCount = 0 | 1 | 2`.
