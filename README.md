# Typed Shopping Cart with Discount Rules & Order Summary

**Difficulty:** Easy

## Scenario

You're building the checkout layer for a small e-commerce storefront. Cart items and discount codes arrive as raw input; your module must validate them into strongly-typed structures, apply the correct discount strategy, and return a fully-typed order summary — with zero `any`.

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
| Union types (`ProductCategory`) | `PRODUCT_CATEGORIES`, `CartItem.category` |
| Discriminated union (`Discount`) | `Discount` type with `kind` tag |
| `unknown` → typed narrowing (no `as`) | `validateCartItem` body |
| Exhaustive `switch` on discriminant | `applyDiscount` switch on `discount.kind` |
| Utility type usage (`null` union) | `OrderSummary.appliedCode: string \| null`, `discount: Discount \| null` |
| Single-pass aggregation (`reduce`) | `buildOrderSummary` subtotal computation |
| Strict `strict: true` compliance | No `any`, no type assertions anywhere |

## Bonus

Extend `Discount` with a fourth variant `{ kind: "bundle"; code: string; itemIds: [string, string]; discountPercent: number }` that applies a percentage discount only when both specified item IDs are present in the cart, and handle it exhaustively in `applyDiscount`.
