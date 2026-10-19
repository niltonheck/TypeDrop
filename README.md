# Typed Shopping Cart Reducer

**Difficulty:** Easy

## Scenario

You're building the cart logic for a lightweight e-commerce checkout flow. Cart actions arrive as a discriminated union, and a pure reducer must apply each action to produce a new typed cart state — the compiler must enforce that every action variant carries exactly the right payload and that the derived totals always stay in sync.

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
| Discriminated union (`type` discriminant) | `CartAction` — four variants keyed on `type` |
| Utility type `Omit<T, K>` | `ADD_ITEM` payload omits `"quantity"` from `CartItem` |
| Exhaustiveness checking via `never` | `default` branch in `cartReducer` switch |
| Utility type `Pick<T, K>` | Return type of `computeTotals` helper |
| Pure function / immutable state updates | `cartReducer` must never mutate its arguments |
| Type narrowing via `switch` | Each case narrows `action` to the specific variant |
| Strict mode compliance (no `any`) | Entire file must compile under `strict: true` |


## Bonus

Handle UPDATE_QTY with quantity <= 0 by automatically removing the item, and write an additional assertion that confirms this behaviour.
