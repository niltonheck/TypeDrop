// ============================================================
// Typed User Notification Preferences Merger
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// ============================================================

// ── 1. Domain types ──────────────────────────────────────────

/** The three supported notification channels. */
export type Channel = "email" | "sms" | "push";

/**
 * How often notifications are delivered on a given channel.
 * "immediate" = send right away
 * "digest"    = batch into a daily digest
 * "off"       = disabled entirely
 */
export type Frequency = "immediate" | "digest" | "off";

/** Per-channel settings that can be configured. */
export type ChannelConfig = {
  frequency: Frequency;
  /** Whether to include a preview of the content in the notification. */
  preview: boolean;
};

/**
 * A full preferences map — every channel MUST be present.
 * Use a mapped type over `Channel` to enforce this.
 *
 * TODO: Replace `unknown` with the correct mapped type.
 */
export type PreferencesMap = unknown; // TODO

/**
 * The final resolved preferences returned to callers.
 * It contains the merged map plus metadata about the merge.
 */
export type ResolvedPreferences = {
  userId: string;
  /** The fully merged preferences (org defaults ← user overrides). */
  preferences: PreferencesMap;
  /**
   * Which channels were actually overridden by the user
   * (i.e. the user supplied a config for that channel).
   */
  overriddenChannels: Channel[];
  /** ISO-8601 timestamp of when the merge was performed. */
  mergedAt: string;
};

// ── 2. Validation helpers ─────────────────────────────────────

/**
 * Type guard: returns true when `value` is a valid `Frequency` string.
 *
 * TODO: Implement this guard — no `any`, no casting.
 */
export function isFrequency(value: unknown): value is Frequency {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Type guard: returns true when `value` is a valid `ChannelConfig` object.
 * Requirements:
 *   1. Must be a non-null object.
 *   2. Must have a `frequency` property that satisfies `isFrequency`.
 *   3. Must have a `preview` property that is a boolean.
 *
 * TODO: Implement this guard — no `any`, no casting.
 */
export function isChannelConfig(value: unknown): value is ChannelConfig {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Parses a raw (unknown) value into a `Partial<PreferencesMap>`.
 * Only keys that are valid `Channel` strings AND whose values satisfy
 * `isChannelConfig` are included in the result; everything else is silently
 * dropped.
 *
 * Returns an empty object if `raw` is not a non-null object.
 *
 * TODO: Implement — no `any`, no casting.
 */
export function parsePartialPreferences(raw: unknown): Partial<PreferencesMap> {
  // TODO
  throw new Error("Not implemented");
}

// ── 3. Core logic ─────────────────────────────────────────────

/**
 * Merges org-level defaults with a user's overrides and returns
 * a `ResolvedPreferences` object.
 *
 * Merge rules:
 *   - Start with `orgDefaults` as the base (it is already a full `PreferencesMap`).
 *   - For each channel in `userRaw` that parses successfully, replace the
 *     org default for that channel with the user's value.
 *   - Collect the channels that were actually overridden into `overriddenChannels`
 *     (sorted alphabetically for determinism).
 *   - Set `mergedAt` to `new Date().toISOString()`.
 *
 * @param userId     - The user's unique identifier.
 * @param orgDefaults - A validated org-level `PreferencesMap` (all channels present).
 * @param userRaw    - Raw unknown input from the user's stored preferences blob.
 *
 * TODO: Implement — no `any`, no casting.
 */
export function mergePreferences(
  userId: string,
  orgDefaults: PreferencesMap,
  userRaw: unknown
): ResolvedPreferences {
  // TODO
  throw new Error("Not implemented");
}

// ── 4. Convenience constant ───────────────────────────────────

/**
 * The platform's built-in org defaults, used when no org-level config exists.
 * Use the `satisfies` operator to ensure this literal matches `PreferencesMap`
 * without widening the inferred type.
 *
 * TODO: Replace `{}` with a valid `PreferencesMap` literal and add `satisfies`.
 */
export const PLATFORM_DEFAULTS = {} // TODO satisfies PreferencesMap;
