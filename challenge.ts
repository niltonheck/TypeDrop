// ============================================================
// Typed Blog Post Tag Index
// challenge.ts
// ============================================================
// GOAL: Validate raw CMS post data, build a reverse tag→post
// index, and produce a typed tag summary report.
//
// Rules:
//  - strict: true, no `any`, no type assertions (`as`)
//  - All type-narrowing must happen through guard functions
// ============================================================

// ── 1. Domain types ─────────────────────────────────────────

/** A validated blog post as it exists in our system. */
export interface BlogPost {
  id: string;
  title: string;
  author: string;
  /** ISO-8601 date string, e.g. "2026-05-14" */
  publishedAt: string;
  /** At least one tag is required. */
  tags: [string, ...string[]];
  /** Word count must be a positive integer. */
  wordCount: number;
}

/**
 * One entry in the tag index.
 * Maps a single tag to the posts that carry it,
 * plus some aggregate statistics.
 */
export interface TagSummary {
  tag: string;
  /** Total number of posts carrying this tag. */
  postCount: number;
  /** Average word count across all posts with this tag (rounded to nearest integer). */
  avgWordCount: number;
  /** The post with the most words among posts carrying this tag. */
  longestPost: Pick<BlogPost, "id" | "title" | "wordCount">;
  /** All post IDs carrying this tag, sorted ascending. */
  postIds: string[];
}

/**
 * The final report returned by `buildTagIndex`.
 */
export interface TagIndexReport {
  /** Total number of successfully validated posts. */
  validPostCount: number;
  /** Total number of raw entries that failed validation. */
  invalidCount: number;
  /**
   * Tag summaries, keyed by tag name.
   * Only tags that appear on at least one valid post are included.
   */
  index: Record<string, TagSummary>;
}

// ── 2. Validation result type ────────────────────────────────

// TODO (Requirement 1):
// Define a discriminated union `ValidationResult<T>` with two
// variants:
//  - { ok: true;  value: T }
//  - { ok: false; error: string }
//
// Use a generic type parameter so it works for any validated type.

export type ValidationResult<T> = never; // replace `never` with your implementation

// ── 3. Runtime validator ─────────────────────────────────────

// TODO (Requirement 2):
// Implement `validatePost(raw: unknown): ValidationResult<BlogPost>`
//
// A raw entry is valid when ALL of the following hold:
//  a) It is a non-null object.
//  b) `id`          — non-empty string
//  c) `title`       — non-empty string
//  d) `author`      — non-empty string
//  e) `publishedAt` — string matching /^\d{4}-\d{2}-\d{2}$/
//  f) `tags`        — non-empty array where every element is a
//                     non-empty string (duplicates are allowed)
//  g) `wordCount`   — positive integer (> 0, Number.isInteger)
//
// Return { ok: false, error: "<reason>" } for the FIRST failing
// check (check in the order listed above).
// Return { ok: true, value: <BlogPost> } on success.

export function validatePost(raw: unknown): ValidationResult<BlogPost> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 4. Core engine ───────────────────────────────────────────

// TODO (Requirement 3):
// Implement `buildTagIndex(rawPosts: unknown[]): TagIndexReport`
//
// Steps:
//  a) Validate every element with `validatePost`.
//  b) Count valid and invalid entries.
//  c) For each valid post, register it under EVERY tag it carries:
//       - Accumulate total word counts and post IDs per tag.
//       - Track the longest post (highest wordCount) per tag.
//         If two posts tie, keep the one whose `id` comes first
//         lexicographically.
//  d) Build a `TagSummary` for each tag:
//       - `avgWordCount` rounded with Math.round.
//       - `postIds` sorted with Array.prototype.sort (default, ascending).
//  e) Return the `TagIndexReport`.

export function buildTagIndex(rawPosts: unknown[]): TagIndexReport {
  // TODO: implement
  throw new Error("Not implemented");
}
