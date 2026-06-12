// ============================================================
// Typed Recipe Ingredient Scaler
// ============================================================
// SCENARIO: Raw recipe JSON is uploaded by users. Your engine
// must validate the unknown payload, scale each ingredient to
// a new serving count, and return a strongly-typed result.
//
// REQUIREMENTS:
// 1. Define the core types: Unit, Ingredient, Recipe, ScaledRecipe
// 2. Implement `parseIngredient` to validate an unknown value
//    into Ingredient | null (return null on invalid input)
// 3. Implement `parseRecipe` to validate an unknown value
//    into Recipe | null (return null on invalid input)
// 4. Implement `scaleRecipe` to produce a ScaledRecipe where
//    every ingredient quantity is multiplied by (targetServings /
//    recipe.defaultServings), rounded to 2 decimal places
// 5. Implement `formatIngredient` using a template literal type
//    for its return type so the result is always typed as
//    `${string} ${number} ${Unit}` — or as close as TS allows
// ============================================================

// ----- 1. TYPES -----

// TODO: Define a union of allowed measurement units
export type Unit = TODO;

// TODO: Define the Ingredient type with:
//   name: string
//   quantity: number
//   unit: Unit
export type Ingredient = TODO;

// TODO: Define the Recipe type with:
//   title: string
//   defaultServings: number   (must be > 0)
//   ingredients: Ingredient[]
export type Recipe = TODO;

// TODO: Define ScaledRecipe as Recipe & { targetServings: number }
//   (every ingredient's quantity is already scaled in the array)
export type ScaledRecipe = TODO;

// ----- 2. VALIDATION HELPERS -----

// Known valid units — use this constant to drive your Unit type
// and your runtime validation (no duplication needed).
export const VALID_UNITS = [
  "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "piece",
] as const;

// TODO: Implement this function.
// Returns a validated Ingredient or null.
// Rules:
//   - value must be a non-null object
//   - name must be a non-empty string
//   - quantity must be a finite number > 0
//   - unit must be one of VALID_UNITS
export function parseIngredient(value: unknown): Ingredient | null {
  // TODO
  throw new Error("Not implemented");
}

// TODO: Implement this function.
// Returns a validated Recipe or null.
// Rules:
//   - value must be a non-null object
//   - title must be a non-empty string
//   - defaultServings must be a finite integer > 0
//   - ingredients must be a non-empty array where every element
//     passes parseIngredient (skip/drop invalid entries is NOT
//     acceptable — if any ingredient is invalid, return null)
export function parseRecipe(value: unknown): Recipe | null {
  // TODO
  throw new Error("Not implemented");
}

// ----- 3. SCALING -----

// TODO: Implement this function.
// Rules:
//   - targetServings must be a finite integer > 0; if not, return null
//   - Scale each ingredient's quantity:
//       scaledQty = round(ingredient.quantity * targetServings / recipe.defaultServings, 2)
//   - Return a ScaledRecipe (same title, same defaultServings,
//     targetServings added, ingredients replaced with scaled copies)
export function scaleRecipe(
  recipe: Recipe,
  targetServings: number
): ScaledRecipe | null {
  // TODO
  throw new Error("Not implemented");
}

// ----- 4. FORMATTING -----

// TODO: Define a template literal type for a formatted ingredient line.
// It should represent the shape: "<name>: <quantity> <unit>"
// Use TS template literal types — the return type of formatIngredient
// must be this alias (not just `string`).
export type IngredientLine = TODO;

// TODO: Implement this function.
// Returns a string in the format "<name>: <quantity> <unit>"
// The return type must be IngredientLine.
export function formatIngredient(ingredient: Ingredient): IngredientLine {
  // TODO
  throw new Error("Not implemented");
}
