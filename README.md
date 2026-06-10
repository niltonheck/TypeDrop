# Typed Shopping Cart Discount Engine

**Difficulty:** Easy

## Scenario

You're building the checkout engine for an e-commerce platform. Cart items arrive as `unknown` from a storefront API; your engine must validate them, apply the correct typed discount rule to each item, and return a strongly-typed order summary — with zero `any`.

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


| Skill Exercised | Where in the Code |
|---|---|
| Discriminated unions (`kind` field) | `DiscountRule` type and all four variants |
| Type predicate functions (`value is T`) | `isValidCartItem`, `isValidDiscountRule` |
| `unknown` → typed narrowing at runtime | Validation logic inside both guard functions |
| Exhaustive union handling (switch/if-else over `kind`) | `applyDiscount` — all four discount branches |
| Utility type `Pick<T, K>` | Return type of `applyDiscount` |
| Aggregation with `reduce` or iteration | `buildOrderSummary` — summing lines |
| Strict null safety & object shape checks | Guard functions checking `typeof`, `null`, required fields |


## Bonus

Extend `buildOrderSummary` to accept an optional `couponCode: string` parameter backed by a `Record<string, DiscountRule>` lookup, applying a store-wide discount on top of all line discounts.
