// challenge.test.ts
import {
  makeCursor,
  makeEndpointPath,
  withConcurrencyLimit,
  fetchAllPages,
  aggregateBy,
  handleAccumulatedResult,
} from "./challenge";
import type {
  PageFetcher,
  PageResponse,
  FetchResult,
  AccumulatedResult,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// ── Mock data ─────────────────────────────────────────────────────────────────

type EventRow = { id: number; eventType: string; userId: string };

// Simulates a 3-page dataset.  Page 0 → cursor "c1", page 1 → cursor "c2", page 2 → last.
const PAGES: PageResponse<EventRow>[] = [
  {
    items: [
      { id: 1, eventType: "click", userId: "u1" },
      { id: 2, eventType: "view",  userId: "u2" },
    ],
    nextCursor: makeCursor("c1"),
    pageIndex: 0,
  },
  {
    items: [
      { id: 3, eventType: "click", userId: "u1" },
      { id: 4, eventType: "purchase", userId: "u3" },
    ],
    nextCursor: makeCursor("c2"),
    pageIndex: 1,
  },
  {
    items: [
      { id: 5, eventType: "view", userId: "u2" },
    ],
    nextCursor: undefined,
    pageIndex: 2,
  },
];

// ── Mock fetcher (happy path) ─────────────────────────────────────────────────

const happyFetcher: PageFetcher<EventRow> = async (req) => {
  const page =
    req.cursor === undefined
      ? PAGES[0]
      : req.cursor === makeCursor("c1")
      ? PAGES[1]
      : PAGES[2];

  const result: FetchResult<PageResponse<EventRow>> = { ok: true, data: page! };
  return result;
};

// ── Mock fetcher (page 1 fails) ───────────────────────────────────────────────

const partialFetcher: PageFetcher<EventRow> = async (req) => {
  if (req.cursor === makeCursor("c1")) {
    const result: FetchResult<PageResponse<EventRow>> = {
      ok: false,
      error: { pageIndex: 1, cursor: req.cursor, reason: "timeout" },
    };
    return result;
  }
  return happyFetcher(req);
};

// ── Test 1: withConcurrencyLimit respects the limit and preserves order ───────

async function testConcurrencyLimit(): Promise<void> {
  const order: number[] = [];
  const tasks = [0, 1, 2, 3, 4].map(
    (i) => () =>
      new Promise<number>((resolve) =>
        setTimeout(() => {
          order.push(i);
          resolve(i * 2);
        }, (4 - i) * 10) // later tasks resolve faster
      )
  );

  const results = await withConcurrencyLimit(tasks, 2);

  // Results must be in original index order regardless of resolution order.
  assert(
    JSON.stringify(results) === JSON.stringify([0, 2, 4, 6, 8]),
    "withConcurrencyLimit: results are in original order"
  );
  assert(results.length === 5, "withConcurrencyLimit: all tasks completed");
}

// ── Test 2: fetchAllPages happy path ─────────────────────────────────────────

async function testFetchAllHappy(): Promise<void> {
  const endpoint = makeEndpointPath("/events");
  const result = await fetchAllPages<EventRow>(endpoint, happyFetcher, {
    concurrency: 2,
    pageSize: 2,
  });

  assert(result.ok === true, "fetchAllPages happy: ok is true");
  assert(result.items.length === 5, "fetchAllPages happy: all 5 items collected");
  assert(result.pagesFetched === 3, "fetchAllPages happy: 3 pages fetched");
  assert(result.errors.length === 0, "fetchAllPages happy: no errors");
  // Items should be in ascending page-index order
  assert(
    result.items[0].id === 1 && result.items[4].id === 5,
    "fetchAllPages happy: items in page order"
  );
}

// ── Test 3: fetchAllPages partial failure ─────────────────────────────────────

async function testFetchAllPartial(): Promise<void> {
  const endpoint = makeEndpointPath("/events");
  const result = await fetchAllPages<EventRow>(endpoint, partialFetcher, {
    concurrency: 2,
  });

  // Page 0 (items 1,2) succeeds; page 1 fails; page 2 can't be reached because
  // cursor "c2" was only available from page 1. So we get 2 items + 1 error.
  assert(result.ok === false, "fetchAllPages partial: ok is false");
  assert(result.errors.length === 1, "fetchAllPages partial: 1 error recorded");
  assert(result.errors[0].reason === "timeout", "fetchAllPages partial: error reason preserved");
}

// ── Test 4: aggregateBy groups correctly ─────────────────────────────────────

async function testAggregateBy(): Promise<void> {
  const endpoint = makeEndpointPath("/events");
  const result = await fetchAllPages<EventRow>(endpoint, happyFetcher);

  const byType = aggregateBy(result, (row) => row.eventType);

  assert(byType.get("click")?.length === 2, "aggregateBy: 2 click events");
  assert(byType.get("view")?.length === 2, "aggregateBy: 2 view events");
  assert(byType.get("purchase")?.length === 1, "aggregateBy: 1 purchase event");
}

// ── Test 5: handleAccumulatedResult dispatches correctly ──────────────────────

async function testHandleResult(): Promise<void> {
  const endpoint = makeEndpointPath("/events");
  const happy = await fetchAllPages<EventRow>(endpoint, happyFetcher);
  const partial = await fetchAllPages<EventRow>(endpoint, partialFetcher);

  const happyMsg = handleAccumulatedResult(happy, {
    onSuccess: (items, pages) => `ok:${items.length}:${pages}`,
    onPartial: () => "partial",
  });
  assert(happyMsg === "ok:5:3", "handleAccumulatedResult: onSuccess called with correct args");

  const partialMsg = handleAccumulatedResult(partial, {
    onSuccess: () => "success",
    onPartial: (items, errors) => `partial:${items.length}:${errors.length}`,
  });
  assert(
    partialMsg.startsWith("partial:"),
    "handleAccumulatedResult: onPartial called for partial result"
  );
}

// ── Run all tests ─────────────────────────────────────────────────────────────

(async () => {
  await testConcurrencyLimit();
  await testFetchAllHappy();
  await testFetchAllPartial();
  await testAggregateBy();
  await testHandleResult();
})();
