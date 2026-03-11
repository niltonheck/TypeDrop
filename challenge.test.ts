// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts
// ─────────────────────────────────────────────────────────────────────────────
import {
  ok, err,
  makeParseError, makeFetchError,
  parsePage, fetchAllPages,
  mapResult, chainResult,
  type Result, type Page, type ParseError, type FetchError,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Minimal item validator: expects { id: number, name: string } */
function parseUser(raw: unknown): Result<{ id: number; name: string }, ParseError> {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "id" in raw &&
    "name" in raw &&
    typeof (raw as Record<string, unknown>).id === "number" &&
    typeof (raw as Record<string, unknown>).name === "string"
  ) {
    const r = raw as Record<string, unknown>;
    return ok({ id: r.id as number, name: r.name as string });
  }
  return err(makeParseError("Invalid user shape"));
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const rawPage1 = { page: 1, nextPage: 2, items: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }] };
const rawPage2 = { page: 2, items: [{ id: 3, name: "Carol" }] }; // no nextPage → last page
const badPage  = { page: "oops", items: [] };                     // invalid page field
const badItems = { page: 1, items: [{ id: "x", name: 42 }] };    // invalid items

// ── Test 1: parsePage — valid single page ─────────────────────────────────────
{
  const result = parsePage(rawPage1, parseUser);
  console.assert(result.ok === true, "Test 1a: parsePage should succeed on valid data");
  if (result.ok) {
    console.assert(result.value.items.length === 2, "Test 1b: should have 2 items");
    console.assert(result.value.nextPage === 2,     "Test 1c: nextPage should be 2");
    console.assert(result.value.items[0].name === "Alice", "Test 1d: first item should be Alice");
  }
}

// ── Test 2: parsePage — invalid page field ────────────────────────────────────
{
  const result = parsePage(badPage, parseUser);
  console.assert(result.ok === false, "Test 2a: parsePage should fail on bad page field");
  if (!result.ok) {
    console.assert(typeof result.error.message === "string", "Test 2b: error should have a message");
  }
}

// ── Test 3: parsePage — invalid items ─────────────────────────────────────────
{
  const result = parsePage(badItems, parseUser);
  console.assert(result.ok === false, "Test 3: parsePage should fail when an item is invalid");
}

// ── Test 4: fetchAllPages — collects all items across pages ───────────────────
{
  const pages: Record<number, unknown> = { 1: rawPage1, 2: rawPage2 };
  async function fakeFetcher(page: number): Promise<unknown> {
    return pages[page];
  }

  fetchAllPages(fakeFetcher, parseUser).then((result) => {
    console.assert(result.ok === true, "Test 4a: fetchAllPages should succeed");
    if (result.ok) {
      console.assert(result.value.length === 3, "Test 4b: should collect 3 items total");
      console.assert(result.value[2].name === "Carol", "Test 4c: last item should be Carol");
    }
  });
}

// ── Test 5: fetchAllPages — handles fetch exception ───────────────────────────
{
  async function throwingFetcher(_page: number): Promise<unknown> {
    throw new Error("Network failure");
  }

  fetchAllPages(throwingFetcher, parseUser).then((result) => {
    console.assert(result.ok === false, "Test 5a: fetchAllPages should fail on throw");
    if (!result.ok) {
      console.assert(typeof result.error.message === "string", "Test 5b: FetchError should have message");
    }
  });
}

// ── Test 6: mapResult & chainResult ──────────────────────────────────────────
{
  const r1: Result<number, ParseError> = ok(21);
  const doubled = mapResult(r1, (n) => n * 2);
  console.assert(doubled.ok === true && doubled.ok && doubled.value === 42, "Test 6a: mapResult should double the value");

  const chained = chainResult(r1, (n) =>
    n > 0 ? ok(`positive:${n}`) : err(makeParseError("not positive"))
  );
  console.assert(chained.ok === true && chained.ok && chained.value === "positive:21", "Test 6b: chainResult should flat-map ok");

  const errResult: Result<number, ParseError> = err(makeParseError("bad"));
  const mappedErr = mapResult(errResult, (n) => n * 2);
  console.assert(mappedErr.ok === false, "Test 6c: mapResult should pass through err untouched");
}

console.log("All sync tests executed. Check async test output above.");
