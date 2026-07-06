// ============================================================
// challenge.ts — Typed Product Inventory Filter & Summarizer
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill in every TODO. Do NOT export anything not already exported.
// ============================================================

// -----------------------------------------------------------
// 1. DOMAIN TYPES
// -----------------------------------------------------------

/** Allowed product categories — extend only by adding to this union. */
export type Category =
  | "electronics"
  | "clothing"
  | "groceries"
  | "furniture"
  | "toys";

/** Availability status for a product. */
export type AvailabilityStatus = "in_stock" | "low_stock" | "out_of_stock";

/** A validated, strongly-typed product record. */
export interface Product {
  id: string;
  name: string;
  category: Category;
  priceUsd: number;          // must be > 0
  stockCount: number;        // must be >= 0
  status: AvailabilityStatus;
}

// -----------------------------------------------------------
// 2. RESULT TYPE  (no throwing — return typed results instead)
// -----------------------------------------------------------

export type ParseResult<T> =
  | { ok: true;  value: T }
  | { ok: false; error: string };

// -----------------------------------------------------------
// 3. SUMMARY TYPE
// -----------------------------------------------------------

/** Per-category breakdown returned by summarizeInventory. */
export interface CategorySummary {
  totalProducts: number;
  totalStock: number;
  averagePriceUsd: number;    // 0 if totalProducts === 0
  statuses: Record<AvailabilityStatus, number>;
}

/** Top-level summary returned by summarizeInventory. */
export interface InventorySummary {
  totalProducts: number;
  totalStockValue: number;    // sum of (priceUsd * stockCount) across ALL passed-in products
  byCategory: Partial<Record<Category, CategorySummary>>;
  lowOrOutOfStock: Product[]; // products whose status is "low_stock" OR "out_of_stock"
}

// -----------------------------------------------------------
// 4. FILTER OPTIONS
// -----------------------------------------------------------

export interface FilterOptions {
  /** Keep only these categories. If omitted or empty, all categories pass. */
  categories?: Category[];
  /** Keep only products whose status is in this list. If omitted or empty, all statuses pass. */
  statuses?: AvailabilityStatus[];
  /** Keep only products with priceUsd <= this value. If omitted, no upper bound. */
  maxPriceUsd?: number;
}

// -----------------------------------------------------------
// 5. HELPERS YOU MUST IMPLEMENT
// -----------------------------------------------------------

const VALID_CATEGORIES = new Set<Category>([
  "electronics", "clothing", "groceries", "furniture", "toys",
]);

const VALID_STATUSES = new Set<AvailabilityStatus>([
  "in_stock", "low_stock", "out_of_stock",
]);

/**
 * TODO — Requirement 1
 * Validate a single `unknown` value into a `Product`.
 *
 * Rules:
 *  - `id`         must be a non-empty string
 *  - `name`       must be a non-empty string
 *  - `category`   must be one of the Category union values
 *  - `priceUsd`   must be a number > 0
 *  - `stockCount` must be a number >= 0 (integers only; Math.floor equality check)
 *  - `status`     must be one of the AvailabilityStatus union values
 *
 * Return { ok: false, error: "<reason>" } for the FIRST validation failure found
 * (check fields in the order listed above).
 * Return { ok: true, value: product } on success.
 */
export function parseProduct(raw: unknown): ParseResult<Product> {
  // TODO: implement validation
  throw new Error("Not implemented");
}

/**
 * TODO — Requirement 2
 * Parse an array of unknown values into Product records.
 *
 * - Call parseProduct on each element.
 * - Silently SKIP entries that fail validation (do not throw).
 * - Return only the successfully parsed products.
 */
export function parseProducts(raw: unknown[]): Product[] {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO — Requirement 3
 * Filter a list of validated products according to FilterOptions.
 *
 * - If `categories` is provided and non-empty, keep only products in those categories.
 * - If `statuses`   is provided and non-empty, keep only products with those statuses.
 * - If `maxPriceUsd` is provided, keep only products with priceUsd <= maxPriceUsd.
 * - All active criteria are AND-ed together.
 */
export function filterProducts(
  products: Product[],
  options: FilterOptions,
): Product[] {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO — Requirement 4
 * Compute an InventorySummary over the provided products.
 *
 * - `totalProducts`   = products.length
 * - `totalStockValue` = Σ (priceUsd * stockCount)
 * - `byCategory`      = one CategorySummary per category present in the array
 *     - `statuses` must count ALL three AvailabilityStatus keys (0 if none)
 *     - `averagePriceUsd` = total price of products in category / count (0 if count === 0)
 * - `lowOrOutOfStock` = products where status === "low_stock" || status === "out_of_stock"
 *
 * IMPORTANT: `totalStockValue` and `lowOrOutOfStock` are computed from the
 * products array AS PASSED IN (i.e., after any filtering the caller has already applied).
 */
export function summarizeInventory(products: Product[]): InventorySummary {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO — Requirement 5
 * Orchestrate the full pipeline:
 *   raw unknown[] → parseProducts → filterProducts → summarizeInventory
 *
 * Return the InventorySummary of the FILTERED products.
 * (totalStockValue and lowOrOutOfStock therefore reflect the filtered set.)
 */
export function processInventory(
  raw: unknown[],
  options: FilterOptions,
): InventorySummary {
  // TODO: implement
  throw new Error("Not implemented");
}
