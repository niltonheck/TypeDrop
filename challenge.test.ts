// challenge.test.ts
import {
  scaleRecipe,
  mergeShoppingList,
  formatShoppingList,
  type Recipe,
  type ShoppingList,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────
const pancakes: Recipe = {
  id: "r1",
  title: "Pancakes",
  servings: 4,
  ingredients: [
    { name: "flour",  quantity: 200, unit: "g"     },
    { name: "milk",   quantity: 300, unit: "ml"    },
    { name: "eggs",   quantity: 2,   unit: "whole" },
    { name: "salt",   quantity: 0.5, unit: "tsp"   },
    { name: "butter", quantity: 1,   unit: "tbsp"  },
  ],
};

const smoothie: Recipe = {
  id: "r2",
  title: "Berry Smoothie",
  servings: 2,
  ingredients: [
    { name: "milk",     quantity: 250, unit: "ml"  },
    { name: "berries",  quantity: 150, unit: "g"   },
    { name: "honey",    quantity: 1,   unit: "tbsp"},
    { name: "salt",     quantity: 1,   unit: "pinch"},
  ],
};

// ── Test 1: scaleRecipe doubles quantities for 8 servings ─────
const scaled = scaleRecipe(pancakes, 8);
console.assert(scaled.servings === 8, "T1a: servings should be 8");
console.assert(
  scaled.ingredients.find(i => i.name === "flour")?.quantity === 400,
  "T1b: flour should scale to 400g"
);
console.assert(
  scaled.ingredients.find(i => i.name === "salt")?.quantity === 1,
  "T1c: salt should scale to 1 tsp"
);
console.assert(scaled.id === "r1" && scaled.title === "Pancakes",
  "T1d: id and title must be preserved");

// ── Test 2: scaleRecipe throws on invalid targetServings ──────
let threw = false;
try { scaleRecipe(pancakes, 0); } catch (e) { threw = e instanceof RangeError; }
console.assert(threw, "T2: should throw RangeError for targetServings = 0");

// ── Test 3: mergeShoppingList sums same name+unit ─────────────
const scaledPancakes = scaleRecipe(pancakes, 4); // unchanged
const scaledSmoothie = scaleRecipe(smoothie, 4); // doubled

const list: ShoppingList = mergeShoppingList([scaledPancakes, scaledSmoothie]);

const milkEntry = list.filter(e => e.name === "milk" && e.unit === "ml");
console.assert(
  milkEntry.length === 1 && milkEntry[0].quantity === 800,
  "T3a: milk (ml) should be merged: 300 + 500 = 800"
);

const saltEntries = list.filter(e => e.name === "salt");
console.assert(
  saltEntries.length === 2,
  "T3b: salt in 'tsp' and 'pinch' must remain as separate entries"
);

// ── Test 4: formatShoppingList output ─────────────────────────
const formatted = formatShoppingList([
  { name: "flour",  quantity: 200,  unit: "g"     },
  { name: "eggs",   quantity: 3,    unit: "whole" },
  { name: "salt",   quantity: 1.5,  unit: "tsp"   },
  { name: "milk",   quantity: 150,  unit: "ml"    },
]);

const lines = formatted.split("\n");
console.assert(lines[0] === "- 3 whole eggs",   "T4a: eggs line (whole unit with space)");
console.assert(lines[1] === "- 200g flour",      "T4b: flour line (g attaches directly)");
console.assert(lines[2] === "- 150ml milk",      "T4c: milk line (ml attaches directly)");
console.assert(lines[3] === "- 1.5 tsp salt",    "T4d: salt line (tsp with space, decimal)");

// ── Test 5: formatShoppingList empty list ─────────────────────
console.assert(
  formatShoppingList([]) === "(empty list)",
  "T5: empty list should return '(empty list)'"
);

console.log("All tests passed! ✅");
