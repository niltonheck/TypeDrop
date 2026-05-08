// ============================================================
// Typed Recipe Nutrition Aggregator
// challenge.ts — fill in every TODO; do NOT use `any` or `as`
// ============================================================

// -----------------------------------------------------------
// 1. DOMAIN TYPES
// -----------------------------------------------------------

/** Macro-nutrient values for a single ingredient (per 100 g). */
export interface NutritionPer100g {
  calories: number;   // kcal
  protein: number;    // g
  fat: number;        // g
  carbs: number;      // g
  fiber: number;      // g
}

/** One ingredient entry inside a raw recipe payload. */
export interface Ingredient {
  name: string;
  grams: number;           // actual quantity used in the recipe
  nutrition: NutritionPer100g;
}

/** A validated recipe ready for processing. */
export interface Recipe {
  id: string;
  title: string;
  servings: number;        // number of servings the recipe yields
  ingredients: Ingredient[];
}

// -----------------------------------------------------------
// 2. RESULT TYPES
// -----------------------------------------------------------

/** Aggregated nutrition for one serving of a recipe. */
export interface NutritionPerServing {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

/** Per-ingredient contribution to the recipe totals (absolute, not per-serving). */
export interface IngredientContribution {
  name: string;
  totalCalories: number;   // kcal contributed by this ingredient (whole recipe)
  percentOfRecipeCalories: number; // rounded to 2 decimal places
}

/** The final summary returned for a recipe. */
export interface RecipeSummary {
  id: string;
  title: string;
  servings: number;
  perServing: NutritionPerServing;
  topContributors: IngredientContribution[]; // sorted descending by totalCalories
}

// -----------------------------------------------------------
// 3. VALIDATION ERRORS
// -----------------------------------------------------------

/** Discriminated union covering every validation failure. */
export type ValidationError =
  | { kind: "MISSING_FIELD";  field: string }
  | { kind: "WRONG_TYPE";     field: string; expected: string }
  | { kind: "OUT_OF_RANGE";   field: string; min: number; max: number }
  | { kind: "EMPTY_ARRAY";    field: string };

// -----------------------------------------------------------
// 4. RESULT WRAPPER  (lightweight — no external libraries)
// -----------------------------------------------------------

export type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

// -----------------------------------------------------------
// 5. VALIDATION  —  unknown → Result<Recipe, ValidationError>
// -----------------------------------------------------------

/**
 * Validate a raw unknown payload and return a typed Recipe on success,
 * or the first ValidationError encountered on failure.
 *
 * Rules:
 *  - `id`       must be a non-empty string
 *  - `title`    must be a non-empty string
 *  - `servings` must be a number in the range [1, 100] (inclusive)
 *  - `ingredients` must be a non-empty array; each element must have:
 *      • `name`    — non-empty string
 *      • `grams`   — number > 0
 *      • `nutrition` — object with all five keys (calories, protein, fat,
 *                      carbs, fiber) each being a number >= 0
 *
 * TODO: implement this function.
 */
export function validateRecipe(raw: unknown): Result<Recipe, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 6. AGGREGATION  —  Recipe → RecipeSummary
// -----------------------------------------------------------

/**
 * Given a validated Recipe, compute and return a RecipeSummary.
 *
 * Steps:
 *  1. For each ingredient, scale its NutritionPer100g values by
 *     (ingredient.grams / 100) to get absolute totals for the whole recipe.
 *  2. Sum scaled values across all ingredients to get recipe-wide totals.
 *  3. Divide each total by `recipe.servings` to get perServing values.
 *     Round each perServing value to 2 decimal places.
 *  4. Compute each ingredient's `totalCalories` (scaled, whole recipe)
 *     and `percentOfRecipeCalories` = (ingredientTotalCalories / recipeTotalCalories) * 100,
 *     rounded to 2 decimal places. If recipeTotalCalories === 0, set percent to 0.
 *  5. Sort topContributors descending by totalCalories.
 *
 * TODO: implement this function.
 */
export function aggregateNutrition(recipe: Recipe): RecipeSummary {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 7. PIPELINE  —  unknown[] → RecipeSummary[]
// -----------------------------------------------------------

/**
 * Process an array of unknown payloads end-to-end:
 *  1. Validate each payload with `validateRecipe`.
 *  2. Silently skip (do NOT throw) any payload that fails validation.
 *  3. Aggregate nutrition for every valid recipe with `aggregateNutrition`.
 *  4. Return the resulting RecipeSummary array, preserving the order
 *     of valid entries.
 *
 * TODO: implement this function.
 */
export function processRecipes(rawPayloads: unknown[]): RecipeSummary[] {
  // TODO
  throw new Error("Not implemented");
}
