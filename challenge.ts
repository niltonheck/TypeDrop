// challenge.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed Notification Router
//
// SCENARIO
//   Raw notification payloads arrive as `unknown` from a webhook endpoint.
//   Your router must:
//     1. Validate the raw payload into a strongly-typed Notification union
//     2. Dispatch each notification to the correct typed channel handler
//     3. Return a discriminated-union DeliveryReport per notification
//
// REQUIREMENTS
//   [R1] Define a discriminated union `Notification` with at least three
//        channel variants: "email", "sms", and "push".
//        Each variant must carry channel-specific fields (see stubs below).
//
//   [R2] Implement `parseNotification(raw: unknown): Notification`
//        - Throw a `ValidationError` (typed class provided) if the payload
//          is not a valid Notification.
//        - Use type narrowing / type guards — no `as` or `any`.
//
//   [R3] Define a discriminated union `DeliveryReport` with two variants:
//        - { status: "delivered"; channel: Notification["channel"]; sentAt: number }
//        - { status: "failed";    channel: Notification["channel"]; reason: string }
//
//   [R4] Implement `routeNotification(n: Notification): DeliveryReport`
//        - Dispatch to the correct handler using an exhaustive switch on
//          `n.channel` (the compiler must catch unhandled variants).
//        - Each handler simulates success/failure via the provided
//          `simulateDelivery` helper and returns a DeliveryReport.
//
//   [R5] Implement `processAll(raws: unknown[]): DeliveryReport[]`
//        - Parse each element with `parseNotification`.
//        - If parsing throws, push a failed DeliveryReport with
//          channel "unknown" and the error message as `reason`.
//        - Route valid notifications with `routeNotification`.
//        - Return the full array of reports (one per input element).
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Provided helpers (do NOT modify) ─────────────────────────────────────────

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Deterministic fake delivery simulator.
 * Returns true (success) when `seed` is even, false (failure) when odd.
 */
export function simulateDelivery(seed: number): boolean {
  return seed % 2 === 0;
}

// ── R1 — Notification union ───────────────────────────────────────────────────

export type EmailNotification = {
  channel: "email";
  // TODO: add — to:string, subject:string, body:string
};

export type SmsNotification = {
  channel: "sms";
  // TODO: add — to:string, message:string
};

export type PushNotification = {
  channel: "push";
  // TODO: add — deviceToken:string, title:string, body:string
};

export type Notification = EmailNotification | SmsNotification | PushNotification;

// ── R2 — Parser / validator ───────────────────────────────────────────────────

/**
 * Validates `raw` and narrows it to a `Notification`.
 * Throws `ValidationError` on any structural or type mismatch.
 *
 * TODO: implement this function
 */
export function parseNotification(raw: unknown): Notification {
  throw new Error("Not implemented");
}

// ── R3 — DeliveryReport union ─────────────────────────────────────────────────

// TODO: define DeliveryReport as a discriminated union (status: "delivered" | "failed")
// Hint: for the "failed" fallback in processAll, channel can be the literal "unknown"
export type DeliveryReport = never; // replace this

// ── R4 — Router ───────────────────────────────────────────────────────────────

/**
 * Dispatches a validated Notification to its channel handler.
 * Must use an exhaustive switch on `n.channel`.
 *
 * TODO: implement this function
 */
export function routeNotification(n: Notification): DeliveryReport {
  throw new Error("Not implemented");
}

// ── R5 — Batch processor ──────────────────────────────────────────────────────

/**
 * Processes an array of raw payloads end-to-end.
 * Parse failures become { status:"failed", channel:"unknown", reason: <message> }.
 *
 * TODO: implement this function
 */
export function processAll(raws: unknown[]): DeliveryReport[] {
  throw new Error("Not implemented");
}
