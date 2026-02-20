// challenge.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed Inventory Aggregator
//
// SCENARIO:
//   You are given a flat list of InventoryItem records from a warehouse API.
//   Your job is to aggregate them into a per-category summary map.
//
// REQUIREMENTS:
//   1. Define a branded type `Sku` (string branded with { readonly _brand: "Sku" })
//      and a helper `toSku(s: string): Sku` that casts safely without using `any`.
//
//   2. Define the `InventoryItem` interface using `Sku` for the `sku` field.
//      Fields: sku (Sku), name (string), category (string),
//              priceUsd (number), stock (number).
//
//   3. Define `CategorySummary` with:
//        - totalItems:   total number of distinct SKUs in the category
//        - totalStock:   sum of stock across all items
//        - totalValueUsd: sum of (priceUsd * stock) for each item
//        - cheapestSku:  the Sku with the lowest priceUsd (ties: keep first seen)
//        - mostStockedSku: the Sku with the highest stock (ties: keep first seen)
//
//   4. Define the return type `InventorySummary` as a
//      `Record<string, CategorySummary>` (keyed by category name).
//
//   5. Implement `aggregateInventory(items: InventoryItem[]): InventorySummary`.
//      - An empty input must return an empty object `{}`.
//      - Items are processed in array order (important for tie-breaking).
//
//   6. Implement `topCategories(summary: InventorySummary, n: number): string[]`
//      that returns the top-n category names sorted by totalValueUsd DESCENDING.
//      If n exceeds the number of categories, return all of them.
// ─────────────────────────────────────────────────────────────────────────────

// TODO 1 — Branded Sku type
export type Sku = string & { readonly _brand: "Sku" };

export function toSku(s: string): Sku {
  // TODO: return s as Sku without using `any` or a type assertion keyword
  // Hint: there is exactly one TypeScript keyword that lets you widen/narrow
  // a value to a compatible type without `as` — look up "satisfies" or think
  // about how branded types are usually constructed in strict mode.
  throw new Error("Not implemented");
}

// TODO 2 — InventoryItem interface
export interface InventoryItem {
  // TODO: fill in the fields described in requirement 2
}

// TODO 3 — CategorySummary interface
export interface CategorySummary {
  // TODO: fill in the fields described in requirement 3
}

// TODO 4 — InventorySummary type alias
export type InventorySummary = Record<string, CategorySummary>;

// TODO 5 — aggregateInventory
export function aggregateInventory(items: InventoryItem[]): InventorySummary {
  // TODO: implement
  throw new Error("Not implemented");
}

// TODO 6 — topCategories
export function topCategories(summary: InventorySummary, n: number): string[] {
  // TODO: implement
  throw new Error("Not implemented");
}
