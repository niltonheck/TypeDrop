# Typed Notification Dispatcher with Discriminated Unions & Template Literal Channels

**Difficulty:** Easy

## Scenario

You're building the notification service for a project-management app. Users can subscribe to different event channels (email, SMS, push), and each notification type carries its own payload shape. The compiler must guarantee that every notification kind is handled, every channel is valid, and the dispatcher always returns a fully-typed delivery receipt.

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


| Skill exercised | Where in the code |
|---|---|
| Discriminated unions (`kind` literal field) | `Notification` union definition |
| Template literal types | `Channel`, `ChannelTag`, `channelTag` field in receipt |
| Generics with `extends` constraint | `DeliveryReceipt<N extends Notification>`, `dispatch<N extends Notification>` |
| Indexed access type (`N["kind"]`) | `notificationKind` field in `DeliveryReceipt` |
| Exhaustive switch + `assertNever` | `dispatch` switch default branch |
| `Record<K, V>` utility type | `groupReceiptsByChannel` return type and seed object |
| `satisfies` operator | Test harness mock data declarations |


## Bonus

Extend `DeliveryReceipt` with a conditional `retryAfter?: number` field that only appears when `N["kind"]` is `"deadline_approaching"`, using a conditional type.
