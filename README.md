# Typed Shopping Cart Aggregator

**Difficulty:** Easy

## Scenario

You're building the order-summary layer for an e-commerce checkout flow. Raw cart items arrive as `unknown` from a localStorage deserializer; your engine must validate them, apply typed discount rules, and produce a strongly-typed order summary — with zero `any`.

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
| `unknown` → typed narrowing (runtime validation) | `validateCartItem` |
| Branded / nominal types | `ValidatedCartItem & { __validated: true }` |
| Discriminated union + exhaustive `switch` | `applyDiscounts` — `DiscountRule` kinds |
| `ReadonlyArray<T>` parameter typing | All four function signatures |
| Single-pass aggregation with `reduce` / loops | `buildLineItems`, `buildOrderSummary` |
| Result clamping / arithmetic safety | `applyDiscounts` clamp, `totalInCents` floor |
| Interface composition | `OrderSummary` composed from `LineItem[]` + scalars |

## Bonus

Add a fifth `DiscountRule` kind `"category-flat"` that applies a flat discount per matching category, and update `applyDiscounts` + `buildOrderSummary` so TypeScript still enforces exhaustive handling with no `any`.
