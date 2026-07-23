// ============================================================
// challenge.test.ts  –  run with: npx ts-node challenge.test.ts
// ============================================================
import { groupBy, aggregateGroups, groupAndAggregate, topN } from "./challenge";

// ── Mock data ─────────────────────────────────────────────────

type Transaction = {
  id: string;
  region: string;
  category: "electronics" | "clothing" | "food";
  amount: number;
};

const transactions: Transaction[] = [
  { id: "t1", region: "north", category: "electronics", amount: 120 },
  { id: "t2", region: "south", category: "food",        amount: 30  },
  { id: "t3", region: "north", category: "clothing",    amount: 75  },
  { id: "t4", region: "south", category: "electronics", amount: 200 },
  { id: "t5", region: "north", category: "electronics", amount: 90  },
  { id: "t6", region: "east",  category: "food",        amount: 45  },
];

// ── Test 1: groupBy produces correct bucket sizes ─────────────
const byRegion = groupBy(transactions, (t) => t.region);

console.assert(byRegion.get("north")?.length === 3,
  "FAIL Test 1a: 'north' should have 3 transactions");
console.assert(byRegion.get("south")?.length === 2,
  "FAIL Test 1b: 'south' should have 2 transactions");
console.assert(byRegion.get("east")?.length === 1,
  "FAIL Test 1c: 'east' should have 1 transaction");
console.assert(!byRegion.has("west"),
  "FAIL Test 1d: 'west' key should not exist");

// ── Test 2: aggregateGroups computes correct summaries ────────
type RegionSummary = { total: number; count: number };

const regionSummaries = aggregateGroups<string, Transaction, RegionSummary>(
  byRegion,
  (items) => ({
    total: items.reduce((acc, t) => acc + t.amount, 0),
    count: items.length,
  })
);

const northSummary = regionSummaries.find((s) => s.key === "north");
console.assert(northSummary?.summary.total === 285,
  `FAIL Test 2a: north total should be 285, got ${northSummary?.summary.total}`);
console.assert(northSummary?.summary.count === 3,
  `FAIL Test 2b: north count should be 3, got ${northSummary?.summary.count}`);

// ── Test 3: groupAndAggregate (pipeline) matches manual steps ─
const categoryPipeline = groupAndAggregate(
  transactions,
  (t) => t.category,
  (items) => ({ avg: items.reduce((a, t) => a + t.amount, 0) / items.length })
);

const electronicsSummary = categoryPipeline.find((s) => s.key === "electronics");
// electronics: 120 + 200 + 90 = 410, avg = 136.666...
console.assert(
  electronicsSummary !== undefined &&
  Math.abs(electronicsSummary.summary.avg - 410 / 3) < 0.001,
  `FAIL Test 3: electronics avg should be ~136.67, got ${electronicsSummary?.summary.avg}`
);

// ── Test 4: topN returns the right leaders ────────────────────
const top2 = topN(regionSummaries, (s) => s.total, 2);

console.assert(top2.length === 2,
  `FAIL Test 4a: topN should return 2 entries, got ${top2.length}`);
console.assert(top2[0].key === "south" || top2[0].key === "north",
  "FAIL Test 4b: top entry should be 'south' (230) or 'north' (285)");
console.assert(top2[0].summary.total >= top2[1].summary.total,
  "FAIL Test 4c: results should be sorted descending by total");

// ── Test 5: topN with n > length returns all entries ──────────
const topAll = topN(regionSummaries, (s) => s.total, 999);
console.assert(topAll.length === regionSummaries.length,
  `FAIL Test 5: topN(999) should return all ${regionSummaries.length} entries`);

console.log("All assertions passed! ✅");
