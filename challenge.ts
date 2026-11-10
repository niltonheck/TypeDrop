// ============================================================
// Typed Recipe Ingredient Scaler & Unit Converter
// ============================================================
// Difficulty: Medium
// Topics: Discriminated unions, branded types, mapped types,
//         conditional types, generics, Record, satisfies
// ============================================================

// ── 1. BRANDED TYPES ────────────────────────────────────────

/** A positive, finite number of servings. */
export type ServingCount = number & { readonly __brand: "ServingCount" };

/** A non-negative quantity (e.g. 2.5 cups). */
export type Quantity = number & { readonly __brand: "Quantity" };

/**
 * TODO (1): Implement `toServingCount`.
 * Return a `ServingCount` if `n` is a positive finite integer, otherwise
 * return `null`. No type assertions (`as`) allowed — use a type predicate
 * helper or a conditional return with a guard function.
 */
export function toServingCount(n: number): ServingCount | null {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO (2): Implement `toQuantity`.
 * Return a `Quantity` if `n` is >= 0 and finite, otherwise return `null`.
 */
export function toQuantity(n: number): Quantity | null {
  // TODO
  throw new Error("Not implemented");
}

// ── 2. UNIT SYSTEM ──────────────────────────────────────────

/** Volume units. */
export type VolumeUnit =
  | "tsp"   // teaspoon  (imperial)
  | "tbsp"  // tablespoon (imperial)
  | "fl_oz" // fluid ounce (imperial)
  | "cup"   // cup (imperial)
  | "ml"    // millilitre (metric)
  | "l";    // litre (metric)

/** Mass units. */
export type MassUnit =
  | "oz"  // ounce (imperial)
  | "lb"  // pound (imperial)
  | "g"   // gram (metric)
  | "kg"; // kilogram (metric)

/** Unitless count (e.g. "3 eggs"). */
export type CountUnit = "count";

export type Unit = VolumeUnit | MassUnit | CountUnit;

/**
 * A discriminated union that pairs a quantity with its unit family,
 * keeping the type system from mixing volumes with masses.
 */
export type Measurement =
  | { readonly kind: "volume"; readonly quantity: Quantity; readonly unit: VolumeUnit }
  | { readonly kind: "mass";   readonly quantity: Quantity; readonly unit: MassUnit   }
  | { readonly kind: "count";  readonly quantity: Quantity; readonly unit: CountUnit  };

// ── 3. CONVERSION TABLES ────────────────────────────────────

/**
 * Every unit must have a canonical base + a multiplier to reach that base.
 * Volume base → ml; Mass base → g; Count base → count.
 *
 * TODO (3): Fill in the `UNIT_TO_BASE` constant so that every `Unit` key is
 * present. Use `satisfies Record<Unit, { baseValue: number }>` to let the
 * compiler verify completeness without widening the type.
 *
 * Conversion reference (approximate):
 *   1 tsp  = 4.92892 ml        1 oz = 28.3495 g
 *   1 tbsp = 14.7868 ml        1 lb = 453.592 g
 *   1 fl_oz= 29.5735 ml        1 g  = 1 g
 *   1 cup  = 236.588 ml        1 kg = 1000 g
 *   1 ml   = 1 ml              1 count = 1
 *   1 l    = 1000 ml
 */
export const UNIT_TO_BASE = {
  // TODO — add all 11 unit entries here
} satisfies Record<Unit, { baseValue: number }>;

// ── 4. INGREDIENT & RECIPE TYPES ────────────────────────────

export interface Ingredient {
  readonly name: string;        // e.g. "all-purpose flour"
  readonly measurement: Measurement;
}

export interface Recipe {
  readonly name: string;
  readonly servings: ServingCount;   // servings this recipe is written for
  readonly ingredients: ReadonlyArray<Ingredient>;
}

// ── 5. SCALING ──────────────────────────────────────────────

/**
 * TODO (4): Implement `scaleRecipe`.
 *
 * Requirements:
 * a) Multiply each ingredient's quantity by (targetServings / recipe.servings).
 * b) Return a new `Recipe` object (do not mutate the input).
 * c) The returned recipe's `servings` field must equal `targetServings`.
 * d) Each scaled quantity must still be a valid `Quantity` branded type.
 *    If a scaled quantity is somehow invalid (< 0 or non-finite), throw an
 *    `Error` with the message `"Invalid scaled quantity for: <ingredient name>"`.
 */
export function scaleRecipe(recipe: Recipe, targetServings: ServingCount): Recipe {
  // TODO
  throw new Error("Not implemented");
}

// ── 6. UNIT CONVERSION ──────────────────────────────────────

/**
 * Converts a `Measurement` to an equivalent one in the requested unit.
 *
 * Requirements:
 * a) `targetUnit` must belong to the same unit family as the source
 *    measurement (volume→volume, mass→mass, count→count).
 * b) If the families do not match, throw `Error("Unit family mismatch")`.
 * c) Conversion formula:
 *      resultQuantity = (sourceQuantity × sourceBaseValue) / targetBaseValue
 * d) The returned `Measurement` must carry the correct `kind` discriminant.
 *
 * TODO (5): Implement the three overloads + implementation below.
 */
export function convertMeasurement(m: Extract<Measurement, { kind: "volume" }>, targetUnit: VolumeUnit): Extract<Measurement, { kind: "volume" }>;
export function convertMeasurement(m: Extract<Measurement, { kind: "mass"   }>, targetUnit: MassUnit  ): Extract<Measurement, { kind: "mass"   }>;
export function convertMeasurement(m: Extract<Measurement, { kind: "count"  }>, targetUnit: CountUnit ): Extract<Measurement, { kind: "count"  }>;
export function convertMeasurement(m: Measurement, targetUnit: Unit): Measurement {
  // TODO
  throw new Error("Not implemented");
}

// ── 7. SHOPPING LIST AGGREGATION ────────────────────────────

/**
 * A shopping list entry collapses all appearances of the same ingredient
 * (case-insensitive name match) across multiple recipes into one line,
 * with quantities expressed in a single canonical base unit.
 */
export interface ShoppingListEntry {
  readonly name: string;            // normalised to lower-case
  readonly totalBaseQuantity: Quantity;
  readonly baseUnit: Unit;          // the canonical base unit for this family
}

/**
 * TODO (6): Implement `buildShoppingList`.
 *
 * Requirements:
 * a) Accept an array of already-scaled `Recipe` objects.
 * b) For each ingredient across all recipes, convert its measurement to the
 *    canonical base unit (ml for volume, g for mass, count for count).
 * c) Aggregate (sum) quantities for ingredients with the same lower-cased name
 *    AND the same unit family. If two recipes use the same ingredient name but
 *    different families (e.g. "water" as volume vs mass), treat them as
 *    separate entries (append the kind as a suffix: "water (volume)").
 * d) Return the entries sorted alphabetically by `name`.
 * e) Every `totalBaseQuantity` in the result must be a valid `Quantity`.
 */
export function buildShoppingList(scaledRecipes: ReadonlyArray<Recipe>): ShoppingListEntry[] {
  // TODO
  throw new Error("Not implemented");
}

// ── 8. MAPPED UTILITY ───────────────────────────────────────

/**
 * A mapped type that, given a union of unit kinds ("volume" | "mass" | "count"),
 * produces an object type where each key maps to the canonical base unit string
 * for that family.
 *
 * TODO (7): Define `FamilyBaseUnit` as a mapped type over
 * `Measurement["kind"]` (i.e. "volume" | "mass" | "count") so that:
 *   FamilyBaseUnit["volume"] → "ml"
 *   FamilyBaseUnit["mass"]   → "g"
 *   FamilyBaseUnit["count"]  → "count"
 *
 * Hint: Use a conditional type or a mapped type with `satisfies`.
 */
export type FamilyBaseUnit = {
  // TODO
};

/**
 * TODO (8): Implement the runtime constant `FAMILY_BASE_UNIT` that satisfies
 * `FamilyBaseUnit` and is used by `buildShoppingList` to look up base units.
 */
export const FAMILY_BASE_UNIT = {
  // TODO
} satisfies FamilyBaseUnit;
