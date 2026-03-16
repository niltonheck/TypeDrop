// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts — Typed Notification Preference Engine
// ─────────────────────────────────────────────────────────────────────────────
// REQUIREMENTS
// 1. Define a discriminated-union  Result<T, E>  with Ok and Err variants.
// 2. Define the Channel union type and the per-channel option shapes using
//    a mapped type so adding a new channel only requires one change.
// 3. Implement `parsePreferences` — validates raw unknown input and returns
//    Result<UserPreferences, PreferenceError>.
// 4. Implement `mergeWithDefaults` — deep-merges validated user preferences
//    over system defaults; returns the fully-resolved ResolvedPreferences.
// 5. Implement `resolvePreferences` — composes steps 3 & 4; returns
//    Result<ResolvedPreferences, PreferenceError>.
// 6. Implement `describeResolved` — returns a human-readable summary string
//    for each channel using a template literal type for the key names.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Result type ────────────────────────────────────────────────────────────

// TODO: Define Result<T, E>, Ok<T>, and Err<E> — discriminated union on a
//       "kind" field ("ok" | "err"). Add helper constructors ok() and err().

export type Ok<T> = {
  // TODO
};

export type Err<E> = {
  // TODO
};

export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  // TODO
  throw new Error("Not implemented");
}

export function err<E>(error: E): Err<E> {
  // TODO
  throw new Error("Not implemented");
}

// ── 2. Channel types & per-channel options ────────────────────────────────────

// The platform supports exactly these three delivery channels.
export type Channel = "email" | "sms" | "push";

// Per-channel configuration shapes:
//   email → { enabled: boolean; frequency: "instant" | "daily" | "weekly" }
//   sms   → { enabled: boolean; quietHoursStart: number; quietHoursEnd: number }
//   push  → { enabled: boolean; badge: boolean; sound: boolean }
//
// TODO: Define ChannelOptionMap — an interface (or type alias) that maps each
//       Channel key to its specific options object.

export interface ChannelOptionMap {
  // TODO
}

// TODO: Define UserPreferences as a mapped type over Channel so that each key
//       is optional (users only send what they want to override).
//       Shape: { [C in Channel]?: ChannelOptionMap[C] }

export type UserPreferences = {
  // TODO
};

// TODO: Define ResolvedPreferences — same mapped structure but every channel
//       is REQUIRED (all defaults have been filled in).

export type ResolvedPreferences = {
  // TODO
};

// ── 3. Error types ────────────────────────────────────────────────────────────

// TODO: Define PreferenceError as a discriminated union with at least:
//   - { kind: "validation_error"; field: string; message: string }
//   - { kind: "unknown_channel"; channel: string }
//
// Feel free to add more variants if your implementation needs them.

export type PreferenceError =
  // TODO
  never;

// ── 4. System defaults ────────────────────────────────────────────────────────

// TODO: Define SYSTEM_DEFAULTS as a const satisfying ResolvedPreferences.
//       Use the `satisfies` keyword so the type is checked but the literal
//       type is preserved.
//
// Suggested defaults:
//   email → { enabled: true,  frequency: "daily" }
//   sms   → { enabled: false, quietHoursStart: 22, quietHoursEnd: 8 }
//   push  → { enabled: true,  badge: true, sound: false }

export const SYSTEM_DEFAULTS = {
  // TODO
} satisfies ResolvedPreferences;

// ── 5. Core functions ─────────────────────────────────────────────────────────

/**
 * Validates a raw unknown payload and returns typed UserPreferences.
 *
 * Rules:
 * - Top-level value must be a non-null object.
 * - Any key present must be one of the known Channel values; unknown keys
 *   should surface as a PreferenceError with kind "unknown_channel".
 * - For each channel present, validate the shape of its options object:
 *     email  → `enabled` (boolean) required; `frequency` must be one of the
 *              allowed string literals if present.
 *     sms    → `enabled` (boolean) required; `quietHoursStart` / `quietHoursEnd`
 *              must be numbers in [0, 23] if present.
 *     push   → `enabled` (boolean) required; `badge` and `sound` must be
 *              booleans if present.
 * - Return the first validation error encountered (fail-fast).
 */
export function parsePreferences(
  raw: unknown
): Result<UserPreferences, PreferenceError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Deep-merges user preferences over the system defaults.
 * Channel objects present in `prefs` fully replace the matching default
 * (no partial-field merging within a channel — treat each channel block
 * as an atomic unit).
 */
export function mergeWithDefaults(prefs: UserPreferences): ResolvedPreferences {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Composes parsePreferences → mergeWithDefaults.
 * Returns Result<ResolvedPreferences, PreferenceError>.
 */
export function resolvePreferences(
  raw: unknown
): Result<ResolvedPreferences, PreferenceError> {
  // TODO
  throw new Error("Not implemented");
}

// ── 6. Template literal summary ───────────────────────────────────────────────

// TODO: Define a template literal type `ChannelSummaryKey` that produces the
//       union:  "email_summary" | "sms_summary" | "push_summary"

export type ChannelSummaryKey = `${Channel}_summary`;

// TODO: Define ChannelSummaryMap as a mapped type over ChannelSummaryKey
//       where each value is a string.

export type ChannelSummaryMap = {
  // TODO
};

/**
 * Given a ResolvedPreferences object, returns a ChannelSummaryMap where each
 * value is a human-readable sentence describing that channel's settings.
 *
 * Example output for email:
 *   "email_summary": "Email is ENABLED with frequency=daily."
 *
 * Example output for sms:
 *   "sms_summary": "SMS is DISABLED. Quiet hours: 22:00–08:00."
 *
 * Example output for push:
 *   "push_summary": "Push is ENABLED. Badge: yes, Sound: no."
 */
export function describeResolved(
  resolved: ResolvedPreferences
): ChannelSummaryMap {
  // TODO
  throw new Error("Not implemented");
}
