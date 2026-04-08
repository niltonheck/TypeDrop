# Typed Shopping Cart Summarizer

**Difficulty:** Easy

## Scenario

You're building the checkout screen for an e-commerce app. Raw cart items arrive from local storage as unknown blobs; your engine must validate them, apply typed discount rules, and return a fully typed order summary — with zero `any`.

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
| Discriminated union (`Discount`) | `FlatDiscount \| PercentDiscount \| BuyNGetOneFreeDiscount`; exhaustive `switch` in `calculateDiscount` |
| `Result<T, E>` generic type | Return type of `validateCartItem` and `summarizeCart` |
| Type narrowing (`unknown` → typed) | `validateCartItem` body — checking shape, types, and value ranges |
| `ReadonlySet<Category>` for safe membership check | `VALID_CATEGORIES` used inside `validateCartItem` |
| Utility / branded types | `Category` union used as a type-safe tag across `CartItem`, `BuyNGetOneFreeDiscount`, `SummaryLine` |
| Interface composition | `OrderSummary` aggregates `SummaryLine[]` and numeric fields |
| Strict null / value checks | `priceUsd > 0`, `Number.isInteger(quantity)`, non-empty string guards |
| `Array.reduce` for aggregation | `subtotalUsd`, `itemCount`, `discountAmountUsd` computation |

## Bonus

Add a fourth `Discount` variant `{ kind: "categoryPercent"; category: Category; percent: number }` that applies a percentage discount only to items in the specified category, and handle it exhaustively in `calculateDiscount`.
