// ============================================================
// challenge.ts — Typed Notification Dispatcher
// Difficulty: Medium
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill in every TODO. Do NOT modify existing type signatures.
// ============================================================

// ------------------------------------------------------------------
// 1. CHANNEL PAYLOAD TYPES
//    Each notification channel carries its own required fields.
// ------------------------------------------------------------------

export interface EmailPayload {
  channel: "email";
  to: string;          // must be non-empty
  subject: string;     // must be non-empty
  body: string;        // must be non-empty
}

export interface SmsPayload {
  channel: "sms";
  phoneNumber: string; // must match /^\+[1-9]\d{6,14}$/
  message: string;     // must be non-empty, max 160 chars
}

export interface PushPayload {
  channel: "push";
  deviceToken: string; // must be non-empty
  title: string;       // must be non-empty
  body: string;        // must be non-empty
}

export interface WebhookPayload {
  channel: "webhook";
  url: string;         // must start with "https://"
  eventType: string;   // must be non-empty
  data: Record<string, string>; // values must all be strings
}

// TODO 1 — Define `NotificationPayload` as the discriminated union of all
//           four channel payload types above.
export type NotificationPayload = /* TODO */;

// ------------------------------------------------------------------
// 2. RETRY POLICY
// ------------------------------------------------------------------

export interface RetryPolicy {
  maxAttempts: number;   // >= 1
  delayMs: number;       // >= 0, wait between attempts
}

// ------------------------------------------------------------------
// 3. CHANNEL REGISTRY
//    Maps each channel name to its RetryPolicy.
//    Use a mapped type so that every key of the union is required.
// ------------------------------------------------------------------

// TODO 2 — Define `ChannelRegistry` as a mapped type over the
//           `channel` discriminant of `NotificationPayload` where
//           every key maps to a `RetryPolicy`. No hardcoded keys.
export type ChannelRegistry = /* TODO */;

// ------------------------------------------------------------------
// 4. DISPATCH OUTCOME — discriminated union per notification
// ------------------------------------------------------------------

export interface DispatchSuccess {
  status: "sent";
  channel: NotificationPayload["channel"];
  attempts: number;
}

export interface DispatchFailure {
  status: "failed";
  channel: NotificationPayload["channel"];
  attempts: number;
  lastError: string;
}

export type DispatchOutcome = DispatchSuccess | DispatchFailure;

// ------------------------------------------------------------------
// 5. CHANNEL HANDLER TYPE
//    A handler receives a specific payload subtype and returns a
//    Promise that resolves on success or rejects with an Error.
//    Use a generic + conditional type to map a payload to its handler.
// ------------------------------------------------------------------

// TODO 3 — Define `ChannelHandler<P>` as a generic type that, given a
//           specific payload type P (e.g. EmailPayload), resolves to a
//           function: (payload: P) => Promise<void>.
export type ChannelHandler<P extends NotificationPayload> = /* TODO */;

// TODO 4 — Define `HandlerMap` as a mapped type over `NotificationPayload`
//           where each channel key maps to the correct `ChannelHandler`
//           for that channel's payload type. Use `Extract` to narrow the
//           union to the right payload subtype for each key.
//           Hint: map over `NotificationPayload["channel"]` and use
//           Extract<NotificationPayload, { channel: K }> to get the right type.
export type HandlerMap = /* TODO */;

// ------------------------------------------------------------------
// 6. VALIDATION
//    Parse an `unknown` value into a `NotificationPayload` or return
//    a descriptive error string.
// ------------------------------------------------------------------

// TODO 5 — Implement `validatePayload`.
//   Requirements:
//   a. Input must be a non-null object with a string `channel` field.
//   b. Dispatch to per-channel validation logic based on `channel`.
//   c. Return { ok: true, value: NotificationPayload } on success.
//   d. Return { ok: false, error: string } on any validation failure.
//   e. Reject unknown channel values with a descriptive error.
export type ValidationResult =
  | { ok: true; value: NotificationPayload }
  | { ok: false; error: string };

export function validatePayload(raw: unknown): ValidationResult {
  // TODO
}

// ------------------------------------------------------------------
// 7. DISPATCHER
//    Validate, route, and execute with retry.
// ------------------------------------------------------------------

// TODO 6 — Implement `dispatchOne`.
//   Given:
//     - `raw`: an unknown payload from the message bus
//     - `handlers`: a fully-typed HandlerMap
//     - `registry`: a ChannelRegistry (retry policies per channel)
//   Requirements:
//   a. Validate `raw`; on failure return a DispatchFailure immediately
//      (attempts: 0).
//   b. Look up the handler and retry policy for the validated channel.
//   c. Attempt the handler up to `maxAttempts` times, waiting `delayMs`
//      ms between failures (use a simple Promise-based sleep).
//   d. Return a DispatchSuccess if any attempt succeeds.
//   e. Return a DispatchFailure (with lastError from the final attempt)
//      if all attempts are exhausted.
//   f. `attempts` in the outcome must reflect how many times the
//      handler was actually called.
export async function dispatchOne(
  raw: unknown,
  handlers: HandlerMap,
  registry: ChannelRegistry
): Promise<DispatchOutcome> {
  // TODO
}

// ------------------------------------------------------------------
// 8. BATCH DISPATCHER
//    Run all dispatches concurrently and collect outcomes.
// ------------------------------------------------------------------

// TODO 7 — Implement `dispatchBatch`.
//   Given an array of unknown payloads, dispatch all concurrently
//   (Promise.all) using `dispatchOne` and return the array of outcomes
//   in the same order as the input. Never throw — all errors must be
//   captured as DispatchFailure entries.
export async function dispatchBatch(
  raws: unknown[],
  handlers: HandlerMap,
  registry: ChannelRegistry
): Promise<DispatchOutcome[]> {
  // TODO
}
