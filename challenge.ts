// ============================================================
// Typed In-Memory Search Index
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill in every section marked TODO.
// ============================================================

// ── 1. Domain types ─────────────────────────────────────────

/**
 * A raw document as it arrives from the JSON bundle (shape unknown at
 * compile-time until validated).
 */
export type RawDocument = unknown;

/**
 * A validated document stored in the index.
 * `fields` holds the subset of string fields that were indexed.
 */
export interface IndexedDocument {
  id: string;
  fields: Record<string, string>;
}

/**
 * Configuration for the index.
 *
 * @template F - The union of field names that may be indexed.
 *
 * - `fields`       : which fields to extract & tokenise from each document
 * - `fieldWeights` : optional per-field boost multiplier (defaults to 1)
 */
export interface IndexConfig<F extends string> {
  fields: readonly F[];
  fieldWeights?: Partial<Record<F, number>>;
}

// ── 2. Result / Error types ──────────────────────────────────

/** Validation succeeded — carries the typed document. */
export interface ValidationOk {
  kind: "ok";
  document: IndexedDocument;
}

/** Validation failed — carries a human-readable reason. */
export interface ValidationError {
  kind: "error";
  reason: string;
  raw: RawDocument;
}

/** Discriminated union returned by the validator. */
export type ValidationResult = ValidationOk | ValidationError;

/** A single ranked search hit. */
export interface SearchHit {
  id: string;
  /** Aggregated relevance score (higher is better). */
  score: number;
  /** The field values of the matched document. */
  fields: Record<string, string>;
}

/** The final outcome of a search call. */
export type SearchResult =
  | { kind: "results"; hits: SearchHit[]; query: string }
  | { kind: "empty"; query: string };

// ── 3. Utility types (TODO) ──────────────────────────────────

/**
 * TODO 3-A
 * Define `ExtractFields<C>` — a conditional/infer type that, given an
 * `IndexConfig<F>`, extracts the union `F` of indexed field names.
 *
 * Example:
 *   type Cfg = IndexConfig<"title" | "body">;
 *   type Fields = ExtractFields<Cfg>;  // → "title" | "body"
 */
export type ExtractFields<C> = C extends IndexConfig<infer F> ? F : never;

/**
 * TODO 3-B
 * Define `WeightMap<F extends string>` as a `Required` mapping of every
 * field in `F` to a `number`.  Use only built-in utility types — no
 * manual `{ [K in F]: number }`.
 */
export type WeightMap<F extends string> = Required<Record<F, number>>;

// ── 4. Validation (TODO) ─────────────────────────────────────

/**
 * TODO 4
 * Implement `validateDocument`.
 *
 * Requirements:
 * 1. Accept a `RawDocument` and an `IndexConfig<F>`.
 * 2. Confirm the raw value is a non-null object.
 * 3. Confirm it has an `id` property that is a non-empty string.
 * 4. For each field in `config.fields`, extract its value if it is a
 *    string (skip / omit fields that are missing or non-string).
 * 5. Return `ValidationOk` with the constructed `IndexedDocument`, or
 *    `ValidationError` with a descriptive `reason`.
 *
 * No `any`, no `as`.
 */
export function validateDocument<F extends string>(
  raw: RawDocument,
  config: IndexConfig<F>
): ValidationResult {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 5. Tokeniser (TODO) ──────────────────────────────────────

/**
 * TODO 5
 * Implement `tokenise`.
 *
 * Requirements:
 * 1. Lower-case the input string.
 * 2. Split on any non-alphanumeric character (use a regex).
 * 3. Filter out empty tokens and tokens shorter than 2 characters.
 * 4. Return a `string[]`.
 */
export function tokenise(text: string): string[] {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 6. SearchIndex class (TODO) ──────────────────────────────

/**
 * TODO 6
 * Implement the `SearchIndex` class.
 *
 * Internal data structures (suggested — you may adjust types as needed):
 *   - `documents`    : Map<string, IndexedDocument>
 *   - `invertedIndex`: Map<string, Map<string, number>>
 *       token → (docId → raw term-frequency count)
 *   - `weights`      : WeightMap<F>
 *
 * Methods to implement:
 *
 * 6-A  constructor(config: IndexConfig<F>)
 *        Build the `weights` map by merging `config.fieldWeights` with a
 *        default of 1 for every field in `config.fields`.
 *
 * 6-B  add(raw: RawDocument): ValidationResult
 *        Validate the document; on success, store it and index every token
 *        from each configured field, accumulating term-frequency counts
 *        weighted by the field's multiplier.
 *        Return the `ValidationResult` so callers can surface errors.
 *
 * 6-C  search(query: string): SearchResult
 *        Tokenise the query; for each token look up matching docIds in the
 *        inverted index and sum their stored weighted counts into a score
 *        map (Map<docId, score>).
 *        Sort hits descending by score, map to `SearchHit[]`, and return
 *        the appropriate `SearchResult` variant.
 *
 * 6-D  size(): number
 *        Return the number of successfully indexed documents.
 */
export class SearchIndex<F extends string> {
  // TODO: declare private fields

  constructor(config: IndexConfig<F>) {
    // TODO: implement 6-A
    throw new Error("Not implemented");
  }

  add(raw: RawDocument): ValidationResult {
    // TODO: implement 6-B
    throw new Error("Not implemented");
  }

  search(query: string): SearchResult {
    // TODO: implement 6-C
    throw new Error("Not implemented");
  }

  size(): number {
    // TODO: implement 6-D
    throw new Error("Not implemented");
  }
}
