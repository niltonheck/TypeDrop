// ============================================================
// challenge.ts — Typed Paginated API Client with Result Accumulation
// ============================================================
// Rules:
//   • No `any`, no `as`, no type assertions
//   • Must compile under strict: true
//   • Implement every function marked TODO
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** Opaque page cursor returned by the API. */
type PageCursor = string & { readonly __brand: "PageCursor" };

/** Creates a PageCursor from a raw string (used only in mock/test code). */
export function toPageCursor(raw: string): PageCursor {
  return raw as PageCursor; // assertion allowed ONLY here — do not use elsewhere
}

// ------------------------------------------------------------------
// 2. DOMAIN TYPES
// ------------------------------------------------------------------

export type ReportCategory = "revenue" | "engagement" | "retention" | "churn";

export interface ReportRow {
  id: string;
  category: ReportCategory;
  value: number;
  label: string;
}

// ------------------------------------------------------------------
// 3. API RESPONSE TYPES
// ------------------------------------------------------------------

export interface PageSuccess {
  kind: "success";
  rows: ReportRow[];
  nextCursor: PageCursor | null;
}

export interface PageError {
  kind: "error";
  message: string;
  /** The cursor that was used when this page failed (null = first page). */
  failedCursor: PageCursor | null;
}

export type PageResult = PageSuccess | PageError;

// ------------------------------------------------------------------
// 4. FETCH ABSTRACTION
// ------------------------------------------------------------------

/**
 * Signature for the function that fetches a single page.
 * Pass `null` to fetch the very first page.
 */
export type FetchPage = (cursor: PageCursor | null) => Promise<PageResult>;

// ------------------------------------------------------------------
// 5. ACCUMULATOR / SUMMARY TYPES
// ------------------------------------------------------------------

/**
 * Per-category summary computed across ALL successfully fetched rows.
 * Every ReportCategory key must be present (even if zero rows matched).
 */
export type CategorySummary = Record<
  ReportCategory,
  { count: number; totalValue: number; avgValue: number }
>;

export interface FetchAllResult {
  /** All rows collected from successful pages. */
  rows: ReportRow[];
  /** Aggregated stats, one entry per category. */
  summary: CategorySummary;
  /** Errors collected from failed pages (may be empty). */
  errors: PageError[];
  /** Total number of pages attempted (success + error). */
  pagesAttempted: number;
}

// ------------------------------------------------------------------
// 6. UTILITY TYPES  ← the typing challenges live here
// ------------------------------------------------------------------

/**
 * TODO A — `PickRows`
 *
 * A generic utility type that, given a union of ReportRow objects,
 * extracts only those whose `category` field is assignable to `C`.
 *
 * Usage example (do NOT implement a runtime function — type-level only):
 *   type RevenueRows = PickRows<ReportRow, "revenue">;
 *   // => ReportRow where category === "revenue"
 *
 * Requirement: use a conditional type with `infer` or a simple
 * distributive conditional — no mapped types.
 */
export type PickRows<R extends { category: string }, C extends string> =
  /* TODO A */ never;

/**
 * TODO B — `SummaryEntry`
 *
 * A mapped utility type that transforms a `CategorySummary` into a
 * "display" shape where every category maps to a single formatted string
 * (e.g., "Revenue: 42 rows, avg $3.14").
 *
 * The mapped type must:
 *   • Iterate over the keys of CategorySummary (i.e. ReportCategory)
 *   • Produce `{ [K in ReportCategory]: string }`
 *   • Be expressed as a mapped type (not a plain Record alias)
 */
export type SummaryDisplay = /* TODO B */ never;

// ------------------------------------------------------------------
// 7. CORE FUNCTIONS
// ------------------------------------------------------------------

/**
 * TODO C — `buildCategorySummary`
 *
 * Given an array of ReportRow, compute a CategorySummary.
 * Every ReportCategory must appear in the result, even if no rows matched.
 * `avgValue` should be 0 when count is 0 (avoid division by zero).
 *
 * Requirements:
 *   • Return type must be explicitly annotated as `CategorySummary`
 *   • Use a single-pass accumulation (one loop / reduce over rows)
 *   • Do not use `any`
 */
export function buildCategorySummary(rows: ReportRow[]): CategorySummary {
  // TODO C
  throw new Error("Not implemented");
}

/**
 * TODO D — `formatSummary`
 *
 * Given a CategorySummary, return a SummaryDisplay.
 * Format each entry as: `"<Category>: <count> rows, avg <avgValue fixed to 2 decimals>"`
 * Example: `"revenue: 3 rows, avg 14.67"`
 *
 * Requirements:
 *   • Return type must be explicitly annotated as `SummaryDisplay`
 *   • Keys must cover every ReportCategory
 */
export function formatSummary(summary: CategorySummary): SummaryDisplay {
  // TODO D
  throw new Error("Not implemented");
}

/**
 * TODO E — `fetchAllPages`
 *
 * Walk all pages by calling `fetchPage` repeatedly, following cursors,
 * until `nextCursor` is null or an error is encountered on a page.
 *
 * Behaviour:
 *   • On a PageError: record the error, STOP paginating (do not attempt further pages).
 *   • On a PageSuccess: accumulate rows and continue with the nextCursor.
 *   • After all pages are processed, call `buildCategorySummary` on accumulated rows.
 *   • Return a fully populated `FetchAllResult`.
 *
 * Requirements:
 *   • Return type must be explicitly annotated as `Promise<FetchAllResult>`
 *   • Pages must be fetched SEQUENTIALLY (await each before starting the next)
 *   • Do not use `any`
 *
 * @param fetchPage  - injected page-fetching function (enables easy testing)
 * @param maxPages   - safety cap; stop after this many page attempts (default: 100)
 */
export async function fetchAllPages(
  fetchPage: FetchPage,
  maxPages: number = 100
): Promise<FetchAllResult> {
  // TODO E
  throw new Error("Not implemented");
}
