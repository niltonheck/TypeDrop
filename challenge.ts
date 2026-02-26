// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts  –  Typed Product Inventory Aggregator
// Compile target: TypeScript 5.x, strict: true
// ─────────────────────────────────────────────────────────────────────────────

// ─── Domain Types ────────────────────────────────────────────────────────────

/** All valid product categories in the warehouse. */
export type Category = "electronics" | "clothing" | "food" | "furniture";

/** A validated, fully-typed inventory record. */
export interface Product {
  id: string;
  name: string;
  category: Category;
  priceUsd: number;   // must be > 0
  stock: number;      // must be >= 0, integer
}

// ─── Result Type ─────────────────────────────────────────────────────────────

/**
 * A simple Result discriminated union.
 * Use `Result<T, E>` as the return type wherever parsing may fail.
 */
export type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

// ─── Parse Error ─────────────────────────────────────────────────────────────

/** Describes why a raw record failed validation. */
export interface ParseError {
  /** Zero-based index of the record in the input array. */
  index: number;
  /** Human-readable reason, e.g. "missing field: category" */
  reason: string;
}

// ─── Aggregation Types ───────────────────────────────────────────────────────

/** Per-category summary produced by `aggregateByCategory`. */
export interface CategorySummary {
  category: Category;
  productCount: number;
  totalStock: number;
  averagePriceUsd: number;  // rounded to 2 decimal places
  cheapestProduct: Pick<Product, "id" | "name" | "priceUsd">;
}

/**
 * The final shape returned by `buildInventoryReport`.
 *
 * - `summaries`      — one entry per category that has at least one valid product,
 *                      sorted ascending by `category` (alphabetical).
 * - `parseErrors`    — every record that failed validation.
 * - `totalProducts`  — count of successfully parsed products across all categories.
 */
export interface InventoryReport {
  summaries: CategorySummary[];
  parseErrors: ParseError[];
  totalProducts: number;
}

// ─── Helpers you must implement ───────────────────────────────────────────────

/**
 * TODO 1 — Validate a single unknown value as a `Product`.
 *
 * Requirements:
 *  - Return `{ ok: true, value: Product }` when ALL of the following hold:
 *      • `id`       is a non-empty string
 *      • `name`     is a non-empty string
 *      • `category` is one of the four valid Category literals
 *      • `priceUsd` is a finite number strictly greater than 0
 *      • `stock`    is a non-negative integer (Number.isInteger, >= 0)
 *  - Return `{ ok: false, error: string }` with a descriptive reason otherwise.
 *  - Do NOT use `any` or type assertions (`as`).
 *  - Hint: narrow `unknown` step-by-step (typeof, `in`, etc.).
 */
export function parseProduct(raw: unknown): Result<Product, string> {
  // TODO: implement me
  throw new Error("Not implemented");
}

/**
 * TODO 2 — Group a validated array of products by category.
 *
 * Requirements:
 *  - Return a `Map` keyed by `Category`.
 *  - Every product must appear in exactly one bucket.
 *  - Use `Record` or `Map` — your choice, but the return type must be exact.
 */
export function groupByCategory(products: Product[]): Map<Category, Product[]> {
  // TODO: implement me
  throw new Error("Not implemented");
}

/**
 * TODO 3 — Compute a `CategorySummary` for a non-empty array of products
 *           that all belong to the same category.
 *
 * Requirements:
 *  - `averagePriceUsd` must be rounded to exactly 2 decimal places
 *    (use `Math.round(x * 100) / 100`).
 *  - `cheapestProduct` is the product with the lowest `priceUsd`;
 *    on a tie, pick the one that appears first in the array.
 *  - Return type must be `CategorySummary` (no extra fields).
 */
export function summariseCategory(
  category: Category,
  products: Product[]
): CategorySummary {
  // TODO: implement me
  throw new Error("Not implemented");
}

/**
 * TODO 4 — Orchestrate everything into one `InventoryReport`.
 *
 * Requirements:
 *  - Call `parseProduct` on every element of `rawRecords`.
 *  - Collect `ParseError` entries (with the correct `index`) for failures.
 *  - Pass only valid products to `groupByCategory`, then `summariseCategory`.
 *  - Sort `summaries` alphabetically by `category`.
 *  - Populate all three fields of `InventoryReport` correctly.
 */
export function buildInventoryReport(rawRecords: unknown[]): InventoryReport {
  // TODO: implement me
  throw new Error("Not implemented");
}
