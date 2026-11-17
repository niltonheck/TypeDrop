// challenge.ts
// ============================================================
// Typed Recipe Book: Ingredient Scaling & Shopping List Builder
// ============================================================
// REQUIREMENTS
// 1. Define the `Unit` branded-union type covering all allowed measurement units.
// 2. Implement `scaleRecipe` — returns a new Recipe whose ingredient quantities
//    are multiplied by (targetServings / recipe.servings), rounded to 2 d.p.
// 3. Implement `mergeShoppingList` — takes an array of scaled recipes and returns
//    a ShoppingList where same-name + same-unit ingredients are summed, and
//    same-name + DIFFERENT-unit ingredients appear as separate entries.
// 4. Implement `formatShoppingList` — returns a human-readable string, one item
//    per line, sorted alphabetically by ingredient name, in the form:
//      "- 300g flour"
//      "- 2 whole eggs"
// ============================================================

// ── 1. Unit type ────────────────────────────────────────────
// TODO: Define `Unit` as a union of string literal types covering at least:
//   "g" | "kg" | "ml" | "l" | "tsp" | "tbsp" | "cup" | "whole" | "pinch"
export type Unit = never; // replace `never` with your union

// ── 2. Core data shapes ──────────────────────────────────────
export interface Ingredient {
  readonly name: string;       // e.g. "flour"
  readonly quantity: number;   // e.g. 200
  readonly unit: Unit;         // e.g. "g"
}

export interface Recipe {
  readonly id: string;
  readonly title: string;
  readonly servings: number;   // base serving count the quantities are written for
  readonly ingredients: readonly Ingredient[];
}

// ── 3. Scaling ───────────────────────────────────────────────
/**
 * Returns a *new* Recipe (same id & title) scaled so that it feeds
 * `targetServings` people instead of `recipe.servings`.
 *
 * Each ingredient's quantity must be multiplied by
 * (targetServings / recipe.servings) and rounded to 2 decimal places.
 *
 * Requirements:
 * - `targetServings` must be a positive integer (throw a RangeError if not).
 * - The returned Recipe's `servings` field must equal `targetServings`.
 */
export function scaleRecipe(recipe: Recipe, targetServings: number): Recipe {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 4. Shopping list types ───────────────────────────────────
export interface ShoppingListEntry {
  readonly name: string;
  readonly quantity: number;
  readonly unit: Unit;
}

// A ShoppingList is simply an ordered array of entries.
export type ShoppingList = readonly ShoppingListEntry[];

// ── 5. Merging ───────────────────────────────────────────────
/**
 * Accepts an array of (already-scaled) recipes and returns a ShoppingList
 * that merges all ingredients across all recipes.
 *
 * Merging rules:
 * - Ingredients with the SAME `name` AND the SAME `unit` are summed.
 * - Ingredients with the SAME `name` but DIFFERENT `unit` remain as
 *   separate entries (do NOT attempt unit conversion).
 * - Quantity values in the result must be rounded to 2 decimal places.
 *
 * The order of entries in the returned list is unspecified (the formatter
 * will sort them).
 */
export function mergeShoppingList(recipes: readonly Recipe[]): ShoppingList {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 6. Formatting ────────────────────────────────────────────
/**
 * Converts a ShoppingList to a human-readable string.
 *
 * Format rules:
 * - One item per line: "- {quantity}{unit} {name}"  for units that attach
 *   directly (g, kg, ml, l), and "- {quantity} {unit} {name}" for word-like
 *   units (tsp, tbsp, cup, whole, pinch).
 * - Quantities that are whole numbers should be displayed without a decimal
 *   point (e.g. "200" not "200.00").
 * - Entries are sorted alphabetically by `name` (case-insensitive).
 * - If the list is empty, return the string "(empty list)".
 *
 * Examples:
 *   "- 200g flour"
 *   "- 1.5 tsp salt"
 *   "- 3 whole eggs"
 */
export function formatShoppingList(list: ShoppingList): string {
  // TODO: implement
  throw new Error("Not implemented");
}
