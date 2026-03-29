// ============================================================
// Typed Recipe Ingredient Scaler
// challenge.ts
// ============================================================
// REQUIREMENTS:
// 1. Define the `Unit` branded type and the `UnitGroup` discriminated union
//    so that volume and weight units are kept separate at the type level.
// 2. Implement `parseIngredient` to validate a `RawIngredient` and return
//    a `Result<Ingredient, ValidationError>`.
// 3. Implement `scaleIngredient` to multiply an `Ingredient`'s quantity
//    by a positive `Multiplier` branded number.
// 4. Implement `scaleRecipe` to validate every raw ingredient, scale all
//    valid ones, and return a `ScaledRecipeResult` that separates successes
//    from per-ingredient validation failures.
// ============================================================

// ------- Branded primitives ----------------------------------

/** A positive finite number used as a scaling factor. */
export type Multiplier = number & { readonly __brand: "Multiplier" };

/** A non-empty string name for an ingredient. */
export type IngredientName = string & { readonly __brand: "IngredientName" };

// ------- Unit system -----------------------------------------

export type VolumeUnit = "tsp" | "tbsp" | "cup" | "ml" | "l";
export type WeightUnit = "g" | "kg" | "oz" | "lb";

/** TODO: Define `UnitGroup` as a discriminated union with:
 *   - { kind: "volume"; unit: VolumeUnit }
 *   - { kind: "weight"; unit: WeightUnit }
 */
export type UnitGroup = never; // replace `never` with your definition

// ------- Core domain types -----------------------------------

export interface Ingredient {
  name: IngredientName;
  quantity: number;
  unitGroup: UnitGroup;
}

export interface ScaledIngredient extends Ingredient {
  readonly scaledBy: Multiplier;
}

// ------- Raw / unvalidated input -----------------------------

/** The shape of data arriving from a form or external source. */
export interface RawIngredient {
  name: unknown;
  quantity: unknown;
  unit: unknown;
}

// ------- Result type -----------------------------------------

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// ------- Validation errors -----------------------------------

export type ValidationErrorKind =
  | "EMPTY_NAME"
  | "INVALID_QUANTITY"
  | "UNKNOWN_UNIT";

export interface ValidationError {
  kind: ValidationErrorKind;
  /** Human-readable description of what went wrong. */
  message: string;
  /** The raw field value that caused the error, if applicable. */
  received?: unknown;
}

// ------- Scaled recipe result --------------------------------

export interface ScaledRecipeResult {
  /** Successfully scaled ingredients. */
  scaled: ScaledIngredient[];
  /** Ingredients that failed validation, keyed by their raw index. */
  failures: Array<{ index: number; error: ValidationError }>;
}

// ============================================================
// Helpers you may (or may not) use
// ============================================================

const VOLUME_UNITS = new Set<VolumeUnit>(["tsp", "tbsp", "cup", "ml", "l"]);
const WEIGHT_UNITS = new Set<WeightUnit>(["g", "kg", "oz", "lb"]);

/** Returns a `Multiplier` if `n` is a positive finite number, otherwise null. */
export function makeMultiplier(n: number): Multiplier | null {
  return Number.isFinite(n) && n > 0 ? (n as Multiplier) : null;
}

/** Returns an `IngredientName` if `s` is a non-empty trimmed string, otherwise null. */
export function makeIngredientName(s: string): IngredientName | null {
  const trimmed = s.trim();
  return trimmed.length > 0 ? (trimmed as IngredientName) : null;
}

// ============================================================
// TODO 1 — parseIngredient
// ============================================================
// Validate a `RawIngredient` and return:
//   - { ok: true, value: Ingredient }  on success
//   - { ok: false, error: ValidationError } on the FIRST validation failure
//     (check name → quantity → unit, in that order)
//
// Validation rules:
//   • name    : must be a non-empty string after trimming  → EMPTY_NAME
//   • quantity: must be a finite number > 0               → INVALID_QUANTITY
//   • unit    : must match a VolumeUnit or WeightUnit     → UNKNOWN_UNIT

export function parseIngredient(
  raw: RawIngredient
): Result<Ingredient, ValidationError> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ============================================================
// TODO 2 — scaleIngredient
// ============================================================
// Return a new `ScaledIngredient` with `quantity` multiplied by `multiplier`.
// The `scaledBy` field must record the multiplier used.

export function scaleIngredient(
  ingredient: Ingredient,
  multiplier: Multiplier
): ScaledIngredient {
  // TODO: implement
  throw new Error("Not implemented");
}

// ============================================================
// TODO 3 — scaleRecipe
// ============================================================
// Given an array of `RawIngredient` and a raw number multiplier:
//   1. Validate the multiplier (must be positive & finite); if invalid,
//      return a ScaledRecipeResult with ALL ingredients listed as failures
//      using kind "INVALID_QUANTITY" and message "Invalid multiplier".
//   2. For each raw ingredient, attempt to parse it.
//      • Success → scale it and push to `scaled`.
//      • Failure → push to `failures` with its original index.

export function scaleRecipe(
  rawIngredients: RawIngredient[],
  rawMultiplier: number
): ScaledRecipeResult {
  // TODO: implement
  throw new Error("Not implemented");
}
