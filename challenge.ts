// ============================================================
// Typed Playlist Builder: Track Filtering, Sorting & Duration Rollup
// challenge.ts
// ============================================================
// Rules:
//   • No `any`, no `as` type assertions, no `@ts-ignore`
//   • strict: true must pass
//   • Complete every TODO — do not change existing type signatures
// ============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES  (do not modify)
// ------------------------------------------------------------------

export type Genre = "pop" | "rock" | "jazz" | "electronic" | "classical" | "hip-hop";

export type MoodTag = "energetic" | "chill" | "melancholic" | "upbeat" | "focus";

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: Genre;
  mood: MoodTag;
  /** Duration in whole seconds */
  durationSeconds: number;
  /** Release year, e.g. 2023 */
  releaseYear: number;
  explicit: boolean;
}

// ------------------------------------------------------------------
// 2. PLAYLIST TYPES
// ------------------------------------------------------------------

export interface Playlist {
  name: string;
  tracks: Track[];
}

/**
 * Supported sort keys for playlist tracks.
 * TODO: Define `SortKey` as a union of the exact string literals:
 *       "title" | "artist" | "durationSeconds" | "releaseYear"
 */
export type SortKey = /* TODO */ never;

export type SortOrder = "asc" | "desc";

export interface SortOptions {
  key: SortKey;
  order: SortOrder;
}

// ------------------------------------------------------------------
// 3. FILTER CRITERIA
// ------------------------------------------------------------------

/**
 * All fields are optional — only the provided fields are used as filters.
 * TODO: Define `FilterCriteria` so that:
 *   - `genres`   filters to tracks whose genre is in the given array
 *   - `moods`    filters to tracks whose mood is in the given array
 *   - `maxDurationSeconds` keeps tracks whose durationSeconds <= this value
 *   - `explicitAllowed`    when false, removes explicit tracks; when true or omitted, keeps all
 *   - `releasedAfter`      keeps tracks whose releaseYear is strictly greater than this value
 */
export interface FilterCriteria {
  // TODO: add the five optional fields described above
}

// ------------------------------------------------------------------
// 4. DURATION SUMMARY
// ------------------------------------------------------------------

/**
 * A rolled-up summary of durations for a playlist.
 * TODO: Define `DurationSummary` with:
 *   - `totalSeconds`   — sum of all track durations
 *   - `averageSeconds` — mean duration (0 if playlist is empty), rounded to nearest integer
 *   - `longestTrack`   — the Track with the highest durationSeconds, or null if empty
 *   - `shortestTrack`  — the Track with the lowest durationSeconds, or null if empty
 *   - `formatted`      — total duration as "HH:MM:SS" string
 */
export interface DurationSummary {
  // TODO: add the five fields described above
}

// ------------------------------------------------------------------
// 5. FUNCTIONS TO IMPLEMENT
// ------------------------------------------------------------------

/**
 * createPlaylist
 * TODO: Given a `name` string and an initial array of `Track` objects,
 *       return a `Playlist` with those tracks (in the same order).
 */
export function createPlaylist(name: string, tracks: Track[]): Playlist {
  // TODO
  throw new Error("Not implemented");
}

/**
 * filterTracks
 * TODO: Return a NEW array of tracks from `playlist.tracks` that satisfy
 *       ALL of the provided `criteria`. Fields not present in `criteria`
 *       must not filter anything out.
 *
 * Requirements (numbered for the test harness):
 *   R1 – genres:              track.genre must be included in criteria.genres
 *   R2 – moods:               track.mood must be included in criteria.moods
 *   R3 – maxDurationSeconds:  track.durationSeconds must be <= criteria.maxDurationSeconds
 *   R4 – explicitAllowed:     when criteria.explicitAllowed === false, exclude explicit tracks
 *   R5 – releasedAfter:       track.releaseYear must be > criteria.releasedAfter
 *
 * The original playlist must NOT be mutated.
 */
export function filterTracks(playlist: Playlist, criteria: FilterCriteria): Track[] {
  // TODO
  throw new Error("Not implemented");
}

/**
 * sortTracks
 * TODO: Return a NEW array of tracks sorted by `options.key` in `options.order`.
 *       - "asc"  → ascending  (A→Z, low→high)
 *       - "desc" → descending (Z→A, high→low)
 *       - Ties may be left in their original relative order (stable sort).
 *
 * The original playlist must NOT be mutated.
 */
export function sortTracks(playlist: Playlist, options: SortOptions): Track[] {
  // TODO
  throw new Error("Not implemented");
}

/**
 * computeDurationSummary
 * TODO: Compute and return a `DurationSummary` for the given tracks array.
 *
 * Formatting rule for `formatted`:
 *   - Hours are zero-padded to at least 2 digits  → "02:05:09"
 *   - Minutes and seconds are always 2 digits      → "00:03:07"
 *   - Example: 7389 seconds → "02:03:09"
 */
export function computeDurationSummary(tracks: Track[]): DurationSummary {
  // TODO
  throw new Error("Not implemented");
}

/**
 * addTrack
 * TODO: Return a NEW Playlist with `track` appended to the END of the tracks list.
 *       Do NOT mutate the original playlist.
 */
export function addTrack(playlist: Playlist, track: Track): Playlist {
  // TODO
  throw new Error("Not implemented");
}

/**
 * removeTrack
 * TODO: Return a NEW Playlist with the track matching `trackId` removed.
 *       If no track with that id exists, return a copy of the playlist unchanged.
 *       Do NOT mutate the original playlist.
 */
export function removeTrack(playlist: Playlist, trackId: string): Playlist {
  // TODO
  throw new Error("Not implemented");
}
