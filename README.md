# Typed Recipe Box: Ingredient Scaling, Diet Filtering & Nutrition Rollup

**Difficulty:** Easy

## Scenario

You're building the recipe-management core for a meal-planning app. Users browse a typed recipe catalogue, filter recipes by dietary tags, scale ingredient quantities to a target serving count, and compute a typed nutrition summary — with the compiler enforcing every ingredient shape, diet tag, scaling result, and rollup field.

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
| Union types (`DietTag`) | `type DietTag` — exactly five string literal members |
| Interface definition | `NutritionInfo`, `Ingredient`, `Recipe`, `ScaledRecipe`, `NutritionSummary` |
| Interface extension | `ScaledRecipe` must extend `Recipe` (adds `targetServings`, `scaledIngredients`, `scaledNutrition`) |
| `readonly` arrays in interfaces | `Recipe.dietTags`, `Recipe.ingredients`, `ScaledRecipe.scaledIngredients`, function params |
| Type-safe function parameters | `filterByDietTag` — `tag: DietTag` rejects arbitrary strings |
| Arithmetic & rounding | `scaleRecipe` — factor = `targetServings / servings`, `Math.round` to 2 dp |
| Guard / validation + typed error | `scaleRecipe` — throws `RangeError` when `targetServings <= 0` |
| `Array.reduce` / aggregation | `computeNutritionSummary` — single-pass sum across `scaledNutrition` fields |
| Composing typed functions | `filterAndScale` — calls `filterByDietTag` then maps with `scaleRecipe` |
| `strict: true` compliance | No `any`, no `as`, no implicit `any` anywhere in the file |

## Bonus

Extend `filterByDietTag` into a `filterByAllDietTags(recipes, tags: readonly DietTag[])` overload that returns only recipes matching every tag in the array, using TypeScript function overloads to distinguish the single-tag vs multi-tag signatures.
