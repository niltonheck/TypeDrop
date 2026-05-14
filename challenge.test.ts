// ============================================================
// challenge.test.ts
// ============================================================
import { validatePost, buildTagIndex } from "./challenge";
import type { TagIndexReport } from "./challenge";

// ── Mock data ────────────────────────────────────────────────

const validPosts: unknown[] = [
  {
    id: "post-1",
    title: "Getting Started with TypeScript",
    author: "Alice",
    publishedAt: "2026-01-10",
    tags: ["typescript", "beginners"],
    wordCount: 800,
  },
  {
    id: "post-2",
    title: "Advanced TypeScript Patterns",
    author: "Bob",
    publishedAt: "2026-02-20",
    tags: ["typescript", "advanced"],
    wordCount: 1500,
  },
  {
    id: "post-3",
    title: "Beginner's Guide to JavaScript",
    author: "Carol",
    publishedAt: "2026-03-05",
    tags: ["javascript", "beginners"],
    wordCount: 600,
  },
  {
    id: "post-4",
    title: "TypeScript for React Developers",
    author: "Dave",
    publishedAt: "2026-04-18",
    tags: ["typescript", "react", "advanced"],
    wordCount: 1200,
  },
];

const invalidPosts: unknown[] = [
  null,                                         // not an object
  { id: "", title: "No ID", author: "X", publishedAt: "2026-01-01", tags: ["a"], wordCount: 100 },    // empty id
  { id: "p5", title: "", author: "X", publishedAt: "2026-01-01", tags: ["a"], wordCount: 100 },       // empty title
  { id: "p6", title: "T", author: "X", publishedAt: "not-a-date", tags: ["a"], wordCount: 100 },     // bad date
  { id: "p7", title: "T", author: "X", publishedAt: "2026-01-01", tags: [], wordCount: 100 },        // empty tags array
  { id: "p8", title: "T", author: "X", publishedAt: "2026-01-01", tags: ["a"], wordCount: 0 },       // wordCount not positive
  { id: "p9", title: "T", author: "X", publishedAt: "2026-01-01", tags: ["a"], wordCount: 1.5 },     // wordCount not integer
];

// ── Test 1: validatePost rejects invalid entries ─────────────
for (const bad of invalidPosts) {
  const result = validatePost(bad);
  console.assert(
    result.ok === false,
    `[Test 1] Expected invalid entry to fail validation: ${JSON.stringify(bad)}`
  );
}
console.log("Test 1 passed: all invalid entries rejected ✓");

// ── Test 2: validatePost accepts valid entries ───────────────
for (const good of validPosts) {
  const result = validatePost(good);
  console.assert(
    result.ok === true,
    `[Test 2] Expected valid entry to pass validation: ${JSON.stringify(good)}`
  );
}
console.log("Test 2 passed: all valid entries accepted ✓");

// ── Test 3: buildTagIndex counts valid/invalid correctly ─────
const mixedInput: unknown[] = [...validPosts, ...invalidPosts];
const report: TagIndexReport = buildTagIndex(mixedInput);

console.assert(
  report.validPostCount === 4,
  `[Test 3] Expected validPostCount=4, got ${report.validPostCount}`
);
console.assert(
  report.invalidCount === 7,
  `[Test 3] Expected invalidCount=7, got ${report.invalidCount}`
);
console.log("Test 3 passed: valid/invalid counts correct ✓");

// ── Test 4: tag index structure is correct ───────────────────

// "typescript" appears in post-1 (800), post-2 (1500), post-4 (1200)
const ts = report.index["typescript"];
console.assert(ts !== undefined, "[Test 4] 'typescript' tag missing from index");
console.assert(ts.postCount === 3, `[Test 4] typescript postCount: expected 3, got ${ts.postCount}`);
console.assert(
  ts.avgWordCount === Math.round((800 + 1500 + 1200) / 3),
  `[Test 4] typescript avgWordCount wrong, got ${ts.avgWordCount}`
);
console.assert(
  ts.longestPost.id === "post-2",
  `[Test 4] typescript longestPost should be post-2, got ${ts.longestPost.id}`
);
console.assert(
  JSON.stringify(ts.postIds) === JSON.stringify(["post-1", "post-2", "post-4"]),
  `[Test 4] typescript postIds wrong: ${JSON.stringify(ts.postIds)}`
);
console.log("Test 4 passed: 'typescript' tag summary correct ✓");

// ── Test 5: avgWordCount and longestPost tie-break ───────────

// "advanced" appears in post-2 (1500) and post-4 (1200)
const adv = report.index["advanced"];
console.assert(adv !== undefined, "[Test 5] 'advanced' tag missing from index");
console.assert(
  adv.avgWordCount === Math.round((1500 + 1200) / 2),
  `[Test 5] advanced avgWordCount wrong, got ${adv.avgWordCount}`
);
console.assert(
  adv.longestPost.id === "post-2",
  `[Test 5] advanced longestPost should be post-2, got ${adv.longestPost.id}`
);

// "beginners" appears in post-1 (800) and post-3 (600)
const beg = report.index["beginners"];
console.assert(beg !== undefined, "[Test 5] 'beginners' tag missing from index");
console.assert(
  beg.longestPost.id === "post-1",
  `[Test 5] beginners longestPost should be post-1, got ${beg.longestPost.id}`
);
console.log("Test 5 passed: 'advanced' and 'beginners' summaries correct ✓");

console.log("\n✅ All tests passed!");
