# Typed Recipe Nutrition Aggregator

**Difficulty:** Easy

## Scenario

You're building the nutrition-analysis layer for a meal-planning app. Raw recipe payloads arrive as `unknown` from a third-party food database API; your engine must validate them, aggregate per-serving nutrition totals, and return a strongly-typed nutrition summary — with zero `any`.

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
| Discriminated union (`ValidationError`) | `validateRecipe` — narrows `kind` to produce typed errors |
| Generic `Result<T, E>` type | Return type of `validateRecipe`; consumed in `processRecipes` |
| `unknown` → typed narrowing (no `any`) | `validateRecipe` — all field checks via `typeof` / `Array.isArray` |
| Interface composition (`NutritionPer100g` → `Ingredient` → `Recipe`) | Domain model definition |
| Type-safe pipeline design | `processRecipes` — chains validate → filter → aggregate |
| Numeric aggregation with precision | `aggregateNutrition` — scaling, summing, `toFixed` rounding |
| Array sorting with typed comparator | `topContributors` sorted descending by `totalCalories` |
| `satisfies` / strict literal checks | Optional stretch goal with `satisfies` on mock data |


## Bonus

Add a fourth exported function `rankRecipesByCalories(summaries: RecipeSummary[]): RecipeSummary[]` that returns summaries sorted ascending by `perServing.calories` and is typed so its return type is inferred as `RecipeSummary[]` without any explicit cast.
