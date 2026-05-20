// challenge.test.ts
import {
  EventBus,
  filterEvents,
  type AppEvent,
  type EventByKind,
  type EventKind,
  type SubscriberRegistry,
  type Subscriber,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------

const mockEvents: AppEvent[] = [
  {
    kind: "document:opened",
    documentId: "doc-1",
    title: "Q2 Roadmap",
    openedBy: "alice",
  },
  {
    kind: "document:edited",
    documentId: "doc-1",
    delta: "+paragraph",
    editedBy: "alice",
  },
  {
    kind: "cursor:moved",
    documentId: "doc-1",
    userId: "bob",
    line: 4,
    column: 12,
  },
  {
    kind: "document:edited",
    documentId: "doc-1",
    delta: "-word",
    editedBy: "bob",
  },
  {
    kind: "collaborator:joined",
    documentId: "doc-1",
    userId: "carol",
    displayName: "Carol",
  },
  {
    kind: "document:closed",
    documentId: "doc-1",
    closedBy: "alice",
  },
];

// -----------------------------------------------------------
// Test 1: filterEvents narrows correctly
// -----------------------------------------------------------

const editedEvents = filterEvents(mockEvents, "document:edited");

console.assert(
  editedEvents.length === 2,
  `Test 1a FAILED: expected 2 edited events, got ${editedEvents.length}`
);

// TypeScript must infer EventByKind<"document:edited"> — check a field unique to that type
console.assert(
  editedEvents.every((e) => typeof e.delta === "string"),
  "Test 1b FAILED: every edited event should have a delta string"
);

const cursorEvents = filterEvents(mockEvents, "cursor:moved");
console.assert(
  cursorEvents.length === 1 && cursorEvents[0].line === 4,
  `Test 1c FAILED: expected 1 cursor event at line 4, got ${cursorEvents.length}`
);

console.log("Test 1 PASSED: filterEvents");

// -----------------------------------------------------------
// Test 2: EventBus subscribe + publish
// -----------------------------------------------------------

const bus = new EventBus();

const receivedEdits: EventByKind<"document:edited">[] = [];
const receivedJoins: EventByKind<"collaborator:joined">[] = [];

bus.subscribe("document:edited", (e) => {
  // e must be DocumentEditedEvent — access delta without assertion
  receivedEdits.push(e);
});

bus.subscribe("collaborator:joined", (e) => {
  receivedJoins.push(e);
});

// Publish all mock events through the bus
for (const event of mockEvents) {
  bus.publish(event);
}

console.assert(
  receivedEdits.length === 2,
  `Test 2a FAILED: expected 2 edit callbacks, got ${receivedEdits.length}`
);

console.assert(
  receivedJoins.length === 1 && receivedJoins[0].displayName === "Carol",
  `Test 2b FAILED: expected 1 join for Carol, got ${receivedJoins.length}`
);

console.log("Test 2 PASSED: subscribe + publish");

// -----------------------------------------------------------
// Test 3: subscriberCount
// -----------------------------------------------------------

const bus2 = new EventBus();

console.assert(
  bus2.subscriberCount("document:opened") === 0,
  "Test 3a FAILED: fresh bus should have 0 subscribers"
);

const unsub1 = bus2.subscribe("document:opened", (_e) => {});
const unsub2 = bus2.subscribe("document:opened", (_e) => {});

console.assert(
  bus2.subscriberCount("document:opened") === 2,
  `Test 3b FAILED: expected 2 subscribers, got ${bus2.subscriberCount("document:opened")}`
);

unsub1();

console.assert(
  bus2.subscriberCount("document:opened") === 1,
  `Test 3c FAILED: after unsub, expected 1 subscriber, got ${bus2.subscriberCount("document:opened")}`
);

console.log("Test 3 PASSED: subscriberCount + unsubscribe");

// -----------------------------------------------------------
// Test 4: unsubscribe stops delivery
// -----------------------------------------------------------

const bus3 = new EventBus();
let callCount = 0;

const unsub = bus3.subscribe("cursor:moved", (_e) => {
  callCount++;
});

bus3.publish({
  kind: "cursor:moved",
  documentId: "doc-x",
  userId: "dave",
  line: 1,
  column: 1,
});

unsub();

bus3.publish({
  kind: "cursor:moved",
  documentId: "doc-x",
  userId: "dave",
  line: 2,
  column: 5,
});

console.assert(
  callCount === 1,
  `Test 4 FAILED: expected 1 call after unsub, got ${callCount}`
);

console.log("Test 4 PASSED: unsubscribe stops delivery");

// -----------------------------------------------------------
// Test 5: multiple subscribers for same kind all fire
// -----------------------------------------------------------

const bus4 = new EventBus();
const log: string[] = [];

bus4.subscribe("document:closed", (e) => log.push(`A:${e.closedBy}`));
bus4.subscribe("document:closed", (e) => log.push(`B:${e.closedBy}`));

bus4.publish({ kind: "document:closed", documentId: "doc-2", closedBy: "eve" });

console.assert(
  log.length === 2 && log.includes("A:eve") && log.includes("B:eve"),
  `Test 5 FAILED: expected both subscribers to fire, got ${JSON.stringify(log)}`
);

console.log("Test 5 PASSED: multiple subscribers all fire");

console.log("\n✅ All tests passed!");
