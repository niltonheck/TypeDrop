// challenge.test.ts
import {
  dispatch,
  groupReceiptsByChannel,
  assertNever,
  type Notification,
  type Channel,
  type ChannelTag,
  type DeliveryReceipt,
} from "./challenge";

// ── Mock notifications ───────────────────────────────────────────────
const taskNotif = {
  kind: "task_assigned" as const,
  payload: { taskId: "T-001", assigneeId: "U-42" },
} satisfies Notification;

const commentNotif = {
  kind: "comment_added" as const,
  payload: { taskId: "T-002", commentId: "C-7", preview: "Looks good!" },
} satisfies Notification;

const deadlineNotif = {
  kind: "deadline_approaching" as const,
  payload: { taskId: "T-003", hoursLeft: 3 },
} satisfies Notification;

// ── Test 1: dispatch returns correct notificationKind ────────────────
const receipt1 = dispatch(taskNotif, "email");
console.assert(
  receipt1.notificationKind === "task_assigned",
  `❌ Test 1 FAILED: expected notificationKind "task_assigned", got "${receipt1.notificationKind}"`
);
console.log("✅ Test 1 passed: notificationKind is correct");

// ── Test 2: dispatch builds correct channelTag ───────────────────────
const receipt2 = dispatch(commentNotif, "sms");
console.assert(
  receipt2.channelTag === "channel:sms",
  `❌ Test 2 FAILED: expected channelTag "channel:sms", got "${receipt2.channelTag}"`
);
console.log("✅ Test 2 passed: channelTag is correct");

// ── Test 3: dispatch sets success=true and a recent sentAt ───────────
const before = Date.now();
const receipt3 = dispatch(deadlineNotif, "push");
const after = Date.now();
console.assert(
  receipt3.success === true,
  `❌ Test 3a FAILED: expected success true, got ${receipt3.success}`
);
console.assert(
  receipt3.sentAt >= before && receipt3.sentAt <= after,
  `❌ Test 3b FAILED: sentAt ${receipt3.sentAt} not in expected range [${before}, ${after}]`
);
console.log("✅ Test 3 passed: success and sentAt are correct");

// ── Test 4: groupReceiptsByChannel groups correctly ──────────────────
const allReceipts: DeliveryReceipt<Notification>[] = [
  dispatch(taskNotif, "email"),
  dispatch(commentNotif, "email"),
  dispatch(deadlineNotif, "push"),
];
const grouped = groupReceiptsByChannel(allReceipts);

console.assert(
  grouped["email"].length === 2,
  `❌ Test 4a FAILED: expected 2 email receipts, got ${grouped["email"].length}`
);
console.assert(
  grouped["sms"].length === 0,
  `❌ Test 4b FAILED: expected 0 sms receipts, got ${grouped["sms"].length}`
);
console.assert(
  grouped["push"].length === 1,
  `❌ Test 4c FAILED: expected 1 push receipt, got ${grouped["push"].length}`
);
console.log("✅ Test 4 passed: groupReceiptsByChannel is correct");

// ── Test 5: assertNever throws at runtime with a descriptive message ──
let threw = false;
try {
  // Force call with a bogus value to simulate unhandled variant
  assertNever("unknown_kind" as never);
} catch (e) {
  threw = true;
}
console.assert(threw, "❌ Test 5 FAILED: assertNever should throw");
console.log("✅ Test 5 passed: assertNever throws as expected");
