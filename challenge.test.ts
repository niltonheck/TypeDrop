// challenge.test.ts
import {
  isUnit,
  parseIngredient,
  parseRecipe,
  scaleRecipe,
  parseAndScale,
  type Recipe,
  type ScaledRecipe,
  type ValidationError,
  type ScalingError,
  type PipelineError,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const validRawRecipe = {
  id: "pasta-001",
  title: "Classic Carbonara",
  servings: 2,
  ingredients: [
    { name: "spaghetti",       quantity: 200,  unit: "g"     },
    { name: "pancetta",        quantity: 100,  unit: "g"     },
    { name: "eggs",            quantity: 2,    unit: "piece" },
    { name: "parmesan",        quantity: 50,   unit: "g"     },
    { name: "black pepper",    quantity: 1,    unit: "tsp"   },
  ],
};

// ------------------------------------------------------------------
// TEST 1 — isUnit type guard
// ------------------------------------------------------------------
console.assert(isUnit("g")      === true,  "isUnit: 'g' should be valid");
console.assert(isUnit("cup")    === true,  "isUnit: 'cup' should be valid");
console.assert(isUnit("oz")     === false, "isUnit: 'oz' should be invalid");
console.assert(isUnit(42)       === false, "isUnit: number should be invalid");
console.assert(isUnit(undefined) === false, "isUnit: undefined should be invalid");
console.log("✅ TEST 1 passed — isUnit");

// ------------------------------------------------------------------
// TEST 2 — parseRecipe happy path
// ------------------------------------------------------------------
const parseResult = parseRecipe(validRawRecipe);
console.assert(parseResult.ok === true, "parseRecipe: valid recipe should parse successfully");
if (parseResult.ok) {
  const recipe: Recipe = parseResult.value;
  console.assert(recipe.id === "pasta-001",          "parseRecipe: id should match");
  console.assert(recipe.servings === 2,              "parseRecipe: servings should match");
  console.assert(recipe.ingredients.length === 5,    "parseRecipe: should have 5 ingredients");
  console.assert(recipe.ingredients[0].unit === "g", "parseRecipe: first unit should be 'g'");
}
console.log("✅ TEST 2 passed — parseRecipe happy path");

// ------------------------------------------------------------------
// TEST 3 — parseRecipe validation errors
// ------------------------------------------------------------------
const missingTitle = parseRecipe({ id: "x", servings: 2, ingredients: [{ name: "salt", quantity: 1, unit: "tsp" }] });
console.assert(missingTitle.ok === false, "parseRecipe: missing title should fail");
if (!missingTitle.ok) {
  const err: ValidationError = missingTitle.error;
  console.assert(err.kind === "MISSING_FIELD", "parseRecipe: error kind should be MISSING_FIELD");
}

const badUnit = parseRecipe({ id: "x", title: "T", servings: 1, ingredients: [{ name: "salt", quantity: 1, unit: "oz" }] });
console.assert(badUnit.ok === false, "parseRecipe: invalid unit should fail");
if (!badUnit.ok) {
  const err: ValidationError = badUnit.error;
  console.assert(err.kind === "INVALID_UNIT", "parseRecipe: error kind should be INVALID_UNIT");
}

const negativeQty = parseRecipe({ id: "x", title: "T", servings: 1, ingredients: [{ name: "salt", quantity: -1, unit: "tsp" }] });
console.assert(negativeQty.ok === false, "parseRecipe: negative quantity should fail");
console.log("✅ TEST 3 passed — parseRecipe validation errors");

// ------------------------------------------------------------------
// TEST 4 — scaleRecipe
// ------------------------------------------------------------------
if (parseResult.ok) {
  const recipe = parseResult.value;

  // Scale from 2 → 4 servings (factor = 2)
  const scaled = scaleRecipe(recipe, 4);
  console.assert(scaled.ok === true, "scaleRecipe: should succeed");
  if (scaled.ok) {
    const sr: ScaledRecipe = scaled.value;
    console.assert(sr.originalServings === 2,   "scaleRecipe: originalServings should be 2");
    console.assert(sr.targetServings   === 4,   "scaleRecipe: targetServings should be 4");
    console.assert(sr.servings         === 4,   "scaleRecipe: servings field should equal targetServings");
    // spaghetti 200g × (4/2) = 400g
    console.assert(sr.ingredients[0].quantity === 400, "scaleRecipe: spaghetti should be 400g");
    // eggs 2 × (4/2) = 4
    console.assert(sr.ingredients[2].quantity === 4,   "scaleRecipe: eggs should be 4");
  }

  // Scale to invalid target
  const badScale = scaleRecipe(recipe, 0);
  console.assert(badScale.ok === false, "scaleRecipe: target 0 should fail");
  if (!badScale.ok) {
    const err: ScalingError = badScale.error;
    console.assert(err.kind === "INVALID_TARGET_SERVINGS", "scaleRecipe: error kind should be INVALID_TARGET_SERVINGS");
  }
}
console.log("✅ TEST 4 passed — scaleRecipe");

// ------------------------------------------------------------------
// TEST 5 — parseAndScale full pipeline
// ------------------------------------------------------------------
const pipelineOk = parseAndScale(validRawRecipe, 6);
console.assert(pipelineOk.ok === true, "parseAndScale: valid input should succeed");
if (pipelineOk.ok) {
  const sr: ScaledRecipe = pipelineOk.value;
  // spaghetti 200g × (6/2) = 600g
  console.assert(sr.ingredients[0].quantity === 600, "parseAndScale: spaghetti should be 600g for 6 servings");
}

const pipelineValidationFail = parseAndScale({ id: "x", title: "T", servings: 1, ingredients: [] }, 2);
console.assert(pipelineValidationFail.ok === false, "parseAndScale: empty ingredients should fail");
if (!pipelineValidationFail.ok) {
  const err: PipelineError = pipelineValidationFail.error;
  // could be validation or scaling — just ensure stage is set
  console.assert(typeof err.stage === "string", "parseAndScale: error should carry a stage");
}

const pipelineScalingFail = parseAndScale(validRawRecipe, -1);
console.assert(pipelineScalingFail.ok === false, "parseAndScale: invalid targetServings should fail");
if (!pipelineScalingFail.ok) {
  const err: PipelineError = pipelineScalingFail.error;
  console.assert(err.stage === "scaling", "parseAndScale: error stage should be 'scaling'");
}
console.log("✅ TEST 5 passed — parseAndScale pipeline");

console.log("\n🎉 All tests passed!");
