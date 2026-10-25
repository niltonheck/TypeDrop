// ============================================================
// Typed Recipe Cost Calculator
// challenge.ts
// ============================================================
// Scenario: You're building the pricing engine for a meal-kit
// delivery app. Recipes are made up of ingredients with
// quantities and units, and you need to calculate costs, flag
// expensive recipes, and summarize a weekly menu.
//
// Rules:
//   - strict: true, no `any`, no type assertions (`as`)
//   - All requirements are numbered comments below
// ============================================================

// --------------- Domain Types --------------------------------

/** All supported units of measure */
export type Unit = "g" | "kg" | "ml" | "l" | "unit";

/**
 * A price-list entry for a single ingredient.
 * pricePerBaseUnit is always in the BASE unit:
 *   - weight  → price per gram  (g)
 *   - volume  → price per ml
 *   - discrete → price per unit
 */
export interface IngredientPrice {
  readonly name: string;
  readonly pricePerBaseUnit: number; // always in base unit
  readonly baseUnit: Extract<Unit, "g" | "ml" | "unit">;
}

/** One ingredient line inside a recipe */
export interface RecipeIngredient {
  readonly ingredientName: string; // must match an IngredientPrice.name
  readonly quantity: number;
  readonly unit: Unit;
}

/** A single recipe */
export interface Recipe {
  readonly id: string;
  readonly name: string;
  readonly servings: number;
  readonly ingredients: readonly RecipeIngredient[];
}

/** The cost breakdown returned for a recipe */
export interface RecipeCost {
  readonly recipeId: string;
  readonly recipeName: string;
  readonly totalCost: number;        // full recipe cost, rounded to 2 dp
  readonly costPerServing: number;   // totalCost / servings, rounded to 2 dp
  readonly isExpensive: boolean;     // true when costPerServing > threshold
}

/** Summary of a collection of recipes */
export interface MenuSummary {
  readonly totalRecipes: number;
  readonly averageCostPerServing: number; // rounded to 2 dp
  readonly cheapestRecipe: Pick<RecipeCost, "recipeId" | "recipeName" | "costPerServing">;
  readonly mostExpensiveRecipe: Pick<RecipeCost, "recipeId" | "recipeName" | "costPerServing">;
  readonly expensiveCount: number;         // how many recipes are flagged isExpensive
}

// --------------- Unit Conversion -----------------------------

/**
 * Requirement 1 — implement `toBaseUnit`.
 *
 * Converts a quantity in `unit` to the ingredient's base unit.
 * Conversion rules:
 *   kg  → g    : multiply by 1000
 *   l   → ml   : multiply by 1000
 *   g, ml, unit: no conversion needed (already base)
 *
 * The return type must be `number`.
 * Hint: a Record<Unit, number> multiplier map keeps this clean.
 */
export function toBaseUnit(quantity: number, unit: Unit): number {
  // TODO
  throw new Error("Not implemented");
}

// --------------- Cost Calculation ----------------------------

/**
 * Requirement 2 — implement `calculateRecipeCost`.
 *
 * Given a recipe, a price list (array of IngredientPrice), and an
 * `expensiveThreshold` (cost-per-serving in $), return a `RecipeCost`.
 *
 * Steps:
 *   a. For each ingredient, look up its price by `ingredientName`.
 *   b. Convert the ingredient quantity to the base unit via `toBaseUnit`.
 *   c. Multiply converted quantity × pricePerBaseUnit.
 *   d. Sum all ingredient costs → totalCost.
 *   e. Derive costPerServing = totalCost / recipe.servings.
 *   f. Round both monetary values to 2 decimal places.
 *   g. Set isExpensive = costPerServing > expensiveThreshold.
 *
 * If an ingredient is NOT found in the price list, treat its cost as 0
 * (unknown ingredients are ignored for pricing purposes).
 */
export function calculateRecipeCost(
  recipe: Recipe,
  prices: readonly IngredientPrice[],
  expensiveThreshold: number
): RecipeCost {
  // TODO
  throw new Error("Not implemented");
}

// --------------- Menu Summary --------------------------------

/**
 * Requirement 3 — implement `summarizeMenu`.
 *
 * Given an array of `RecipeCost` objects (already calculated),
 * return a `MenuSummary`.
 *
 * Steps:
 *   a. Count total recipes.
 *   b. Compute the average costPerServing across all recipes (rounded 2 dp).
 *   c. Find the recipe with the lowest  costPerServing → cheapestRecipe.
 *   d. Find the recipe with the highest costPerServing → mostExpensiveRecipe.
 *   e. Count how many have isExpensive === true → expensiveCount.
 *
 * Requirement 3a — the return type must be `MenuSummary` and the
 * cheapestRecipe / mostExpensiveRecipe fields must be typed as
 * `Pick<RecipeCost, "recipeId" | "recipeName" | "costPerServing">`.
 * Use the utility type directly in the interface (already done above) —
 * make sure your implementation satisfies it without casting.
 *
 * Throws a `RangeError` with message "Menu must contain at least one recipe"
 * if the input array is empty.
 */
export function summarizeMenu(costs: readonly RecipeCost[]): MenuSummary {
  // TODO
  throw new Error("Not implemented");
}

// --------------- Bonus ---------------------------------------
// Requirement 4 (stretch) — implement `filterByMaxCostPerServing`.
//
// Given an array of RecipeCost and a budget ($ per serving),
// return only the recipes whose costPerServing is ≤ budget,
// sorted ascending by costPerServing.
//
// The return type must be `readonly RecipeCost[]`.

export function filterByMaxCostPerServing(
  costs: readonly RecipeCost[],
  budget: number
): readonly RecipeCost[] {
  // TODO
  throw new Error("Not implemented");
}
