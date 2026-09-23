# Typed Recipe Ingredient Scaler

**Difficulty:** Easy

## Scenario

You're building the core logic for a recipe management app. Home cooks can scale any recipe up or down by a multiplier, and the app must return a fully-typed scaled recipe where every ingredient's quantity has been adjusted and units are preserved exactly as the compiler understands them.

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


| TypeScript Skill | Where It Appears |
|---|---|
| Union types | `Unit` — 11-member string union |
| `interface` definitions | `Ingredient`, `Recipe` |
| Utility types (`Omit`, `Pick`, intersection `&`) | `ScaledIngredient`, `ScaledRecipe` derived types |
| `readonly` arrays | `Recipe.ingredients`, return types |
| Generics with `extends` constraint | `findIngredientsByUnit<U extends Unit>` |
| Generic narrowing in return type | `readonly (Ingredient & { unit: U })[]` |
| `satisfies` operator | test harness `pancakeRecipe` mock |
| Strict null safety | `flour?.quantity` optional chaining in tests |


## Bonus

Extend `scaleRecipe` to accept an optional `{ roundServings?: boolean }` options bag typed with a mapped type, so callers can opt out of rounding servings to an integer.
