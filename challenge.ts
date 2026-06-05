// ============================================================
// Typed Recipe Ingredient Scaler
// ============================================================
// SCENARIO: Raw recipe data arrives as `unknown` from a third-party
// nutrition API. Your engine must validate it, scale every ingredient
// to a requested serving count, and return a strongly-typed result.
//
// RULES:
//  - No `any`, no type assertions (`as`), no non-null assertions (`!`)
//  - All functions must compile under strict: true
// ============================================================

// ------------------------------------------------------------------
// 1. CORE DOMAIN TYPES
// ------------------------------------------------------------------

/** The allowed units for an ingredient quantity. */
export type Unit =
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "tsp"
  | "tbsp"
  | "cup"
  | "piece"
  | "pinch";

/** A single ingredient with a quantity and unit. */
export interface Ingredient {
  name: string;
  quantity: number;   // must be > 0
  unit: Unit;
}

/** A validated recipe as it exists in our domain. */
export interface Recipe {
  id: string;
  title: string;
  servings: number;   // must be >= 1 (integer)
  ingredients: Ingredient[];
}

/** A recipe with every ingredient scaled to `targetServings`. */
export interface ScaledRecipe extends Recipe {
  /** The original serving count before scaling. */
  originalServings: number;
  /** The serving count this recipe was scaled to. */
  targetServings: number;
}

// ------------------------------------------------------------------
// 2. RESULT TYPE  (no external libraries)
// ------------------------------------------------------------------

export type Result<T, E extends string = string> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

// ------------------------------------------------------------------
// 3. VALIDATION ERRORS  (discriminated union)
// ------------------------------------------------------------------

export type ValidationError =
  | { kind: "MISSING_FIELD";   field: string }
  | { kind: "INVALID_TYPE";    field: string; expected: string }
  | { kind: "INVALID_VALUE";   field: string; reason: string }
  | { kind: "INVALID_UNIT";    field: string; received: string };

// ------------------------------------------------------------------
// 4. SCALING ERRORS
// ------------------------------------------------------------------

export type ScalingError =
  | { kind: "INVALID_TARGET_SERVINGS"; received: number }
  | { kind: "EMPTY_INGREDIENTS" };

// ------------------------------------------------------------------
// 5. HELPER — isUnit
// ------------------------------------------------------------------

// TODO: Implement a type-guard that returns `value is Unit`.
// Use the UNITS constant below for the check (no hardcoded strings).
export const UNITS: readonly Unit[] = [
  "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "piece", "pinch",
];

/**
 * REQUIREMENT 1 — Type guard
 * Returns true when `value` is one of the allowed Unit strings.
 */
export function isUnit(value: unknown): value is Unit {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. VALIDATION — parseIngredient
// ------------------------------------------------------------------

/**
 * REQUIREMENT 2 — Ingredient validation
 * Parses a single unknown value into a validated Ingredient.
 *
 * Rules:
 *  - `name`     must be a non-empty string
 *  - `quantity` must be a finite number > 0
 *  - `unit`     must satisfy isUnit()
 *
 * Return the FIRST validation error encountered (fail-fast).
 */
export function parseIngredient(
  raw: unknown,
  index: number
): Result<Ingredient, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 7. VALIDATION — parseRecipe
// ------------------------------------------------------------------

/**
 * REQUIREMENT 3 — Recipe validation
 * Parses an unknown value into a validated Recipe.
 *
 * Rules:
 *  - `id`          must be a non-empty string
 *  - `title`       must be a non-empty string
 *  - `servings`    must be a finite integer >= 1
 *  - `ingredients` must be an array with at least one entry;
 *                  each entry is validated via parseIngredient()
 *
 * Return the FIRST validation error encountered (fail-fast).
 */
export function parseRecipe(raw: unknown): Result<Recipe, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 8. SCALING — scaleRecipe
// ------------------------------------------------------------------

/**
 * REQUIREMENT 4 — Scaling
 * Scales a validated Recipe to `targetServings`.
 *
 * Rules:
 *  - `targetServings` must be a finite integer >= 1
 *  - The recipe must have at least one ingredient (guard against
 *    empty arrays that slip through)
 *  - Each ingredient's `quantity` is multiplied by
 *    (targetServings / recipe.servings) and rounded to 4 decimal places
 *  - The returned ScaledRecipe carries both `originalServings` and
 *    `targetServings` fields alongside the updated ingredients
 */
export function scaleRecipe(
  recipe: Recipe,
  targetServings: number
): Result<ScaledRecipe, ScalingError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 9. PIPELINE — parseAndScale
// ------------------------------------------------------------------

/**
 * REQUIREMENT 5 — Full pipeline
 * Combines parseRecipe + scaleRecipe into a single call.
 *
 * Return type must use a discriminated union so callers can
 * distinguish a ValidationError from a ScalingError without casting.
 *
 * Hint: model the error as a tagged union, e.g.:
 *   | { stage: "validation"; error: ValidationError }
 *   | { stage: "scaling";    error: ScalingError    }
 */
export type PipelineError =
  | { stage: "validation"; error: ValidationError }
  | { stage: "scaling";    error: ScalingError };

export function parseAndScale(
  raw: unknown,
  targetServings: number
): Result<ScaledRecipe, PipelineError> {
  // TODO
  throw new Error("Not implemented");
}
