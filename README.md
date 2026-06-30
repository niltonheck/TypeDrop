# Typed Shopping Cart with Discount Resolution

**Difficulty:** Easy

## Scenario

You're building the checkout module for a small e-commerce storefront. Raw cart payloads arrive as `unknown` from the client; your module must validate them into strongly-typed `CartItem` records, apply the correct discount strategy per item category, and return a fully-typed order summary — with zero `any`.

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
| Union types (`Category`) | `type Category` definition |
| Discriminated union (`Discount`) | `type Discount` with `kind` discriminant |
| Mapped / `Record` utility type (`DiscountPolicy`) | `type DiscountPolicy` covering all Categories |
| `unknown` → typed narrowing & runtime validation | `parseCartItem` — field-by-field guards |
| Exhaustive `switch` + `assertNever` | `applyDiscount` — `default: assertNever(discount)` |
| Result/discriminated-union return type (`OrderSummary`) | `buildOrderSummary` return type |
| Error collection (don't fail-fast) | `buildOrderSummary` — accumulate all parse errors |
| `strict: true` compliance (no `any`) | Entire file |


## Bonus

Extend `DiscountPolicy` to support a `"buy2get1"` discount variant and update `applyDiscount` to handle it — every call site that forgets the new variant should immediately produce a compile error.
