
// ============================================================
// Typed Event Sourcing Engine with Projection & Snapshot
// challenge.ts
// ============================================================
// Compile with: tsc --strict --noEmit challenge.ts
// Do NOT use `any`, `as`, or non-narrowing type assertions.
// ============================================================

// ─── 1. BRANDED TYPES ───────────────────────────────────────

// Requirement 1: Define branded types for AggregateId, EventId, and Version.
// Each should be `string` branded with a unique symbol so they are
// not interchangeable at compile time.
// e.g.  type AggregateId = string & { readonly __brand: unique symbol }

export type AggregateId = TODO;
export type EventId     = TODO;
export type Version     = number & { readonly __brand: unique symbol };

// Helper to cast a plain number to Version (only used internally by the engine)
export declare function toVersion(n: number): Version;

// ─── 2. DOMAIN EVENTS ───────────────────────────────────────

// Requirement 2: Define a discriminated union `DomainEvent` covering exactly
// these four event types. Every variant must carry:
//   - eventId: EventId
//   - aggregateId: AggregateId
//   - version: Version        ← monotonically increasing per aggregate
//   - occurredAt: string      ← ISO-8601 timestamp
//
// Event-specific payloads:
//   DocumentCreated  → { type: "DocumentCreated";  title: string; authorId: string }
//   ContentUpdated   → { type: "ContentUpdated";   content: string; wordCount: number }
//   CollaboratorAdded→ { type: "CollaboratorAdded"; collaboratorId: string; role: "viewer" | "editor" }
//   DocumentArchived → { type: "DocumentArchived";  reason: string }

export type DomainEvent = TODO;

// ─── 3. AGGREGATE STATE ─────────────────────────────────────

// Requirement 3: Define `DocumentState` — the fully-typed aggregate root.
// Fields:
//   id: AggregateId
//   version: Version
//   title: string
//   content: string
//   wordCount: number
//   authorId: string
//   collaborators: Map<string, "viewer" | "editor">
//   archivedAt: string | null
//   archivedReason: string | null

export type DocumentState = TODO;

// ─── 4. SNAPSHOT ────────────────────────────────────────────

// Requirement 4: A `Snapshot<S>` wraps any aggregate state with metadata.
// Fields:
//   aggregateId: AggregateId
//   version: Version
//   takenAt: string    ← ISO-8601
//   state: S

export type Snapshot<S> = TODO;

// ─── 5. PROJECTION REGISTRY ─────────────────────────────────

// Requirement 5: A `ProjectionReducer<S, E>` is a pure function:
//   (state: S, event: E) => S
// A `ProjectionRegistry<S>` maps each DomainEvent["type"] to the
// ProjectionReducer that handles that event variant.
// Use mapped types + Extract so each key maps to the correct event subtype.
//
// Hint: Extract<DomainEvent, { type: K }> gives you the right variant.

export type ProjectionReducer<S, E> = TODO;

export type ProjectionRegistry<S> = {
  [K in DomainEvent["type"]]: ProjectionReducer<S, Extract<DomainEvent, { type: K }>>;
};

// ─── 6. RESULT TYPE ─────────────────────────────────────────

// Requirement 6: Define a generic `Result<T, E>` discriminated union:
//   | { ok: true;  value: T }
//   | { ok: false; error: E }

export type Result<T, E> = TODO;

// ─── 7. VALIDATION ERRORS ───────────────────────────────────

// Requirement 7: Define `ValidationError` as a discriminated union covering:
//   | { kind: "MissingField";   field: string }
//   | { kind: "InvalidType";    field: string; expected: string; received: string }
//   | { kind: "UnknownEvent";   receivedType: string }
//   | { kind: "StaleVersion";   expected: Version; received: Version }

export type ValidationError = TODO;

// ─── 8. PARSE & VALIDATE RAW EVENT ──────────────────────────

// Requirement 8: Implement `parseRawEvent`.
// - Accept `unknown` input.
// - Return `Result<DomainEvent, ValidationError>`.
// - Validate that input is a non-null object.
// - Validate that `type` is one of the four known event types
//   (if not → UnknownEvent error).
// - Validate that `eventId`, `aggregateId`, `occurredAt` are non-empty strings
//   (if missing or wrong type → MissingField or InvalidType error).
// - Validate that `version` is a positive integer.
// - Validate event-specific required fields per variant (e.g. `title` for
//   DocumentCreated, `content` + `wordCount` for ContentUpdated, etc.).
// - On success, return the narrowed DomainEvent (use toVersion() for Version).

