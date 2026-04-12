# Typed Notification Dispatcher

**Difficulty:** Medium

## Scenario

You're building the notification delivery layer for a team collaboration app. Raw notification payloads arrive from a message broker as unknown blobs; your dispatcher must validate them, route them through a registry of typed channel handlers, and return a fully typed delivery report — with zero `any`.

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
| Discriminated union (`NotificationPayload`) | `TODO 1` — union of four payload interfaces on `channel` field |
| Mapped type over a union (`ChannelHandlerMap`) | `TODO 2` — maps each `ChannelKind` to the correct handler signature |
| Conditional/extract type to pick the right payload variant | `TODO 2` helper — `Extract<NotificationPayload, { channel: K }>` |
| Type narrowing without `as` (`validatePayload`) | `TODO 3` — `typeof`, `in`, string checks to narrow `unknown` |
| `Promise.allSettled` for concurrent fault-tolerant dispatch | `TODO 4` — `R11`, `R12` |
| Aggregation into a typed report struct | `TODO 4` — `R13`, `DispatchReport` |
| `Partial<ChannelHandlerMap>` + default handler fill | `TODO 5` — `createHandlerRegistry` |
| `satisfies` or explicit return type annotation | `dispatchAll` return type `Promise<DispatchReport>` |

## Bonus

Extend `DispatchReport` with a `byChannel` field typed as `Partial<Record<ChannelKind, { sent: number; failed: number }>>` and populate it inside `dispatchAll`.
