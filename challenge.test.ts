// challenge.test.ts
import {
  parseIngredient,
  scaleRecipe,
  VOLUME_TO_ML,
  WEIGHT_TO_G,
  type Result,
  type Ingredient,
  type ScaledIngredient,
  type ValidationError,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────────────────────

function assertOk<T, E>(
  result: Result<T, E>,
  label: string
): asserts result is { ok: true; value: T } {
  console.assert(result.ok === true, `[FAIL] ${label} — expected ok:true, got ok:false`);
}

function assertErr<T, E>(
  result: Result<T, E>,
  label: string
): asserts result is { ok: false; error: E } {
  console.assert(result.ok === false, `[FAIL] ${label} — expected ok:false, got ok:true`);
}

// ── Test 1: parseIngredient — valid volume ingredient ─────────────────────────
{
  const raw = { name: "Milk", quantity: 2, unitKind: "volume", unitValue: "cup" };
  const result = parseIngredient(raw);
  assertOk(result, "T1 parse valid volume");
  if (result.ok) {
    const ing: Ingredient = result.value;
    console.assert(ing.name === "Milk",           "[FAIL] T1 name");
    console.assert(ing.quantity === 2,            "[FAIL] T1 quantity");
    console.assert(ing.unit.kind === "volume",    "[FAIL] T1 unit.kind");
    // TypeScript narrows here — no 'as' needed
    if (ing.unit.kind === "volume") {
      console.assert(ing.unit.unit === "cup",     "[FAIL] T1 unit.unit");
    }
    console.assert(ing.note === undefined,        "[FAIL] T1 note should be absent");
    console.log("[PASS] T1 parseIngredient — valid volume");
  }
}

// ── Test 2: parseIngredient — valid weight ingredient with note ───────────────
{
  const raw = { name: "Flour", quantity: 250, unitKind: "weight", unitValue: "g", note: "sifted" };
  const result = parseIngredient(raw);
  assertOk(result, "T2 parse valid weight with note");
  if (result.ok) {
    console.assert(result.value.note === "sifted", "[FAIL] T2 note");
    console.assert(result.value.unit.kind === "weight", "[FAIL] T2 unit.kind");
    console.log("[PASS] T2 parseIngredient — valid weight with note");
  }
}

// ── Test 3: parseIngredient — invalid unitValue ───────────────────────────────
{
  const raw = { name: "Sugar", quantity: 1, unitKind: "volume", unitValue: "gallon" };
  const result = parseIngredient(raw);
  assertErr(result, "T3 invalid unitValue");
  if (!result.ok) {
    const err: ValidationError = result.error;
    console.assert(err.kind === "invalid_unit",    "[FAIL] T3 error kind");
    console.assert(err.field === "unitValue",      "[FAIL] T3 error field");
    console.log("[PASS] T3 parseIngredient — invalid unitValue");
  }
}

// ── Test 4: scaleRecipe — 2× scaling of a mixed recipe ───────────────────────
{
  const rawIngredients = [
    { name: "Butter", quantity: 100,  unitKind: "weight", unitValue: "g"   },
    { name: "Vanilla", quantity: 1,   unitKind: "volume", unitValue: "tsp" },
    { name: "Eggs",    quantity: 3,   unitKind: "count",  unitValue: "whole" },
  ];
  const result = scaleRecipe(rawIngredients, 2);
  assertOk(result, "T4 scaleRecipe 2×");
  if (result.ok) {
    const scaled: ScaledIngredient[] = result.value;
    console.assert(scaled.length === 3, "[FAIL] T4 length");

    // Butter: 100g × 1 (g→g) × 2 = 200g
    console.assert(scaled[0].scaledQuantity === 200,   "[FAIL] T4 butter quantity");
    console.assert(scaled[0].canonicalUnit  === "g",   "[FAIL] T4 butter unit");

    // Vanilla: 1 tsp × 4.92 ml/tsp × 2 = 9.84 ml
    console.assert(scaled[1].scaledQuantity === 9.84,  "[FAIL] T4 vanilla quantity");
    console.assert(scaled[1].canonicalUnit  === "ml",  "[FAIL] T4 vanilla unit");

    // Eggs: 3 × 2 = 6 whole
    console.assert(scaled[2].scaledQuantity === 6,     "[FAIL] T4 eggs quantity");
    console.assert(scaled[2].canonicalUnit  === "whole","[FAIL] T4 eggs unit");

    console.log("[PASS] T4 scaleRecipe — 2× mixed recipe");
  }
}

// ── Test 5: scaleRecipe — first invalid item short-circuits ──────────────────
{
  const rawIngredients = [
    { name: "Salt", quantity: 1, unitKind: "count", unitValue: "pinch" },
    { name: "Bad",  quantity: -5, unitKind: "weight", unitValue: "g"   }, // negative quantity
    { name: "Oil",  quantity: 2, unitKind: "volume", unitValue: "tbsp" },
  ];
  const result = scaleRecipe(rawIngredients, 1);
  assertErr(result, "T5 scaleRecipe short-circuit on invalid");
  if (!result.ok) {
    const err: ValidationError = result.error;
    console.assert(err.kind === "invalid_number", "[FAIL] T5 error kind");
    console.assert(err.field === "quantity",      "[FAIL] T5 error field");
    console.log("[PASS] T5 scaleRecipe — short-circuits on first invalid ingredient");
  }
}

console.log("\nAll tests complete.");
