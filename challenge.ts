// ============================================================
// Typed Recipe Ingredient Scaler
// ============================================================
// SCENARIO: You're building the recipe feature for a meal-planning app.
// Users can scale any recipe up or down by a multiplier. Your job is to:
//   1. Validate raw unknown ingredient data at runtime
//   2. Convert all quantities to a canonical unit
//   3. Apply a scaling multiplier
//   4. Return a fully typed result
//
// Complete every TODO. Do NOT use `any`, `as`, or non-null assertions (!).
// ============================================================

// ── 1. UNIT TYPES ────────────────────────────────────────────────────────────

// TODO: Define a union type `VolumeUnit` for: "tsp" | "tbsp" | "cup" | "ml" | "l"
export type VolumeUnit = TODO_VolumeUnit;

// TODO: Define a union type `WeightUnit` for: "g" | "kg" | "oz" | "lb"
export type WeightUnit = TODO_WeightUnit;

// TODO: Define a union type `CountUnit` for: "whole" | "pinch" | "slice"
export type CountUnit = TODO_CountUnit;

// TODO: Define a discriminated union `Unit` with a `kind` discriminant:
//   - { kind: "volume"; unit: VolumeUnit }
//   - { kind: "weight"; unit: WeightUnit }
//   - { kind: "count";  unit: CountUnit  }
export type Unit = TODO_Unit;

// ── 2. INGREDIENT TYPES ──────────────────────────────────────────────────────

// A validated, typed ingredient ready for scaling
export interface Ingredient {
  name: string;
  quantity: number;
  unit: Unit;
  note?: string; // e.g. "finely chopped", "room temperature"
}

// The scaled result — quantity has been multiplied and converted to a
// canonical unit (ml for volume, g for weight, unchanged for count)
export interface ScaledIngredient {
  name: string;
  scaledQuantity: number;       // quantity * multiplier, in canonical unit
  canonicalUnit: string;        // "ml" | "g" | the original CountUnit string
  note?: string;
}

// ── 3. RESULT TYPE ───────────────────────────────────────────────────────────

// TODO: Define a generic `Result<T, E>` discriminated union:
//   - { ok: true;  value: T }
//   - { ok: false; error: E }
export type Result<T, E> = TODO_Result;

// ── 4. VALIDATION ERROR ──────────────────────────────────────────────────────

// TODO: Define `ValidationError` as a discriminated union with a `kind` field:
//   - { kind: "missing_field";  field: string }
//   - { kind: "invalid_unit";   field: string; received: string }
//   - { kind: "invalid_number"; field: string; received: unknown }
export type ValidationError = TODO_ValidationError;

// ── 5. CONVERSION TABLES ─────────────────────────────────────────────────────

// TODO: Declare `VOLUME_TO_ML` as a `Record<VolumeUnit, number>` mapping each
//       VolumeUnit to its equivalent in millilitres.
//       Use: tsp=4.92, tbsp=14.79, cup=240, ml=1, l=1000
export const VOLUME_TO_ML: Record<VolumeUnit, number> = {
  // TODO: fill in the entries
};

// TODO: Declare `WEIGHT_TO_G` as a `Record<WeightUnit, number>` mapping each
//       WeightUnit to its equivalent in grams.
//       Use: g=1, kg=1000, oz=28.35, lb=453.59
export const WEIGHT_TO_G: Record<WeightUnit, number> = {
  // TODO: fill in the entries
};

// ── 6. HELPER – PARSE A SINGLE RAW INGREDIENT ────────────────────────────────

/**
 * TODO: Implement `parseIngredient`.
 *
 * Requirements (numbered for the test harness):
 *   R1. `raw` must be a non-null object; otherwise return a `missing_field`
 *       error for field "ingredient".
 *   R2. `name` must be a non-empty string; otherwise `missing_field` for "name".
 *   R3. `quantity` must be a finite positive number; otherwise `invalid_number`
 *       for "quantity" with the received value.
 *   R4. `unitKind` must be one of "volume" | "weight" | "count";
 *       otherwise `invalid_unit` for "unitKind" with the received string.
 *   R5. `unitValue` must be a valid member of the corresponding unit group
 *       (VolumeUnit / WeightUnit / CountUnit); otherwise `invalid_unit` for
 *       "unitValue" with the received string.
 *   R6. `note` is optional; include it only when it is a non-empty string.
 *
 * @param raw - The unknown value to validate and parse.
 * @returns Result<Ingredient, ValidationError>
 */
export function parseIngredient(raw: unknown): Result<Ingredient, ValidationError> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 7. CORE – SCALE A LIST OF INGREDIENTS ────────────────────────────────────

/**
 * TODO: Implement `scaleRecipe`.
 *
 * Requirements:
 *   R7.  Parse every element of `rawIngredients` with `parseIngredient`.
 *        If ANY element fails validation, return the FIRST error as
 *        `Result<ScaledIngredient[], ValidationError>` with ok: false.
 *   R8.  For each valid ingredient, compute `scaledQuantity`:
 *          - volume → quantity × VOLUME_TO_ML[unit] × multiplier  (canonical: "ml")
 *          - weight → quantity × WEIGHT_TO_G[unit]  × multiplier  (canonical: "g")
 *          - count  → quantity × multiplier                        (canonical: unit string)
 *   R9.  Round `scaledQuantity` to 2 decimal places.
 *   R10. Return `{ ok: true, value: ScaledIngredient[] }` on full success.
 *
 * @param rawIngredients - Array of unknown values from the API / user input.
 * @param multiplier     - Positive number to scale all quantities by.
 * @returns Result<ScaledIngredient[], ValidationError>
 */
export function scaleRecipe(
  rawIngredients: unknown[],
  multiplier: number
): Result<ScaledIngredient[], ValidationError> {
  // TODO: implement
  throw new Error("Not implemented");
}
