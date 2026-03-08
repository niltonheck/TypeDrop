
// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts  –  Typed Inventory Aggregator
// ─────────────────────────────────────────────────────────────────────────────
// TOPICS COVERED:
//   • Union types & discriminated unions
//   • Utility types  (Pick, Omit, Record)
//   • Runtime narrowing / unknown → typed validation
//   • Iteration & aggregation  (groupBy, reduce, single-pass stats)
//   • Result<T, E> error type
// ─────────────────────────────────────────────────────────────────────────────

// ─── Domain types ────────────────────────────────────────────────────────────

export type Category = "electronics" | "clothing" | "food" | "furniture";

export interface RawRecord {
  id: string;
  name: string;
  category: string;   // intentionally unvalidated – may not be a Category
  quantity: number;
  unitPrice: number;  // price in cents (integer)
  warehouseId: string;
}

/** A validated, trusted inventory item. */
export interface InventoryItem
  extends Omit<RawRecord, "category"> {
  category: Category;
}

// ─── Result type ─────────────────────────────────────────────────────────────

export type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

export type ValidationError = {
  recordId: string;
  reason: "unknown_category" | "negative_quantity" | "negative_price";
};

// ─── Aggregation output ───────────────────────────────────────────────────────

export interface CategorySummary {
  category: Category;
  totalItems: number;       // count of distinct SKUs
  totalQuantity: number;    // sum of all quantities
  totalValue: number;       // sum of (quantity * unitPrice) in cents
  averageUnitPrice: number; // mean unitPrice across SKUs (rounded to nearest integer)
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 1
// ─────────────────────────────────────────────────────────────────────────────
// Validate a single RawRecord.
//
// Requirements:
//   1. Return Ok<InventoryItem> when the record is valid.
//   2. Return Err<ValidationError> for the FIRST failing rule found, checked
//      in this order:
//        a. category must be one of the four Category values
//        b. quantity must be >= 0
//        c. unitPrice must be >= 0
//
// TODO: implement validateRecord
export function validateRecord(
  raw: RawRecord
): Result<InventoryItem, ValidationError> {
  throw new Error("Not implemented");
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 2
// ─────────────────────────────────────────────────────────────────────────────
// Partition a list of RawRecords into valid items and validation errors.
//
// Requirements:
//   1. Call validateRecord for every element.
//   2. Collect all InventoryItems into `valid` and all ValidationErrors
//      into `errors` — do NOT throw or short-circuit on the first error.
//   3. Return type must be inferred from the signature below (no extra casting).
//
// TODO: implement partitionRecords
export function partitionRecords(raws: RawRecord[]): {
  valid: InventoryItem[];
  errors: ValidationError[];
} {
  throw new Error("Not implemented");
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 3
// ─────────────────────────────────────────────────────────────────────────────
// Group a list of valid InventoryItems by category and compute per-category
// statistics.
//
// Requirements:
//   1. Return a Record<Category, CategorySummary> that contains an entry for
//      every category that appears in `items` (categories with no items may
//      be absent).
//   2. totalItems  = number of InventoryItem entries in that category.
//   3. totalQuantity = sum of item.quantity.
//   4. totalValue    = sum of (item.quantity * item.unitPrice).
//   5. averageUnitPrice = Math.round(sum of unitPrice / totalItems).
//   6. Accomplish this in a SINGLE pass over `items` (one loop / one reduce).
//
// TODO: implement aggregateByCategory
export function aggregateByCategory(
  items: InventoryItem[]
): Partial<Record<Category, CategorySummary>> {
  throw new Error("Not implemented");
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 4
// ─────────────────────────────────────────────────────────────────────────────
// Compose the full pipeline: raw records → validated → aggregated.
//
// Requirements:
//   1. Call partitionRecords, then aggregateByCategory on the valid slice.
//   2. Return both the summary map AND the list of validation errors so the
//      caller can log / surface them.
//
// TODO: implement processInventory
export function processInventory(raws: RawRecord[]): {
  summary: Partial<Record<Category, CategorySummary>>;
  errors: ValidationError[];
} {
  throw new Error("Not implemented");
}
