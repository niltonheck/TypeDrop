# Typed Notification Dispatcher with Retry & Channel Routing

**Difficulty:** Medium

## Scenario

You're building the notification layer for a user-facing SaaS app. Raw notification payloads arrive as `unknown` from an internal queue; your dispatcher must validate them, route them to the correct typed channel handler (email, SMS, push), fan out deliveries concurrently, and return a strongly-typed delivery report — with zero `any`.

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
| Discriminated union (`channel` literal) | `NotificationPayload` — R1 |
| `Extract<Union, { channel: K }>` to pair mapped keys with payload variants | `ChannelRegistry` — R6 |
| Generic function type `ChannelHandler<T extends NotificationPayload>` | R5 |
| Mapped type over union literals (`Record` / `{ [K in ...]}: ...`) | `DeliveryReport["summary"]` — R3 |
| Runtime type narrowing `unknown → NotificationPayload` (no `as`) | `parsePayload` — R4 |
| `Promise.allSettled` for concurrent fan-out | `dispatchAll` — R8 |
| Retry loop with typed error capture | `dispatchOne` — R7 |
| Exhaustive channel routing via discriminant | `dispatchOne` — R7 |


## Bonus

Add a `timeout: number` field (milliseconds) to each payload variant and race each handler call against `AbortSignal.timeout` inside `dispatchOne`, treating a timeout as a retryable failure.
