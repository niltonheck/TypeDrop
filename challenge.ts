// ============================================================
// Typed Recipe Box: Ingredient Scaling, Diet Filtering & Nutrition Rollup
// ============================================================
// Fill in every section marked TODO. Do NOT use `any` or type assertions.
// All code must compile under strict: true.
// ============================================================

// ── 1. DIET TAGS ─────────────────────────────────────────────
// Requirement 1: Define a union type `DietTag` whose members are exactly:
//   "vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free"
export type DietTag = /* TODO */ string;

// ── 2. NUTRITION INFO ────────────────────────────────────────
// Requirement 2: Define an interface `NutritionInfo` with these numeric fields:
//   calories, protein, carbs, fat   (all numbers, per single serving)
export interface NutritionInfo {
  // TODO
}

// ── 3. INGREDIENT ────────────────────────────────────────────
// Requirement 3: Define an interface `Ingredient` with:
//   name     : string
//   quantity : number   (amount for the recipe's base servings)
//   unit     : string   (e.g. "g", "ml", "tsp")
export interface Ingredient {
  // TODO
}

// ── 4. RECIPE ────────────────────────────────────────────────
// Requirement 4: Define an interface `Recipe` with:
//   id           : string
//   title        : string
//   servings     : number          (base serving count this recipe is written for)
//   dietTags     : readonly DietTag[]
//   ingredients  : readonly Ingredient[]
//   nutrition    : NutritionInfo   (per single serving at base servings)
export interface Recipe {
  // TODO
}

// ── 5. SCALED RECIPE ─────────────────────────────────────────
// Requirement 5: Define an interface `ScaledRecipe` that extends `Recipe` and adds:
//   targetServings    : number
//   scaledIngredients : readonly Ingredient[]
//   scaledNutrition   : NutritionInfo   (totals for ALL targetServings combined)
export interface ScaledRecipe {
  // TODO
}

// ── 6. NUTRITION SUMMARY ─────────────────────────────────────
// Requirement 6: Define an interface `NutritionSummary` with:
//   recipeCount      : number
//   totalCalories    : number
//   totalProtein     : number
//   totalCarbs       : number
//   totalFat         : number
//   averageCalories  : number   (totalCalories / recipeCount, or 0 if empty)
export interface NutritionSummary {
  // TODO
}

// ── 7. FILTER BY DIET TAG ────────────────────────────────────
// Requirement 7: Implement `filterByDietTag`.
//   - Accepts a readonly array of Recipe and a single DietTag.
//   - Returns a new array containing only recipes whose `dietTags` includes
//     the requested tag.
export function filterByDietTag(
  recipes: readonly Recipe[],
  tag: DietTag
): Recipe[] {
  // TODO
  return [];
}

// ── 8. SCALE RECIPE ──────────────────────────────────────────
// Requirement 8: Implement `scaleRecipe`.
//   - Accepts a Recipe and a targetServings number (must be > 0).
//   - Returns a ScaledRecipe where:
//       • scaledIngredients: each ingredient's quantity is multiplied by
//         (targetServings / recipe.servings), rounded to 2 decimal places.
//       • scaledNutrition: each NutritionInfo field is multiplied by targetServings
//         (since nutrition is per single serving), rounded to 2 decimal places.
//   - If targetServings <= 0, throw a RangeError with the message
//     "targetServings must be greater than 0".
export function scaleRecipe(recipe: Recipe, targetServings: number): ScaledRecipe {
  // TODO
  throw new Error("Not implemented");
}

// ── 9. NUTRITION ROLLUP ──────────────────────────────────────
// Requirement 9: Implement `computeNutritionSummary`.
//   - Accepts a readonly array of ScaledRecipe.
//   - Returns a NutritionSummary where:
//       • Each total field sums the corresponding scaledNutrition field across
//         all recipes.
//       • averageCalories = totalCalories / recipeCount  (or 0 if the array is empty).
//       • All numeric fields rounded to 2 decimal places.
export function computeNutritionSummary(
  recipes: readonly ScaledRecipe[]
): NutritionSummary {
  // TODO
  throw new Error("Not implemented");
}

// ── 10. FILTER THEN SCALE (BONUS) ────────────────────────────
// Requirement 10 (bonus): Implement `filterAndScale`.
//   - Accepts a readonly Recipe array, a DietTag, and a targetServings number.
//   - Returns a readonly ScaledRecipe[] of all matching recipes scaled to
//     targetServings, using filterByDietTag and scaleRecipe internally.
export function filterAndScale(
  recipes: readonly Recipe[],
  tag: DietTag,
  targetServings: number
): readonly ScaledRecipe[] {
  // TODO
  return [];
}
