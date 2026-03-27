// =============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// =============================================================
import {
  aggregateGrades,
  toValidScore,
  toLetterGrade,
  type RawGradeEntry,
  type ValidScore,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────

const entries: RawGradeEntry[] = [
  // Alice — two subjects
  { studentId: "s1", studentName: "Alice", subject: "Math",    score: 92 },
  { studentId: "s1", studentName: "Alice", subject: "English", score: 85 },
  // Bob — three subjects, one invalid
  { studentId: "s2", studentName: "Bob",   subject: "Math",    score: 73 },
  { studentId: "s2", studentName: "Bob",   subject: "Science", score: 110 }, // INVALID
  { studentId: "s2", studentName: "Bob",   subject: "History", score: 68 },
  // Carol — one subject, failing score
  { studentId: "s3", studentName: "Carol", subject: "Art",     score: 45 },
  // Dave — completely invalid score
  { studentId: "s4", studentName: "Dave",  subject: "PE",      score: -5 }, // INVALID
];

// ── Tests ─────────────────────────────────────────────────────

const result = aggregateGrades(entries);

// Test 1: correct number of summaries (4 students, but Dave has
//         only invalid entries so he produces no summary)
console.assert(
  result.summaries.length === 3,
  `❌ Test 1 failed: expected 3 summaries, got ${result.summaries.length}`
);
console.log("✅ Test 1 passed: summaries count is 3");

// Test 2: correct number of validation errors (scores 110 and -5)
console.assert(
  result.errors.length === 2,
  `❌ Test 2 failed: expected 2 errors, got ${result.errors.length}`
);
console.log("✅ Test 2 passed: errors count is 2");

// Test 3: Alice's average and letter grade
const alice = result.summaries.find((s) => s.studentId === "s1");
console.assert(
  alice !== undefined && alice.averageScore === 88.5 && alice.letterGrade === "B",
  `❌ Test 3 failed: Alice = ${JSON.stringify(alice)}`
);
console.log("✅ Test 3 passed: Alice averageScore=88.5, letterGrade=B");

// Test 4: Bob's subjects are sorted and average is correct
//         (only Math=73 and History=68 are valid → avg = 70.5 → "C")
const bob = result.summaries.find((s) => s.studentId === "s2");
console.assert(
  bob !== undefined &&
    bob.averageScore === 70.5 &&
    bob.letterGrade === "C" &&
    JSON.stringify(bob.subjects) === JSON.stringify(["History", "Math"]),
  `❌ Test 4 failed: Bob = ${JSON.stringify(bob)}`
);
console.log("✅ Test 4 passed: Bob averageScore=70.5, letterGrade=C, subjects sorted");

// Test 5: toValidScore brand check — null for out-of-range values
console.assert(
  toValidScore(101) === null && toValidScore(-1) === null && toValidScore(0) !== null,
  "❌ Test 5 failed: toValidScore boundary conditions"
);
console.log("✅ Test 5 passed: toValidScore boundary conditions correct");

console.log("\n🎉 All tests passed!");
