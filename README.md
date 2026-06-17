# Typed Shopping Cart Price Calculator

**Difficulty:** Easy

## Scenario

You're building the checkout feature for an e-commerce storefront. Raw cart data arrives as `unknown` from a client-side POST request; your engine must validate it, apply typed discount rules, and return a strongly-typed order summary — with zero `any`.

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
| Discriminated unions (`DiscountKind`) | `DiscountKind` type; narrowing inside `validateCart` & `buildOrderSummary` |
| Template literal types | `ValidationError` field `items[${number}]` |
| `Result<T, E>` error-monad pattern | Return type of `validateCart`, `buildOrderSummary`, `processCart` |
| `unknown` → typed narrowing (no `as`) | `validateCart` parameter is `unknown`; must use type guards |
| Union type narrowing (`Currency`) | Validating `currency` is one of three string literals |
| Collecting all errors (no short-circuit) | `validateCart` must gather every `ValidationError` before returning |
| Utility / mapped types awareness | `Result<T,E>` generic used across all three functions |
| Strict arithmetic logic | `discountApplied` capping, `Math.floor`, `Math.min` |


## Bonus

Extend `DiscountKind` with a `{ kind: "bogo"; productId: string }` variant (Buy-One-Get-One) and handle it in both `validateCart` and `buildOrderSummary`.
