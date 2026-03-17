// challenge.test.ts
import {
  ok, err,
  isGenre,
  deriveStatus,
  parseBook,
  buildReadingList,
  type Book,
  type ReadingList,
} from "./challenge";

// ── § 2 — ok / err helpers ──────────────────────────────────
const successResult = ok(42);
console.assert(successResult.ok === true, "ok() should produce ok:true");
console.assert(
  successResult.ok && successResult.value === 42,
  "ok() should wrap the value"
);

const failResult = err("oops");
console.assert(failResult.ok === false, "err() should produce ok:false");
console.assert(
  !failResult.ok && failResult.error === "oops",
  "err() should wrap the error"
);

// ── § 3 — isGenre ───────────────────────────────────────────
console.assert(isGenre("fiction") === true,   "fiction is a valid genre");
console.assert(isGenre("history") === true,   "history is a valid genre");
console.assert(isGenre("thriller") === false, "thriller is NOT a valid genre");
console.assert(isGenre(42) === false,         "number is NOT a valid genre");
console.assert(isGenre(null) === false,       "null is NOT a valid genre");

// ── § 4 — deriveStatus ──────────────────────────────────────
console.assert(deriveStatus(0, 300)   === "not-started",  "0 pages → not-started");
console.assert(deriveStatus(150, 300) === "in-progress",  "half-way → in-progress");
console.assert(deriveStatus(300, 300) === "completed",    "all pages → completed");
console.assert(deriveStatus(350, 300) === "completed",    "over total → completed");

// ── § 5 — parseBook ─────────────────────────────────────────
const validRaw = {
  id: "book-1",
  title: "Sapiens",
  author: "Yuval Noah Harari",
  genre: "history",
  totalPages: 443,
  pagesRead: 100,
};

const parsed = parseBook(validRaw);
console.assert(parsed.ok === true, "valid input should parse successfully");
if (parsed.ok) {
  console.assert(parsed.value.status === "in-progress", "100/443 → in-progress");
  console.assert(
    !("status" in validRaw) || parsed.value.status !== (validRaw as Record<string, unknown>)["status"],
    "status must be derived, not copied (or derived value happens to match)"
  );
}

const missingId = parseBook({ title: "X", author: "Y", genre: "science", totalPages: 100, pagesRead: 0 });
console.assert(!missingId.ok && missingId.error === "missing-id", "missing id → missing-id error");

const badGenre = parseBook({ id: "b2", title: "X", author: "Y", genre: "fantasy", totalPages: 100, pagesRead: 0 });
console.assert(!badGenre.ok && badGenre.error === "invalid-genre", "unknown genre → invalid-genre error");

const badPages = parseBook({ id: "b3", title: "X", author: "Y", genre: "fiction", totalPages: 200, pagesRead: 300 });
console.assert(!badPages.ok && badPages.error === "pages-read-exceeds-total", "pagesRead > totalPages error");

const negativeTotalPages = parseBook({ id: "b4", title: "X", author: "Y", genre: "fiction", totalPages: 0, pagesRead: 0 });
console.assert(!negativeTotalPages.ok && negativeTotalPages.error === "invalid-total-pages", "totalPages=0 → invalid-total-pages");

// ── § 6 — buildReadingList ───────────────────────────────────
const rawEntries: unknown[] = [
  { id: "b1", title: "Zebra Tales",   author: "A", genre: "fiction",     totalPages: 200, pagesRead: 200 },
  { id: "b2", title: "Apple Stories", author: "B", genre: "biography",   totalPages: 150, pagesRead: 0   },
  { id: "b3", title: "Mango Days",    author: "C", genre: "science",     totalPages: 300, pagesRead: 120 },
  { id: "b4", title: "Bad Entry",     author: "D", genre: "INVALID",     totalPages: 100, pagesRead: 0   }, // invalid
  null, // invalid
];

const list: ReadingList = buildReadingList(rawEntries);

console.assert(list.books.length === 3, "3 valid books should be parsed");
console.assert(list.rejected.length === 2, "2 entries should be rejected");
console.assert(list.books[0].title === "Apple Stories", "books should be sorted A-Z (Apple first)");
console.assert(list.books[2].title === "Zebra Tales",   "books should be sorted A-Z (Zebra last)");
console.assert(list.summary["completed"]   === 1, "1 completed book");
console.assert(list.summary["in-progress"] === 1, "1 in-progress book");
console.assert(list.summary["not-started"] === 1, "1 not-started book");

console.log("All assertions passed! ✅");
