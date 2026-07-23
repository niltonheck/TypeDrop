// ============================================================
// Typed GroupBy & Aggregation Pipeline
// challenge.ts
// ============================================================
// Compile with: tsc --strict --noEmit challenge.ts
// Do NOT use `any`, `as`, or non-null assertions (!).
// ============================================================

// ── 1. Core types ────────────────────────────────────────────

/** A record whose values can be safely used as Map keys. */
export type Keyable = string | number | boolean;

/**
 * The result of grouping an array of T by some key K.
 * Each distinct key value maps to the subset of items that share it.
 */
export type Grouped<K extends Keyable, T> = Map<K, T[]>;

/**
 * A single aggregated summary produced from one group of items.
 * S is the shape the caller defines (e.g. { total: number; count: number }).
 */
export type GroupSummary<K extends Keyable, S> = {
  key: K;
  summary: S;
};

// ── 2. groupBy ───────────────────────────────────────────────

/**
 * TODO: Implement `groupBy`.
 *
 * Requirements:
 * 1. Accept an array of items of type T and a `keySelector` that maps each
 *    item to a value of type K (which extends Keyable).
 * 2. Return a `Grouped<K, T>` (a Map) where every distinct key produced by
 *    `keySelector` maps to the array of items that produced that key.
 * 3. Preserve insertion order (Map already does this — no extra work needed).
 * 4. If `items` is empty, return an empty Map.
 */
export function groupBy<T, K extends Keyable>(
  items: T[],
  keySelector: (item: T) => K
): Grouped<K, T> {
  // TODO
  throw new Error("Not implemented");
}

// ── 3. aggregateGroups ───────────────────────────────────────

/**
 * TODO: Implement `aggregateGroups`.
 *
 * Requirements:
 * 1. Accept a `Grouped<K, T>` and a `summarise` function that reduces a
 *    group's items (T[]) into a summary of type S.
 * 2. Return an array of `GroupSummary<K, S>` — one entry per key, in the
 *    same order as the Map's iteration order.
 * 3. Every entry must carry both the original key and the computed summary.
 */
export function aggregateGroups<K extends Keyable, T, S>(
  grouped: Grouped<K, T>,
  summarise: (items: T[]) => S
): GroupSummary<K, S>[] {
  // TODO
  throw new Error("Not implemented");
}

// ── 4. groupAndAggregate (pipeline convenience) ──────────────

/**
 * TODO: Implement `groupAndAggregate`.
 *
 * Requirements:
 * 1. Combine `groupBy` and `aggregateGroups` into a single call so callers
 *    don't have to manage the intermediate `Grouped` value themselves.
 * 2. The generic parameters must be inferred — callers should never need to
 *    supply them explicitly.
 * 3. Return type must be `GroupSummary<K, S>[]`.
 */
export function groupAndAggregate<T, K extends Keyable, S>(
  items: T[],
  keySelector: (item: T) => K,
  summarise: (items: T[]) => S
): GroupSummary<K, S>[] {
  // TODO
  throw new Error("Not implemented");
}

// ── 5. topN ──────────────────────────────────────────────────

/**
 * TODO: Implement `topN`.
 *
 * Requirements:
 * 1. Accept an array of `GroupSummary<K, S>`, a `score` function that maps
 *    a summary S to a number, and a count `n`.
 * 2. Return the top `n` summaries ranked by `score` in descending order.
 * 3. If there are fewer than `n` entries, return all of them.
 * 4. Do NOT mutate the input array.
 */
export function topN<K extends Keyable, S>(
  summaries: GroupSummary<K, S>[],
  score: (summary: S) => number,
  n: number
): GroupSummary<K, S>[] {
  // TODO
  throw new Error("Not implemented");
}
