// ============================================================
// Typed Notification Dispatcher — challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill in every spot marked TODO.
// ============================================================

// -----------------------------------------------------------------
// 1. CHANNEL KINDS — the discriminant that drives the entire system
// -----------------------------------------------------------------

export type ChannelKind = "email" | "sms" | "push" | "webhook";

// -----------------------------------------------------------------
// 2. TYPED PAYLOAD SHAPES
//    Each channel has its own required fields.
// -----------------------------------------------------------------

export interface EmailPayload {
  channel: "email";
  to: string;        // valid email address
  subject: string;
  body: string;
}

export interface SmsPayload {
  channel: "sms";
  to: string;        // E.164 phone number, e.g. "+15550001234"
  message: string;
}

export interface PushPayload {
  channel: "push";
  deviceToken: string;
  title: string;
  body: string;
}

export interface WebhookPayload {
  channel: "webhook";
  url: string;       // must start with "https://"
  event: string;
  data: Record<string, string | number | boolean>;
}

// TODO 1 ─ Build the discriminated union of all payload types.
export type NotificationPayload = /* your type here */ never;

// -----------------------------------------------------------------
// 3. DELIVERY RESULT
// -----------------------------------------------------------------

export type DeliveryStatus = "sent" | "failed" | "skipped";

export interface DeliveryResult {
  channel: ChannelKind;
  status: DeliveryStatus;
  /** ISO-8601 timestamp */
  sentAt: string;
  /** Present only when status === "failed" */
  error?: string;
}

// -----------------------------------------------------------------
// 4. DISPATCH REPORT  (returned by dispatchAll)
// -----------------------------------------------------------------

export interface DispatchReport {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  results: DeliveryResult[];
}

// -----------------------------------------------------------------
// 5. CHANNEL HANDLER
//    A handler is a function that receives a *specific* payload and
//    returns a Promise<DeliveryResult>.
//    Use a generic + mapped type so each ChannelKind maps to the
//    correct payload shape automatically.
// -----------------------------------------------------------------

// TODO 2 ─ Define ChannelHandlerMap: a mapped type over ChannelKind
//           where each key maps to a function that accepts the
//           matching NotificationPayload variant and returns
//           Promise<DeliveryResult>.
//
//           Hint: You'll need a helper conditional/mapped type to
//           extract the right payload for each channel key.
export type ChannelHandlerMap = /* your type here */ never;

// -----------------------------------------------------------------
// 6. VALIDATION — unknown → NotificationPayload
// -----------------------------------------------------------------

/**
 * TODO 3 ─ Implement validatePayload.
 *
 * Requirements (as numbered comments below):
 *   [R1] Return a NotificationPayload on success, or null on failure.
 *   [R2] The input is `unknown`; use type-narrowing (no `as`).
 *   [R3] Reject if `channel` is not one of the four ChannelKind values.
 *   [R4] For "email": require non-empty `to`, `subject`, `body` strings.
 *   [R5] For "sms": require non-empty `to` (starts with "+"), `message`.
 *   [R6] For "push": require non-empty `deviceToken`, `title`, `body`.
 *   [R7] For "webhook": require `url` starting with "https://",
 *         non-empty `event`, and `data` as a non-null object.
 */
export function validatePayload(raw: unknown): NotificationPayload | null {
  // TODO 3 — implement me
  return null;
}

// -----------------------------------------------------------------
// 7. DISPATCHER
// -----------------------------------------------------------------

/**
 * TODO 4 ─ Implement dispatchAll.
 *
 * Requirements:
 *   [R8]  Accept an array of unknown blobs and a ChannelHandlerMap.
 *   [R9]  Validate each blob with validatePayload; mark invalid ones
 *         as "skipped" (no error field needed).
 *   [R10] Dispatch valid payloads to their matching handler
 *         (handlers[payload.channel]).
 *   [R11] Run ALL dispatches concurrently (Promise.all or allSettled).
 *   [R12] If a handler throws/rejects, record status "failed" with
 *         the error message; do NOT let one failure stop the others.
 *   [R13] Aggregate results into a DispatchReport with correct counts.
 */
export async function dispatchAll(
  rawPayloads: unknown[],
  handlers: ChannelHandlerMap
): Promise<DispatchReport> {
  // TODO 4 — implement me
  return {
    total: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    results: [],
  };
}

// -----------------------------------------------------------------
// 8. HANDLER REGISTRY BUILDER  (bonus / stretch)
// -----------------------------------------------------------------

/**
 * TODO 5 (stretch) ─ Implement createHandlerRegistry.
 *
 * A type-safe builder that accepts a Partial<ChannelHandlerMap> and
 * returns a complete ChannelHandlerMap by filling missing channels
 * with a default "skipped" handler.
 *
 * The return type must be ChannelHandlerMap (not Partial).
 */
export function createHandlerRegistry(
  overrides: Partial<ChannelHandlerMap>
): ChannelHandlerMap {
  // TODO 5 — implement me
  throw new Error("Not implemented");
}
