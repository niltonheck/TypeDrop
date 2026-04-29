# Typed Shopping Cart Aggregator

**Difficulty:** Easy

## Scenario

You're building the order summary engine for an e-commerce storefront. Raw cart payloads arrive as `unknown` from a client-side checkout form; your engine must validate them, compute per-line totals with applied discounts, and return a strongly-typed order summary — with zero `any`.

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

| Skill | Where in Code |
|---|---|
| Discriminated unions | `Discount`, `CartValidationError`, `CartResult` |
| Exhaustive narrowing | `applyDiscount` switch/if on `discount.kind` |
| `unknown` → typed narrowing (no `any`) | `parseCartItem`, `processCart` |
| Optional properties | `CartItem.discount?: Discount` |
| Utility / aggregate types | `OrderSummary` computed from `LineTotal[]` |
| Typed error propagation | `parseCartItem` throws `CartValidationError`; `processCart` catches and wraps |
| `strict: true` compliance | All stubs — no `any`, no `as` |

## Bonus

Add a `couponCode` field to `CartItem` and a third `Discount` variant `{ kind: "coupon"; code: string; rate: number }`, updating `applyDiscount` to handle it exhaustively.
