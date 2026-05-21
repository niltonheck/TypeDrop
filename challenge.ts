// ============================================================
// Typed Recipe Ingredient Scaler
// ============================================================
// SCENARIO:
//   Raw recipe data arrives as `unknown` from a third-party
//   nutrition API. Your engine must:
//     1. Validate the raw payload into a typed Recipe
//     2. Scale all ingredient quantities to a requested serving count
//     3. Return a strongly-typed ScaledRecipe summary
//
// REQUIREMENTS:
//   R1. Define a branded type `PositiveNumber` for values > 0.
//   R2. Define the `Unit` union covering: "g" | "ml" | "tsp" | "tbsp" | "cup" | "piece"
//   R3. Define `Ingredient` with: name (string), quantity (PositiveNumber), unit (Unit)
//   R4. Define `Recipe` with: id (string), title (string), servings (PositiveNumber),
//       and ingredients as a readonly non-empty tuple (at least one Ingredient, rest Ingredient[])
//   R5. Define `ScaledIngredient` — same shape as Ingredient but adds
//       `scaledQuantity: PositiveNumber` (the quantity adjusted for targetServings).
//   R6. Define `ScaledRecipe` — contains the original Recipe fields PLUS:
//       `targetServings: PositiveNumber`, `scaleFactor: number`,
//       and `scaledIngredients: readonly ScaledIngredient[]`
//   R7. Define a `ValidationError` type (discriminated union) with two variants:
//       - { kind: "MissingField";  field: string }
//       - { kind: "InvalidValue"; field: string; reason: string }
//   R8. Define `Result<T, E>` as a generic discriminated union:
//       - { ok: true;  value: T }
//       - { ok: false; error: E }
//   R9. Implement `parseRecipe(raw: unknown): Result<Recipe, ValidationError>`
//       Validate: raw is an object, id/title are non-empty strings,
//       servings is a positive number, ingredients is a non-empty array where
//       each item has a valid name, positive quantity, and a known Unit.
//       Return the first validation error encountered, or { ok: true, value: recipe }.
//  R10. Implement `scaleRecipe(recipe: Recipe, targetServings: PositiveNumber): ScaledRecipe`
//       Compute scaleFactor = targetServings / recipe.servings.
//       Each scaledQuantity = ingredient.quantity * scaleFactor, cast via your
//       branded-type helper (you may define a `toPositiveNumber` helper).
//  R11. Implement `parseAndScale(raw: unknown, targetServings: number): Result<ScaledRecipe, ValidationError>`
//       Validate targetServings is positive (return InvalidValue error if not),
//       parse the raw recipe, then scale it. Compose parseRecipe + scaleRecipe.

// ── Branded type ────────────────────────────────────────────
// TODO: define PositiveNumber brand
export type PositiveNumber = number & { readonly __brand: "PositiveNumber" };

// TODO: implement toPositiveNumber helper — returns PositiveNumber or null
export function toPositiveNumber(n: number): PositiveNumber | null {
  // TODO
  throw new Error("Not implemented");
}

// ── Domain types ─────────────────────────────────────────────
// TODO: define Unit (R2)
export type Unit = never; // replace with the union

// TODO: define Ingredient (R3)
export type Ingredient = {
  // TODO
};

// TODO: define Recipe (R4)
export type Recipe = {
  // TODO
};

// TODO: define ScaledIngredient (R5)
export type ScaledIngredient = {
  // TODO
};

// TODO: define ScaledRecipe (R6)
export type ScaledRecipe = {
  // TODO
};

// ── Error & Result types ─────────────────────────────────────
// TODO: define ValidationError (R7)
export type ValidationError = never; // replace with the discriminated union

// TODO: define Result<T, E> (R8)
export type Result<T, E> = never; // replace with the discriminated union

// ── Implementation ───────────────────────────────────────────

// TODO: implement parseRecipe (R9)
export function parseRecipe(raw: unknown): Result<Recipe, ValidationError> {
  throw new Error("Not implemented");
}

// TODO: implement scaleRecipe (R10)
export function scaleRecipe(
  recipe: Recipe,
  targetServings: PositiveNumber
): ScaledRecipe {
  throw new Error("Not implemented");
}

// TODO: implement parseAndScale (R11)
export function parseAndScale(
  raw: unknown,
  targetServings: number
): Result<ScaledRecipe, ValidationError> {
  throw new Error("Not implemented");
}
