# Typed Shopping Cart Aggregator

**Difficulty:** Easy

## Scenario

You're building the order summary engine for a small e-commerce storefront. Raw cart line items arrive as `unknown` JSON from the client; your engine must validate them, apply typed discount rules, and produce a strongly-typed order summary — with zero `any`.

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
| Generic `Result<T, E>` discriminated union | `TODO 1` — `Result` type definition |
| Discriminated union narrowing (`kind` field) | `validateDiscount` — branching on `"percentage"` vs `"fixed"` |
| `unknown` → typed narrowing (runtime validation) | `parseLineItem` & `validateDiscount` — guard checks before casting |
| Union type (`Category`) membership check | `parseLineItem` R3 — validating `category` field |
| Mapped aggregation with `Record` / `Map` | `buildOrderSummary` R19 — computing `categoryCount` & `topCategory` |
| Short-circuit error propagation | `buildOrderSummary` R14–R16 — early return on first invalid item/discount |
| Clamping & arithmetic on integer values | `buildOrderSummary` R18 — discount accumulation & `grandTotal` clamp |


## Bonus

Add a `applyDiscounts` helper with the signature `(subtotal: number, categorySubtotals: Record<Category, number>, discounts: DiscountRule[]) => number` and use it inside `buildOrderSummary`.
