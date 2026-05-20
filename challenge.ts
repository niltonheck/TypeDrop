// ============================================================
// Typed Event Bus with Subscriber Registry
// ============================================================
// SCENARIO
// You are building the internal messaging backbone for a
// collaborative document editor. UI components publish
// strongly-typed domain events; other components subscribe to
// specific event kinds and must receive exactly the right
// payload shape — with zero `any`.
//
// YOUR TASK
// Implement the three exported functions below by filling in
// the TODOs. All type stubs are provided; do NOT change the
// public signatures or add `any` / type assertions.
// ============================================================

// -----------------------------------------------------------
// 1. Domain event definitions (discriminated union)
// -----------------------------------------------------------

export type DocumentOpenedEvent = {
  kind: "document:opened";
  documentId: string;
  title: string;
  openedBy: string;
};

export type DocumentEditedEvent = {
  kind: "document:edited";
  documentId: string;
  delta: string; // simplified diff string
  editedBy: string;
};

export type DocumentClosedEvent = {
  kind: "document:closed";
  documentId: string;
  closedBy: string;
};

export type CursorMovedEvent = {
  kind: "cursor:moved";
  documentId: string;
  userId: string;
  line: number;
  column: number;
};

export type CollaboratorJoinedEvent = {
  kind: "collaborator:joined";
  documentId: string;
  userId: string;
  displayName: string;
};

/** The full discriminated union of all domain events */
export type AppEvent =
  | DocumentOpenedEvent
  | DocumentEditedEvent
  | DocumentClosedEvent
  | CursorMovedEvent
  | CollaboratorJoinedEvent;

/** Extract the string-literal kind from any AppEvent member */
export type EventKind = AppEvent["kind"];

// -----------------------------------------------------------
// 2. Utility types
// -----------------------------------------------------------

/**
 * REQUIREMENT 1
 * Given a specific EventKind K, resolve to the AppEvent member
 * whose `kind` field equals K.
 *
 * Example: EventByKind<"document:edited"> → DocumentEditedEvent
 *
 * TODO: Implement this conditional / Extract-based mapped type.
 */
export type EventByKind<K extends EventKind> = Extract<AppEvent, { kind: K }>;

/**
 * REQUIREMENT 2
 * A subscriber callback for event kind K receives exactly the
 * resolved event type — nothing wider, nothing narrower.
 *
 * TODO: Define this type alias using EventByKind<K>.
 */
export type Subscriber<K extends EventKind> = (event: EventByKind<K>) => void;

/**
 * REQUIREMENT 3
 * The subscriber registry maps every possible EventKind to the
 * SET of subscribers currently listening for that kind.
 * Use a mapped type over EventKind.
 *
 * TODO: Implement SubscriberRegistry as a mapped type.
 */
export type SubscriberRegistry = {
  [K in EventKind]: Set<Subscriber<K>>;
};

// -----------------------------------------------------------
// 3. EventBus class shell
// -----------------------------------------------------------

export class EventBus {
  // TODO: Declare a private `registry` field of type SubscriberRegistry.
  //       Initialise it so every EventKind starts with an empty Set.
  //       Hint: the ALL_KINDS constant below lists every kind.
  private registry: SubscriberRegistry;

  constructor() {
    // TODO: Initialise this.registry
    // REQUIREMENT 4 — every EventKind must have an empty Set at construction.
    const ALL_KINDS: EventKind[] = [
      "document:opened",
      "document:edited",
      "document:closed",
      "cursor:moved",
      "collaborator:joined",
    ];

    // TODO: build the registry object from ALL_KINDS and assign to this.registry
    this.registry = ALL_KINDS.reduce((acc, kind) => {
      // TODO: add an empty Set for each kind
      return acc;
    }, {} as SubscriberRegistry);
  }

  /**
   * REQUIREMENT 5
   * Register a subscriber for a specific event kind.
   * The callback must be typed to receive exactly EventByKind<K>.
   *
   * Returns an `unsubscribe` function that removes this subscriber.
   *
   * TODO: Implement subscribe<K extends EventKind>
   */
  subscribe<K extends EventKind>(
    kind: K,
    callback: Subscriber<K>
  ): () => void {
    // TODO: add callback to this.registry[kind]
    // TODO: return a cleanup function that removes it
    throw new Error("TODO: implement subscribe");
  }

  /**
   * REQUIREMENT 6
   * Publish an event to all subscribers of that event's kind.
   * TypeScript must be able to verify that the event payload
   * matches the correct subscriber type without casting.
   *
   * TODO: Implement publish(event: AppEvent)
   */
  publish(event: AppEvent): void {
    // TODO: retrieve the correct Set from this.registry using event.kind
    // TODO: call each subscriber with the event
    // HINT: you may need a small generic helper to satisfy the type checker
    throw new Error("TODO: implement publish");
  }

  /**
   * REQUIREMENT 7
   * Return the number of active subscribers for a given kind.
   *
   * TODO: Implement subscriberCount<K extends EventKind>
   */
  subscriberCount<K extends EventKind>(kind: K): number {
    // TODO: return this.registry[kind].size
    throw new Error("TODO: implement subscriberCount");
  }
}

// -----------------------------------------------------------
// 4. Standalone helper
// -----------------------------------------------------------

/**
 * REQUIREMENT 8
 * Given an array of raw AppEvents and a target EventKind K,
 * return only the events of that kind, narrowed to EventByKind<K>.
 *
 * The return type must be EventByKind<K>[] — not AppEvent[].
 *
 * TODO: Implement filterEvents
 */
export function filterEvents<K extends EventKind>(
  events: AppEvent[],
  kind: K
): EventByKind<K>[] {
  // TODO: filter and narrow — no type assertions allowed
  throw new Error("TODO: implement filterEvents");
}
