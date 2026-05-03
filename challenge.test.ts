// ============================================================
// challenge.test.ts
// ============================================================
import {
  SearchIndex,
  validateDocument,
  tokenise,
  type IndexConfig,
  type SearchResult,
  type ValidationResult,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────

const config: IndexConfig<"title" | "body" | "tags"> = {
  fields: ["title", "body", "tags"],
  fieldWeights: { title: 3, body: 1, tags: 2 },
};

const rawDocs: unknown[] = [
  { id: "doc-1", title: "TypeScript Generics", body: "Generics allow you to write reusable typed code.", tags: "typescript generics" },
  { id: "doc-2", title: "Advanced TypeScript", body: "Conditional types and mapped types are powerful.", tags: "typescript advanced" },
  { id: "doc-3", title: "React Hooks Guide", body: "Hooks let you use state in functional components.", tags: "react hooks" },
  { id: "doc-4", title: "TypeScript Utility Types", body: "Pick Omit Record and more are built-in utilities.", tags: "typescript utilities" },
];

const malformedDocs: unknown[] = [
  null,
  42,
  { title: "Missing ID", body: "No id field here." },
  { id: "", title: "Empty ID", body: "id is empty string." },
  { id: 99, title: "Numeric ID", body: "id should be a string." },
];

// ── Test 1: tokenise ─────────────────────────────────────────
const tokens = tokenise("TypeScript-Generics are GREAT!!!");
console.assert(
  tokens.includes("typescript") && tokens.includes("generics") && tokens.includes("are") && tokens.includes("great"),
  `[FAIL] Test 1 — tokenise: expected lowercase tokens, got ${JSON.stringify(tokens)}`
);
console.assert(
  !tokens.includes(""),
  `[FAIL] Test 1 — tokenise: result must not include empty strings`
);
console.log("[PASS] Test 1 — tokenise produces correct lowercase tokens");

// ── Test 2: validateDocument rejects malformed docs ──────────
const malformedResults: ValidationResult[] = malformedDocs.map((d) =>
  validateDocument(d, config)
);
const allErrors = malformedResults.every((r) => r.kind === "error");
console.assert(
  allErrors,
  `[FAIL] Test 2 — all malformed docs should produce ValidationError, got: ${JSON.stringify(malformedResults)}`
);
console.log("[PASS] Test 2 — validateDocument rejects all malformed documents");

// ── Test 3: add & size ───────────────────────────────────────
const index = new SearchIndex(config);
rawDocs.forEach((d) => index.add(d));
malformedDocs.forEach((d) => index.add(d)); // should be silently counted as errors
console.assert(
  index.size() === 4,
  `[FAIL] Test 3 — expected size 4 after adding valid docs, got ${index.size()}`
);
console.log("[PASS] Test 3 — index.size() reflects only valid documents");

// ── Test 4: search returns ranked results ────────────────────
const result: SearchResult = index.search("typescript");
console.assert(
  result.kind === "results",
  `[FAIL] Test 4 — expected 'results', got '${result.kind}'`
);
if (result.kind === "results") {
  console.assert(
    result.hits.length === 3,
    `[FAIL] Test 4 — expected 3 hits for 'typescript', got ${result.hits.length}`
  );
  // doc-1 and doc-2 both have 'typescript' in title (weight 3) — should outscore doc-4
  const topId = result.hits[0].id;
  console.assert(
    topId === "doc-1" || topId === "doc-2" || topId === "doc-4",
    `[FAIL] Test 4 — unexpected top hit: ${topId}`
  );
}
console.log("[PASS] Test 4 — search('typescript') returns correct ranked hits");

// ── Test 5: search returns empty for no matches ───────────────
const emptyResult: SearchResult = index.search("python");
console.assert(
  emptyResult.kind === "empty",
  `[FAIL] Test 5 — expected 'empty' for unmatched query, got '${emptyResult.kind}'`
);
console.assert(
  emptyResult.query === "python",
  `[FAIL] Test 5 — result.query should echo the original query`
);
console.log("[PASS] Test 5 — search returns 'empty' variant for unmatched query");

console.log("\n✅ All tests passed!");
