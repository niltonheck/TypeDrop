// ============================================================
// Typed API Pagination Crawler
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill in every spot marked TODO.
// ============================================================

// ── 1. Domain types ─────────────────────────────────────────

export type ProductCategory = "electronics" | "clothing" | "food" | "books";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  priceUsd: number;
  inStock: boolean;
}

// ── 2. Raw API shape (unknown → validated) ───────────────────

/**
 * Shape returned by the remote API for a single page.
 * Treat the raw response as `unknown` and validate it here.
 */
export interface RawPage {
  page: number;
  totalPages: number;
  items: unknown[];
}

// ── 3. Result type (no exceptions escape) ───────────────────

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export type CrawlError =
  | { kind: "network"; message: string }
  | { kind: "validation"; page: number; message: string }
  | { kind: "timeout"; page: number };

// ── 4. Aggregated report ─────────────────────────────────────

export interface CategoryStats {
  count: number;
  totalValueUsd: number;
  inStockCount: number;
}

/**
 * Record keyed by every ProductCategory — all keys must be present.
 */
export type CategoryReport = Record<ProductCategory, CategoryStats>;

export interface CrawlReport {
  totalProducts: number;
  totalPages: number;
  byCategory: CategoryReport;
  errors: CrawlError[];
}

// ── 5. Fetcher abstraction ───────────────────────────────────

/**
 * A function that fetches one page by number.
 * Returns unknown so the crawler must validate the response.
 */
export type PageFetcher = (page: number) => Promise<unknown>;

// ── 6. Validation helpers ────────────────────────────────────

/**
 * TODO: Implement isProductCategory.
 * Returns true iff `value` is one of the four valid ProductCategory strings.
 */
export function isProductCategory(value: unknown): value is ProductCategory {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Implement validateProduct.
 * Requirements:
 *   1. `raw` must be a non-null object.
 *   2. `id` must be a non-empty string.
 *   3. `name` must be a non-empty string.
 *   4. `category` must pass isProductCategory.
 *   5. `priceUsd` must be a finite number >= 0.
 *   6. `inStock` must be a boolean.
 * Return Ok<Product> on success, Err<string> describing the first failing field.
 */
export function validateProduct(raw: unknown): Result<Product, string> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Implement validateRawPage.
 * Requirements:
 *   1. `raw` must be a non-null object.
 *   2. `page` must be a positive integer (>= 1).
 *   3. `totalPages` must be a positive integer (>= 1).
 *   4. `items` must be an array (elements may be unknown).
 * Return Ok<RawPage> on success, Err<string> on failure.
 */
export function validateRawPage(raw: unknown): Result<RawPage, string> {
  // TODO
  throw new Error("Not implemented");
}

// ── 7. Concurrency helper ────────────────────────────────────

/**
 * TODO: Implement withConcurrencyLimit.
 *
 * Runs all `tasks` (zero-arg async functions) with at most
 * `limit` running simultaneously.
 * Preserves input order in the returned array.
 *
 * Signature must stay exactly as written — use generics, no `any`.
 */
export async function withConcurrencyLimit<T>(
  tasks: ReadonlyArray<() => Promise<T>>,
  limit: number
): Promise<T[]> {
  // TODO
  throw new Error("Not implemented");
}

// ── 8. Core crawler ─────────────────────────────────────────

/**
 * TODO: Implement crawlAllPages.
 *
 * Requirements:
 *   1. Fetch page 1 first (sequentially) to discover `totalPages`.
 *   2. If page 1 fails validation, return an Err with kind "validation".
 *   3. Fetch the remaining pages (2..totalPages) using withConcurrencyLimit
 *      with the provided `concurrencyLimit` (default: 3).
 *   4. For each page response:
 *        a. Validate the raw page shape; on failure record a "validation" CrawlError.
 *        b. Validate each item with validateProduct; silently skip invalid items
 *           (do NOT record an error for individual bad items).
 *   5. Aggregate all valid products into a CrawlReport:
 *        - byCategory must contain ALL four categories (zero-initialise missing ones).
 *        - errors collects all CrawlErrors encountered.
 *   6. Never throw — all errors must surface inside CrawlReport.errors or the
 *      returned Err.
 *   7. Network rejections (fetch throws) must be caught and recorded as
 *      kind "network" CrawlErrors (use the rejection message or "Unknown network error").
 */
export async function crawlAllPages(
  fetcher: PageFetcher,
  concurrencyLimit: number = 3
): Promise<Result<CrawlReport, CrawlError>> {
  // TODO
  throw new Error("Not implemented");
}
