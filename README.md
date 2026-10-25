# Typed Recipe Cost Calculator

**Difficulty:** Easy

## Scenario

You're building the pricing engine for a meal-kit delivery app. Recipes are made up of ingredients with quantities and units, and you need to calculate costs, flag expensive recipes, and summarize a weekly menu — with the compiler enforcing every unit, field name, and summary shape.

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

| Skill | Where in the code |
|---|---|
| Union types (`Unit`, `Extract`) | `Unit` type alias; `IngredientPrice.baseUnit` uses `Extract<Unit, "g" \| "ml" \| "unit">` |
| Utility types (`Pick`) | `MenuSummary.cheapestRecipe` / `mostExpensiveRecipe` fields typed as `Pick<RecipeCost, ...>` |
| `readonly` arrays & properties | All interfaces use `readonly`; function params use `readonly RecipeCost[]` |
| `Record<Unit, number>` mapped lookup | Idiomatic implementation of `toBaseUnit` using a conversion map |
| Type narrowing / safe lookup | `Array.find` result correctly handled (may be `undefined`) in `calculateRecipeCost` |
| Rounding to 2 dp | `Math.round(x * 100) / 100` pattern applied consistently |
| `satisfies` / structural compatibility | `summarizeMenu` return value must satisfy `MenuSummary` without casting |
| Error handling with typed throws | `RangeError` thrown on empty input with correct message |

## Bonus

Add a generic `groupByField<T, K extends keyof T>(items: readonly T[], key: K): Map<T[K], readonly T[]>` utility and use it to group `RecipeCost` objects by their `isExpensive` flag — with the compiler enforcing that `K` is a valid key of `T`.
