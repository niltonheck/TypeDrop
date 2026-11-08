# Typed Shopping Cart with Discount Rules

**Difficulty:** Easy

## Scenario

You're building the cart engine for a small e-commerce storefront. Products come in different categories, discounts are expressed as typed rules (percentage off, fixed amount off, or buy-X-get-Y free), and the compiler must enforce every product shape, discount variant, and line-item calculation with no escape hatches.

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
| Branded types (`Brand<T, B>`) | `ProductId`, `makeProductId` |
| Discriminated union | `DiscountRule` with `kind` discriminant |
| Union literal types | `Category` type |
| Exhaustive narrowing (`switch`/`if` on `kind`) | `calcLineDiscount` |
| `ReadonlyArray<T>` usage | `CartSummary.items`, function signatures |
| Generics with `extends` constraint | `filterByCategory<C extends Category>` |
| Null handling without `any` | `discount: DiscountRule \| null` in `calcLineDiscount` |
| Interface composition | `CartItem` referencing `Product` and `DiscountRule` |

## Bonus

Add a `applyCartCap(summary: CartSummary, capInCents: number): CartSummary` function that re-caps the total discount so `totalInCents` never falls below `capInCents`, distributing the reduction proportionally across line-item discounts.
