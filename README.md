# Typed Shopping Cart with Discount Strategy & Line-Item Aggregation

**Difficulty:** Easy

## Scenario

You're building the checkout engine for a small e-commerce storefront. Each cart holds typed line items, and the store supports several mutually-exclusive discount strategies (percentage off, fixed amount off, buy-X-get-Y free). The compiler must guarantee that every discount kind is fully handled and that the cart summary is always correctly typed.

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
| Discriminated union (`Discount`) | `Discount` type + `switch` in `computeDiscountAmount` |
| Indexed access type (`Discount["kind"]`) | `DiscountKind` (TODO 1) |
| Mapped type + `Extract` utility | `DiscountByKind` (TODO 2) |
| Exhaustive `switch` narrowing | `computeDiscountAmount` — all three branches |
| `readonly` arrays & interfaces | `LineItem[]`, `CartSummary`, function params |
| Function overloads with generic `K extends DiscountKind` | `getDiscountLabel` (TODO 6) |
| `null` union handling | `discount: Discount \| null` in `buildCartSummary` |
| Strict-mode compliance (no `any`, no `as`) | Entire file |


## Bonus

Add a `mergeDiscounts` function that accepts two `Discount` values and returns the one that saves the customer more money, with its return type inferred as `Discount`.
