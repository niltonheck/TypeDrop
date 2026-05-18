// challenge.ts
// ============================================================
// Typed Product Inventory Grouper
// Date: 2026-05-18 | Difficulty: Easy
// ============================================================
//
// SCENARIO
// --------
// Raw product entries arrive as `unknown` from a warehouse API.
// You must validate each entry, group products by category, and
// produce a strongly-typed per-category inventory summary.
//
// REQUIREMENTS
// ------------
// 1. Define a `Product` interface with fields:
//      id        : string
//      name      : string
//      category  : string
//      price     : number   (must be > 0)
//      stock     : number   (must be >= 0, integer)
//      available : boolean
//
// 2. Define a `ParseResult<T>` discriminated union:
//      { ok: true;  value: T }
//      { ok: false; error: string }
//
// 3. Implement `parseProduct(raw: unknown): ParseResult<Product>`
//    - Returns ok:true only when ALL fields are present and
//      pass the constraints above (price > 0, stock >= 0 integer).
//    - Returns ok:false with a descriptive error message otherwise.
//
// 4. Define a `CategorySummary` interface:
//      category     : string
//      productCount : number
//      totalStock   : number
//      totalValue   : number   // sum of (price * stock) per product
//      availableCount: number  // products where available === true
//
// 5. Define a `InventoryReport` interface:
//      summaries    : CategorySummary[]   // one entry per unique category
//      parseErrors  : string[]            // error messages from invalid entries
//      totalProducts: number              // count of successfully parsed products
//
// 6. Implement:
//      function buildInventoryReport(rawProducts: unknown[]): InventoryReport
//
//    - Parse every element with `parseProduct`.
//    - Collect parse errors for invalid entries.
//    - Group valid products by `category`.
//    - Compute each `CategorySummary` from the group.
//    - Return a fully-typed `InventoryReport`.
//    - `summaries` must be sorted alphabetically by `category`.
//
// CONSTRAINTS
// -----------
// - No `any`, no type assertions (`as`), no non-null assertions (`!`).
// - All logic must flow through `ParseResult<Product>` narrowing.
// ============================================================

// --- 1. Product interface ---
// TODO: define Product

// --- 2. ParseResult discriminated union ---
// TODO: define ParseResult<T>

// --- 3. parseProduct ---
export function parseProduct(_raw: unknown): ParseResult<Product> {
  // TODO: implement runtime validation
  throw new Error("Not implemented");
}

// --- 4. CategorySummary interface ---
// TODO: define CategorySummary

// --- 5. InventoryReport interface ---
// TODO: define InventoryReport

// --- 6. buildInventoryReport ---
export function buildInventoryReport(_rawProducts: unknown[]): InventoryReport {
  // TODO: implement
  throw new Error("Not implemented");
}