export function parseRawEvent(raw: unknown): Result<DomainEvent, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// ─── 9. APPLY EVENT TO STATE ─────────────────────────────────

// Requirement 9: Implement `applyEvent`.
// - Accept the current `DocumentState` and a validated `DomainEvent`.
// - Validate that event.version === state.version + 1;
//   if not → return Result with StaleVersion error.
// - Delegate to the provided `ProjectionRegistry<DocumentState>` to compute
//   the next state.
// - Return `Result<DocumentState, ValidationError>`.

export function applyEvent(
  state: DocumentState,
  event: DomainEvent,
  registry: ProjectionRegistry<DocumentState>
): Result<DocumentState, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// ─── 10. REPLAY EVENTS ───────────────────────────────────────

// Requirement 10: Implement `replayEvents`.
// - Accept an initial `DocumentState` (e.g. from a snapshot or seed),
//   a `readonly DomainEvent[]`, and a `ProjectionRegistry<DocumentState>`.
// - Apply events sequentially; stop and return on the first error.
// - Return `Result<DocumentState, ValidationError>`.

export function replayEvents(
  initial: DocumentState,
  events: readonly DomainEvent[],
  registry: ProjectionRegistry<DocumentState>
): Result<DocumentState, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// ─── 11. TAKE SNAPSHOT ───────────────────────────────────────

// Requirement 11: Implement `takeSnapshot`.
// - Accept any `state: S` (generic) and return a `Snapshot<S>`.
// - `takenAt` should be new Date().toISOString().
// - The function must be generic: <S extends { id: AggregateId; version: Version }>.

export function takeSnapshot<S extends { id: AggregateId; version: Version }>(
  state: S
): Snapshot<S> {
  // TODO
  throw new Error("Not implemented");
}

// ─── 12. PROCESS RAW EVENTS PIPELINE ─────────────────────────

// Requirement 12: Implement `processRawEventBatch`.
// - Accept `rawEvents: unknown[]`, an initial `DocumentState`, and a
//   `ProjectionRegistry<DocumentState>`.
// - Parse each raw event with `parseRawEvent`; collect parse errors into a
//   `ValidationError[]` (do NOT stop on parse failure — keep processing).
// - Replay all successfully parsed events with `replayEvents`.
// - If replay fails, return its error in the result.
// - Return:
//     {
//       finalState: DocumentState | null;   // null if replay failed
//       snapshot:   Snapshot<DocumentState> | null; // null if finalState is null
//       parseErrors: ValidationError[];
//       replayError: ValidationError | null;
//     }
// The return type must be fully explicit — define `BatchResult` below.

export type BatchResult = TODO;

export function processRawEventBatch(
  rawEvents: unknown[],
  initial: DocumentState,
  registry: ProjectionRegistry<DocumentState>
): BatchResult {
  // TODO
  throw new Error("Not implemented");
}

// ─── 13. BUILT-IN PROJECTION REGISTRY ────────────────────────

// Requirement 13: Export `documentProjection` — a fully-typed
// `ProjectionRegistry<DocumentState>` that correctly handles all four events:
//   DocumentCreated   → set title, authorId; reset content/wordCount/collaborators
//   ContentUpdated    → update content and wordCount
//   CollaboratorAdded → add collaboratorId → role into the collaborators Map
//   DocumentArchived  → set archivedAt = occurredAt, archivedReason = reason
// In every case, also update state.version to the event's version.

export const documentProjection: ProjectionRegistry<DocumentState> = {
  // TODO: implement each reducer
  DocumentCreated:   (state, event) => { throw new Error("Not implemented"); },
  ContentUpdated:    (state, event) => { throw new Error("Not implemented"); },
  CollaboratorAdded: (state, event) => { throw new Error("Not implemented"); },
  DocumentArchived:  (state, event) => { throw new Error("Not implemented"); },
};

// ─── PLACEHOLDER (remove when implementing) ──────────────────
type TODO = never;
