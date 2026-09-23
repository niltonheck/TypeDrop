// ============================================================
// Typed Recipe Ingredient Scaler
// ============================================================
// REQUIREMENTS
// 1. Define a `Unit` type as a union of the allowed measurement strings listed below.
// 2. Define an `Ingredient` interface with: name (string), quantity (number), unit (Unit).
// 3. Define a `Recipe` interface with: title (string), servings (number),
//    ingredients (readonly array of Ingredient).
// 4. Define `ScaledIngredient` as a type derived from `Ingredient` using a utility type
//    that marks `quantity` as the only mutable, scaled field — all other fields are
//    preserved. (Hint: compose Pick / Omit / intersection, NOT a hand-written interface.)
// 5. Define `ScaledRecipe` using a utility type derived from `Recipe`:
//    - `servings` is replaced with the scaled value
//    - `ingredients` becomes a readonly array of `ScaledIngredient`
//    - `title` is kept as-is
//    (Hint: use Omit + intersection, NOT a hand-written interface.)
// 6. Implement `scaleRecipe(recipe: Recipe, multiplier: number): ScaledRecipe`
//    - Multiply every ingredient's quantity by the multiplier (round to 2 decimal places).
//    - Multiply servings by the multiplier (round to nearest integer).
//    - Return a value whose type is exactly `ScaledRecipe`.
// 7. Implement `findIngredientsByUnit<U extends Unit>(recipe: Recipe, unit: U): readonly Ingredient[]`
//    - Return only the ingredients whose unit matches the given `U`.
//    - The return type must use the generic parameter `U` (not a plain `Unit`).
//      Specifically, return `readonly (Ingredient & { unit: U })[]`.
// ============================================================

// -- 1. Allowed units -------------------------------------------------
// "tsp" | "tbsp" | "cup" | "oz" | "lb" | "g" | "kg" | "ml" | "l" | "whole" | "pinch"

export type Unit = /* TODO */ never;

// -- 2. Core domain types ---------------------------------------------

export interface Ingredient {
  // TODO
}

export interface Recipe {
  // TODO
}

// -- 3. Derived types (use utility types — no hand-written interfaces) -

export type ScaledIngredient = /* TODO */ never;

export type ScaledRecipe = /* TODO */ never;

// -- 4. Functions -----------------------------------------------------

/**
 * Returns a new ScaledRecipe with all quantities and servings multiplied
 * by `multiplier`. Quantities are rounded to 2 decimal places; servings
 * are rounded to the nearest integer.
 */
export function scaleRecipe(recipe: Recipe, multiplier: number): ScaledRecipe {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Returns only the ingredients in `recipe` whose unit is exactly `U`.
 * The return type is `readonly (Ingredient & { unit: U })[]`.
 */
export function findIngredientsByUnit<U extends Unit>(
  recipe: Recipe,
  unit: U
): readonly (Ingredient & { unit: U })[] {
  // TODO
  throw new Error("Not implemented");
}
