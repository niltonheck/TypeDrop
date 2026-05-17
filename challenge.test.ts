// challenge.test.ts
import {
  fetchAllIssues,
  parseIssue,
  parsePage,
  isIssueStatus,
  isIssuePriority,
  type Issue,
  type PageEnvelope,
  type PageFetcher,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────────────────────

const page1Issues: Issue[] = [
  { id: 1, title: "Login bug",       status: "open",        priority: "critical", assignee: "alice",  createdAt: "2026-01-01T00:00:00Z" },
  { id: 2, title: "Slow dashboard",  status: "in_progress", priority: "high",     assignee: "bob",    createdAt: "2026-01-02T00:00:00Z" },
  { id: 3, title: "Typo in footer",  status: "closed",      priority: "low",      assignee: null,     createdAt: "2026-01-03T00:00:00Z" },
];

const page2Issues: Issue[] = [
  { id: 4, title: "Memory leak",     status: "open",        priority: "critical", assignee: null,     createdAt: "2026-01-04T00:00:00Z" },
  { id: 5, title: "Add dark mode",   status: "open",        priority: "medium",   assignee: "carol",  createdAt: "2026-01-05T00:00:00Z" },
];

const mockFetcher: PageFetcher = async (page: number): Promise<unknown> => {
  if (page === 1) return { data: page1Issues, page: 1, totalPages: 3 } satisfies PageEnvelope<Issue>;
  if (page === 2) return { data: page2Issues, page: 2, totalPages: 3 } satisfies PageEnvelope<Issue>;
  if (page === 3) return { data: [{ id: "BAD", title: 99 }], page: 3, totalPages: 3 }; // invalid envelope
  return Promise.reject(new Error("unexpected page"));
};

// ── Test 1: isIssueStatus / isIssuePriority type guards ───────────────────────
console.assert(isIssueStatus("open")        === true,  "FAIL T1a: 'open' should be valid IssueStatus");
console.assert(isIssueStatus("deleted")     === false, "FAIL T1b: 'deleted' should not be valid IssueStatus");
console.assert(isIssuePriority("critical")  === true,  "FAIL T1c: 'critical' should be valid IssuePriority");
console.assert(isIssuePriority("urgent")    === false, "FAIL T1d: 'urgent' should not be valid IssuePriority");

// ── Test 2: parseIssue — valid issue ──────────────────────────────────────────
const validRaw = { id: 1, title: "Bug", status: "open", priority: "high", assignee: "alice", createdAt: "2026-01-01T00:00:00Z" };
const parsed = parseIssue(validRaw);
console.assert(parsed.ok === true, "FAIL T2: valid issue should parse successfully");

// ── Test 3: parseIssue — missing field ────────────────────────────────────────
const missingStatus = { id: 2, title: "Bug", status: "unknown_status", priority: "high", assignee: null, createdAt: "2026-01-01T00:00:00Z" };
const badParse = parseIssue(missingStatus);
console.assert(badParse.ok === false, "FAIL T3a: invalid status should fail");
if (!badParse.ok) {
  console.assert(badParse.error.kind === "validation", "FAIL T3b: error kind should be 'validation'");
  console.assert((badParse.error as Extract<typeof badParse.error, { kind: "validation" }>).field === "status", "FAIL T3c: offending field should be 'status'");
}

// ── Test 4 & 5: fetchAllIssues ────────────────────────────────────────────────
(async () => {
  const report = await fetchAllIssues(mockFetcher);

  // T4: correct total (pages 1 + 2 succeed = 5 issues; page 3 fails)
  console.assert(report.totalFetched === 5, `FAIL T4: expected totalFetched=5, got ${report.totalFetched}`);

  // T5: byStatus keys all present and correct counts
  console.assert(Array.isArray(report.byStatus.open),        "FAIL T5a: byStatus.open should be an array");
  console.assert(report.byStatus.open.length === 3,          `FAIL T5b: expected 3 open issues, got ${report.byStatus.open.length}`);
  console.assert(report.byStatus.closed.length === 1,        `FAIL T5c: expected 1 closed issue, got ${report.byStatus.closed.length}`);
  console.assert(report.byStatus.in_progress.length === 1,   `FAIL T5d: expected 1 in_progress issue`);

  // T6: unassignedCount
  console.assert(report.unassignedCount === 2, `FAIL T6: expected unassignedCount=2, got ${report.unassignedCount}`);

  // T7: failedPages — page 3 should appear
  console.assert(report.failedPages.length === 1,            `FAIL T7a: expected 1 failed page, got ${report.failedPages.length}`);
  console.assert(report.failedPages[0]?.page === 3,          `FAIL T7b: failed page should be page 3`);

  console.log("All tests passed ✅");
})();
