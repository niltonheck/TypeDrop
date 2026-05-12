// ============================================================
// Typed Product Inventory Filter
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`)
// ============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES
// ------------------------------------------------------------------

/** All valid product categories in the catalog. */
export type Category = "electronics" | "clothing" | "books" | "home" | "sports";

/** A product that has passed validation. */
export interface Product {
  id: string;
  name: string;
  category: Category;
  priceUsd: number;   // must be > 0
  stock: number;      // must be >= 0, integer
  rating: number;     // 0.0 – 5.0 inclusive
  tags: string[];     // may be empty
}

// ------------------------------------------------------------------
// 2. FILTER TYPES
// ------------------------------------------------------------------

/**
 * Each field in FilterCriteria is optional.
 * When present, a product must satisfy ALL provided criteria.
 *
 * Requirements:
 *  - `categories`  : product.category must be one of the listed values
 *  - `maxPriceUsd` : product.priceUsd must be <= this value
 *  - `minRating`   : product.rating must be >= this value
 *  - `inStockOnly` : if true, product.stock must be > 0
 *  - `tags`        : product must have AT LEAST ONE matching tag
 */
export interface FilterCriteria {
  categories?: Category[];
  maxPriceUsd?: number;
  minRating?: number;
  inStockOnly?: boolean;
  tags?: string[];
}

// ------------------------------------------------------------------
// 3. RESULT TYPES
// ------------------------------------------------------------------

/** Wraps a successfully validated + filtered product list. */
export interface InventoryReport {
  totalInput: number;          // total raw entries received
  validCount: number;          // entries that passed validation
  invalidCount: number;        // entries that failed validation
  filteredProducts: Product[]; // products surviving both validation AND filter
  invalidReasons: InvalidEntry[];
}

/** Describes one validation failure. */
export interface InvalidEntry {
  index: number;   // 0-based position in the raw input array
  reason: string;  // human-readable explanation
}

// ------------------------------------------------------------------
// 4. VALIDATION  (TODO — implement this)
// ------------------------------------------------------------------

/**
 * Validate a single raw value and return either a valid Product
 * or an error string describing why it failed.
 *
 * Requirements (return an error string if ANY of these fail):
 *  R1. Value must be a non-null object.
 *  R2. `id` must be a non-empty string.
 *  R3. `name` must be a non-empty string.
 *  R4. `category` must be one of the Category union values.
 *  R5. `priceUsd` must be a finite number greater than 0.
 *  R6. `stock` must be a non-negative integer (>= 0, Number.isInteger).
 *  R7. `rating` must be a finite number between 0 and 5 inclusive.
 *  R8. `tags` must be an array where every element is a string
 *      (an empty array is valid).
 *
 * Return type must use the discriminated union below — no `as`.
 */
export type ValidationResult =
  | { ok: true; product: Product }
  | { ok: false; reason: string };

export function validateProduct(raw: unknown): ValidationResult {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 5. FILTERING  (TODO — implement this)
// ------------------------------------------------------------------

/**
 * Apply FilterCriteria to an already-validated Product.
 * Return true if the product satisfies ALL present criteria.
 *
 * Requirements:
 *  F1. If `criteria.categories` is provided and non-empty,
 *      product.category must appear in that array.
 *  F2. If `criteria.maxPriceUsd` is provided,
 *      product.priceUsd must be <= criteria.maxPriceUsd.
 *  F3. If `criteria.minRating` is provided,
 *      product.rating must be >= criteria.minRating.
 *  F4. If `criteria.inStockOnly` is true,
 *      product.stock must be > 0.
 *  F5. If `criteria.tags` is provided and non-empty,
 *      product.tags must share at least one element with criteria.tags.
 */
export function matchesFilter(product: Product, criteria: FilterCriteria): boolean {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. MAIN ENTRY POINT  (TODO — implement this)
// ------------------------------------------------------------------

/**
 * Process a raw supplier feed and return a typed InventoryReport.
 *
 * Steps:
 *  S1. Validate every element of `rawEntries` using `validateProduct`.
 *  S2. Collect validation failures into `invalidReasons`.
 *  S3. Apply `matchesFilter` to every valid product using `criteria`.
 *  S4. Return a fully-populated InventoryReport.
 *
 * Note: `rawEntries` itself may not be an array — if it is not,
 * return a report where totalInput = 0 and invalidCount = 0.
 */
export function buildInventoryReport(
  rawEntries: unknown,
  criteria: FilterCriteria
): InventoryReport {
  // TODO: implement
  throw new Error("Not implemented");
}
