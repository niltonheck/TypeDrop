// challenge.ts
//
// SCENARIO
// ─────────
// You're building the catalog layer for an e-commerce storefront.
// Raw product entries arrive as `unknown` from a third-party supplier feed.
// Your engine must validate them, apply typed filter criteria, and return
// a strongly-typed filtered inventory summary — with zero `any`.
//
// ─────────────────────────────────────────────
// TYPES — complete the stubs marked with TODO
// ─────────────────────────────────────────────

/** All supported product categories. */
export type Category = "electronics" | "clothing" | "books" | "home" | "sports";

/** Availability status of a product. */
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

/** A validated, strongly-typed product. */
export interface Product {
  id: string;
  name: string;
  category: Category;
  priceUsd: number;
  stockStatus: StockStatus;
  rating: number; // 0–5 inclusive
  tags: string[];
}

// REQUIREMENT 1
// Define `ProductFilters` — a type whose keys are a subset of Product keys
// and whose values constrain what you can filter by:
//   - `category`    → Category   (exact match)
//   - `stockStatus` → StockStatus (exact match)
//   - `maxPriceUsd` → number      (inclusive upper bound)  ← note: NOT a Product key
//   - `minRating`   → number      (inclusive lower bound)  ← note: NOT a Product key
//   - `tags`        → string[]    (product must include ALL listed tags)
// All fields must be optional.
// TODO: replace `Record<string, never>` with the correct type
export type ProductFilters = Record<string, never>;

// REQUIREMENT 2
// Define `InventorySummary` — the shape returned by `filterInventory`:
//   - `products`       → the filtered Product array
//   - `totalCount`     → total number of filtered products
//   - `categoryBreakdown` → a Record mapping every Category to the count
//                           of filtered products in that category
//                           (categories with 0 matches must still appear)
// TODO: replace `Record<string, never>` with the correct type
export type InventorySummary = Record<string, never>;

// ─────────────────────────────────────────────
// RUNTIME VALIDATION
// ─────────────────────────────────────────────

// REQUIREMENT 3
// Implement `isCategory(value: unknown): value is Category`
// Returns true only if value is one of the valid Category strings.
export function isCategory(value: unknown): value is Category {
  // TODO
  throw new Error("Not implemented");
}

// REQUIREMENT 4
// Implement `isStockStatus(value: unknown): value is StockStatus`
// Returns true only if value is one of the valid StockStatus strings.
export function isStockStatus(value: unknown): value is StockStatus {
  // TODO
  throw new Error("Not implemented");
}

// REQUIREMENT 5
// Implement `parseProduct(raw: unknown): Product | null`
// Returns a valid Product if — and only if — ALL of the following hold:
//   - raw is a non-null object
//   - id   : non-empty string
//   - name : non-empty string
//   - category   : passes isCategory
//   - priceUsd   : finite number >= 0
//   - stockStatus: passes isStockStatus
//   - rating     : finite number in [0, 5]
//   - tags        : array of strings (may be empty)
// Returns null for any invalid input.
export function parseProduct(raw: unknown): Product | null {
  // TODO
  throw new Error("Not implemented");
}

// ─────────────────────────────────────────────
// CORE LOGIC
// ─────────────────────────────────────────────

// REQUIREMENT 6
// Implement `filterInventory(rawProducts: unknown[], filters: ProductFilters): InventorySummary`
//
// Steps:
//   a) Parse each element of rawProducts with parseProduct; silently discard nulls.
//   b) Apply filters to the valid products:
//        - category    → exact match on product.category
//        - stockStatus → exact match on product.stockStatus
//        - maxPriceUsd → product.priceUsd <= maxPriceUsd
//        - minRating   → product.rating   >= minRating
//        - tags        → every tag in filters.tags appears in product.tags
//   c) Build and return an InventorySummary where:
//        - `products`  is the filtered array
//        - `totalCount` is products.length
//        - `categoryBreakdown` has an entry for EVERY Category (0 if none matched)
export function filterInventory(
  rawProducts: unknown[],
  filters: ProductFilters
): InventorySummary {
  // TODO
  throw new Error("Not implemented");
}
