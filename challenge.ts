// ============================================================
// Typed CSV Contact Importer with Validation & Deduplication
// ============================================================
// SCENARIO:
//   Raw CSV rows arrive as `unknown` from a file parser.
//   Your module must validate them into strongly-typed Contact
//   records, collect structured field-level errors, and
//   deduplicate entries by email — returning a typed ImportReport.
//
// RULES:
//   - No `any`, no type assertions (`as`), no non-null assertions (`!`)
//   - All logic lives in the functions below
//   - Use strict null checks — every field must be explicitly handled
// ============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES — fill in the branded type and complete the unions
// ------------------------------------------------------------------

/** Branded type: a string that has been validated as an email address */
// TODO: define `Email` as a branded type using an intersection
//   e.g.  type Email = string & { readonly _brand: "Email" }
type Email = string & { readonly _brand: "Email" };

/** The three contact categories the CRM supports */
// TODO: define `ContactCategory` as a union of the literals:
//   "lead" | "customer" | "partner"
type ContactCategory = "lead" | "customer" | "partner";

/** A fully-validated contact record */
// TODO: complete this interface — all fields are required
interface Contact {
  // TODO: id        — string (use the row's original "id" field)
  // TODO: name      — string (non-empty)
  // TODO: email     — Email  (branded)
  // TODO: category  — ContactCategory
  // TODO: createdAt — Date   (parsed from an ISO-8601 string)
  id: string;
  name: string;
  email: Email;
  category: ContactCategory;
  createdAt: Date;
}

// ------------------------------------------------------------------
// 2. RESULT TYPES — discriminated union for per-row outcomes
// ------------------------------------------------------------------

/** One field-level validation error */
// TODO: complete this interface
interface FieldError {
  // TODO: field   — the name of the offending field (string)
  // TODO: message — human-readable description of the problem (string)
  field: string;
  message: string;
}

/**
 * Discriminated union representing the outcome of validating one row.
 *
 * Requirements:
 *   - "ok"    variant carries the validated `Contact`
 *   - "error" variant carries the raw `rowIndex` (number) and
 *             a non-empty array of `FieldError`
 */
// TODO: define `RowResult` as a discriminated union on a `status` field
type RowResult =
  | { status: "ok"; contact: Contact }
  | { status: "error"; rowIndex: number; errors: [FieldError, ...FieldError[]] };

/** Final report returned by `importContacts` */
// TODO: complete this interface
interface ImportReport {
  // TODO: imported    — Contact[]  (all valid, deduplicated contacts)
  // TODO: failed      — RowResult[] filtered to only "error" status rows
  // TODO: duplicates  — Email[]    (emails that appeared more than once and were dropped)
  imported: Contact[];
  failed: RowResult[];
  duplicates: Email[];
}

// ------------------------------------------------------------------
// 3. VALIDATION HELPERS
// ------------------------------------------------------------------

/**
 * Type guard: returns true when `value` is a non-null plain object.
 * Requirement 1: must use `typeof` and a `null` check — no casting.
 */
// TODO: implement this type guard
function isPlainObject(value: unknown): value is Record<string, unknown> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Attempts to parse and validate a single raw CSV row.
 *
 * Requirements:
 *   2. Use `isPlainObject` to guard access to row fields.
 *   3. Validate each field and collect ALL errors before returning
 *      (do not short-circuit on the first failure).
 *   4. `id`        — must be a non-empty string
 *   5. `name`      — must be a non-empty string
 *   6. `email`     — must be a string matching /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *                    return it as the branded `Email` type on success
 *   7. `category`  — must be one of the valid ContactCategory literals
 *   8. `createdAt` — must be a string that produces a valid Date when
 *                    passed to `new Date()`; an invalid date's
 *                    `.getTime()` returns `NaN`
 *   9. If there are any errors, return a `RowResult` with status "error".
 *  10. If all fields are valid, return a `RowResult` with status "ok".
 */
// TODO: implement this function
function validateRow(raw: unknown, rowIndex: number): RowResult {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 4. MAIN ENTRY POINT
// ------------------------------------------------------------------

/**
 * Processes an array of raw CSV rows into a typed ImportReport.
 *
 * Requirements:
 *  11. Validate every row using `validateRow`.
 *  12. Separate results into "ok" and "error" buckets.
 *  13. Among the valid contacts, deduplicate by `email`:
 *        - Keep only the FIRST occurrence of each email.
 *        - Collect every subsequent duplicate email into `duplicates`
 *          (use the branded `Email` type; no plain strings).
 *  14. Return an `ImportReport` with:
 *        - `imported`   — deduplicated valid contacts
 *        - `failed`     — all "error" RowResults
 *        - `duplicates` — deduplicated list of dropped emails
 *          (each email appears at most once in this array even if
 *           it was duplicated more than twice)
 */
// TODO: implement this function
function importContacts(rows: unknown[]): ImportReport {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 5. EXPORTS
// ------------------------------------------------------------------
export type { Email, ContactCategory, Contact, FieldError, RowResult, ImportReport };
export { isPlainObject, validateRow, importContacts };
