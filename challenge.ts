// ============================================================
// Typed Recipe Ingredient Scaler
// ============================================================
// GOAL: Implement the three functions below so that a recipe
//       can be scaled by an arbitrary factor and its ingredients
//       formatted into a shopping list.
//
// Rules:
//  - No `any`, no type assertions (`as`), no `@ts-ignore`
//  - All functions must satisfy `strict: true`
// ============================================================

// ----- 1. UNIT TYPES ----------------------------------------

/** All supported units of measurement. */
export type Unit =
  | "tsp"
  | "tbsp"
  | "cup"
  | "oz"
  | "lb"
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "whole"; // e.g. "3 whole eggs"

// ----- 2. INGREDIENT TYPES ----------------------------------

/** A single ingredient line in a recipe. */
export interface Ingredient {
  readonly name: string;
  readonly amount: number;
  readonly unit: Unit;
}

/**
 * A scaled ingredient — same shape as Ingredient but the
 * `amount` is the result of applying a scale factor, rounded
 * to at most 2 decimal places.
 *
 * TODO: Define ScaledIngredient using a mapped/utility type
 *       derived from Ingredient (not a hand-written duplicate).
 *       The `amount` field must remain a `number`.
 */
export type ScaledIngredient = /* TODO */ never;

// ----- 3. RECIPE TYPE ---------------------------------------

export interface Recipe {
  readonly title: string;
  readonly servings: number;          // original serving count
  readonly ingredients: readonly Ingredient[];
}

// ----- 4. SCALE RESULT TYPE ---------------------------------

/**
 * The result of scaling a recipe.
 * TODO: Fill in the type so that:
 *   - `title`    — the original recipe title (string)
 *   - `servings` — the NEW serving count (number)
 *   - `ingredients` — a readonly array of ScaledIngredient
 */
export interface ScaleResult {
  // TODO
}

// ----- 5. SHOPPING LIST ENTRY -------------------------------

/**
 * A formatted entry for the shopping list.
 * Uses a discriminated union so callers can handle
 * "whole" units differently from measured units.
 */
export type ShoppingListEntry =
  | {
      readonly kind: "measured";
      readonly name: string;
      readonly amount: number;
      readonly unit: Exclude<Unit, "whole">;
      readonly display: string; // e.g. "1.5 cup flour"
    }
  | {
      readonly kind: "whole";
      readonly name: string;
      readonly amount: number;
      readonly display: string; // e.g. "3 whole eggs"
    };

// ============================================================
// FUNCTIONS TO IMPLEMENT
// ============================================================

/**
 * REQUIREMENT 1 — scaleRecipe
 * Scale `recipe` so it produces `targetServings` servings.
 *
 * - Compute factor = targetServings / recipe.servings
 * - Multiply each ingredient's amount by the factor
 * - Round each scaled amount to at most 2 decimal places
 * - Return a ScaleResult with the updated servings & ingredients
 *
 * @throws {RangeError} if targetServings <= 0
 */
export function scaleRecipe(
  recipe: Recipe,
  targetServings: number
): ScaleResult {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 2 — toShoppingList
 * Convert a readonly array of ScaledIngredient into a
 * ShoppingListEntry array.
 *
 * - If the ingredient's unit is "whole", produce a "whole" entry
 *   with display like: "3 whole eggs"
 * - Otherwise, produce a "measured" entry with display like:
 *   "1.5 cup flour"
 * - The `unit` field on a "measured" entry must be typed as
 *   Exclude<Unit, "whole"> — use narrowing, not a cast
 */
export function toShoppingList(
  ingredients: readonly ScaledIngredient[]
): ShoppingListEntry[] {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 3 — mergeShoppingLists
 * Given two ShoppingListEntry arrays (e.g. from two scaled
 * recipes), merge them into one list.
 *
 * - Entries with the same `name` AND the same `kind` should be
 *   combined: their `amount`s are summed and `display` is
 *   regenerated (same format as toShoppingList).
 * - Entries with the same name but DIFFERENT kinds (one "whole",
 *   one "measured") must appear as SEPARATE entries — they are
 *   physically different ingredients.
 * - The returned list must be a fresh array (do not mutate inputs).
 * - Use a Map internally for O(n) merging.
 */
export function mergeShoppingLists(
  listA: ShoppingListEntry[],
  listB: ShoppingListEntry[]
): ShoppingListEntry[] {
  // TODO
  throw new Error("Not implemented");
}
