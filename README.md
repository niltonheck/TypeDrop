# Typed Notification Router

**Difficulty:** Easy

## Scenario

You're building the notification dispatch layer for a productivity app. Raw notification payloads arrive as `unknown` from a webhook endpoint; your router must validate them, fan them out to strongly-typed per-channel handlers, and collect a discriminated-union delivery report per notification — with zero `any`.

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
| Discriminated union definition | `Notification` type (R1) |
| Type narrowing / type guards | `parseNotification` (R2) |
| `unknown` → typed narrowing without `as` | `parseNotification` body (R2) |
| Custom typed error class | `ValidationError` usage in R2 |
| Discriminated union — second type | `DeliveryReport` (R3) |
| Exhaustive `switch` with compiler enforcement | `routeNotification` (R4) |
| Union literal type (`"unknown"`) in fallback | `processAll` catch block (R5) |
| `Notification["channel"]` indexed access type | `DeliveryReport` definition (R3) |

## Bonus

Extend `Notification` with a fourth `"slack"` variant and update `routeNotification` so that adding the new channel without handling it in the switch is a compile-time error.
