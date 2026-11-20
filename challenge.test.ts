// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  createPlaylist,
  filterTracks,
  sortTracks,
  computeDurationSummary,
  addTrack,
  removeTrack,
  type Track,
  type Playlist,
  type FilterCriteria,
} from "./challenge";

// ------------------------------------------------------------------
// Mock catalogue
// ------------------------------------------------------------------
const t1: Track = {
  id: "t1", title: "Aurora", artist: "Björk",
  genre: "electronic", mood: "melancholic",
  durationSeconds: 243, releaseYear: 2001, explicit: false,
};
const t2: Track = {
  id: "t2", title: "Blinding Lights", artist: "The Weeknd",
  genre: "pop", mood: "energetic",
  durationSeconds: 200, releaseYear: 2019, explicit: false,
};
const t3: Track = {
  id: "t3", title: "HUMBLE.", artist: "Kendrick Lamar",
  genre: "hip-hop", mood: "energetic",
  durationSeconds: 177, releaseYear: 2017, explicit: true,
};
const t4: Track = {
  id: "t4", title: "Clair de Lune", artist: "Debussy",
  genre: "classical", mood: "chill",
  durationSeconds: 330, releaseYear: 1905, explicit: false,
};
const t5: Track = {
  id: "t5", title: "Midnight City", artist: "M83",
  genre: "electronic", mood: "upbeat",
  durationSeconds: 243, releaseYear: 2011, explicit: false,
};

const basePlaylist: Playlist = createPlaylist("Test Playlist", [t1, t2, t3, t4, t5]);

// ------------------------------------------------------------------
// Test 1 — createPlaylist returns correct shape
// ------------------------------------------------------------------
console.assert(basePlaylist.name === "Test Playlist", "T1a: name");
console.assert(basePlaylist.tracks.length === 5,       "T1b: track count");
console.assert(basePlaylist.tracks[0].id === "t1",     "T1c: first track id");

// ------------------------------------------------------------------
// Test 2 — filterTracks: genre + explicitAllowed (R1, R4)
// ------------------------------------------------------------------
const electronicClean = filterTracks(basePlaylist, {
  genres: ["electronic"],
  explicitAllowed: false,
} satisfies FilterCriteria);

console.assert(electronicClean.length === 2,                    "T2a: two electronic tracks");
console.assert(electronicClean.every(t => t.genre === "electronic"), "T2b: all electronic");
console.assert(electronicClean.every(t => !t.explicit),         "T2c: none explicit");

// ------------------------------------------------------------------
// Test 3 — filterTracks: maxDurationSeconds + releasedAfter (R3, R5)
// ------------------------------------------------------------------
const shortRecent = filterTracks(basePlaylist, {
  maxDurationSeconds: 210,
  releasedAfter: 2010,
} satisfies FilterCriteria);

// t2 (200s, 2019) ✓ — t3 (177s, 2017) ✓ — t5 (243s) ✗ — t1 (2001) ✗ — t4 (1905) ✗
console.assert(shortRecent.length === 2, "T3a: two short-recent tracks");
console.assert(shortRecent.every(t => t.durationSeconds <= 210),  "T3b: all short");
console.assert(shortRecent.every(t => t.releaseYear > 2010),      "T3c: all recent");

// ------------------------------------------------------------------
// Test 4 — sortTracks by durationSeconds asc
// ------------------------------------------------------------------
const byDurAsc = sortTracks(basePlaylist, { key: "durationSeconds", order: "asc" });
console.assert(byDurAsc[0].id === "t3", "T4a: shortest first (t3 = 177s)");
console.assert(byDurAsc[byDurAsc.length - 1].id === "t4", "T4b: longest last (t4 = 330s)");
// original playlist must not be mutated
console.assert(basePlaylist.tracks[0].id === "t1", "T4c: original order preserved");

// ------------------------------------------------------------------
// Test 5 — computeDurationSummary
// ------------------------------------------------------------------
const summary = computeDurationSummary([t1, t2, t3, t4, t5]);
// total = 243+200+177+330+243 = 1193 s
console.assert(summary.totalSeconds === 1193,           "T5a: totalSeconds");
console.assert(summary.averageSeconds === Math.round(1193 / 5), "T5b: averageSeconds");
console.assert(summary.longestTrack?.id === "t4",       "T5c: longestTrack");
console.assert(summary.shortestTrack?.id === "t3",      "T5d: shortestTrack");
// 1193s = 0h 19m 53s → "00:19:53"
console.assert(summary.formatted === "00:19:53",        "T5e: formatted");

// ------------------------------------------------------------------
// Test 6 — addTrack & removeTrack immutability
// ------------------------------------------------------------------
const newTrack: Track = {
  id: "t6", title: "Redbone", artist: "Childish Gambino",
  genre: "pop", mood: "chill",
  durationSeconds: 326, releaseYear: 2016, explicit: false,
};
const withNew    = addTrack(basePlaylist, newTrack);
const withoutT2  = removeTrack(basePlaylist, "t2");
const noChange   = removeTrack(basePlaylist, "t99");

console.assert(withNew.tracks.length === 6,          "T6a: addTrack appends");
console.assert(withNew.tracks[5].id === "t6",        "T6b: addTrack last position");
console.assert(basePlaylist.tracks.length === 5,     "T6c: original unchanged after add");
console.assert(withoutT2.tracks.length === 4,        "T6d: removeTrack removes");
console.assert(withoutT2.tracks.every(t => t.id !== "t2"), "T6e: t2 gone");
console.assert(noChange.tracks.length === 5,         "T6f: missing id is a no-op");

console.log("All assertions passed ✅");
