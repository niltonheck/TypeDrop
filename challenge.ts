// ============================================================
// Typed Notification Dispatch Router
// challenge.ts
// ============================================================
// Compile under: strict: true  |  No `any` allowed
// ============================================================

// ------------------------------------------------------------------
// 1. RESULT TYPE  (do not modify)
// ------------------------------------------------------------------
export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ------------------------------------------------------------------
// 2. CHANNEL DEFINITIONS
// ------------------------------------------------------------------

// TODO: Define a discriminated union `Channel` with three members:
//   • { kind: "email";  address: string }
//   • { kind: "sms";    phone: string   }
//   • { kind: "push";   deviceToken: string }
export type Channel = never; // replace `never`

// ------------------------------------------------------------------
// 3. RAW SUBSCRIPTION INPUT
// ------------------------------------------------------------------

// Raw shape arriving from an untrusted form / API body.
// All fields are optional strings; validation will tighten them.
export interface RawSubscription {
  userId: string;
  channels: unknown; // array of raw channel objects
}

// ------------------------------------------------------------------
// 4. VALIDATED SUBSCRIPTION
// ------------------------------------------------------------------

// TODO: Define `ValidatedSubscription` so that:
//   • `userId` is a non-empty string (keep as string — branding is optional stretch)
//   • `channels` is a non-empty readonly array of `Channel`
export interface ValidatedSubscription {
  userId: string;
  channels: readonly Channel[]; // replace with a branded/non-empty form if you like
}

// ------------------------------------------------------------------
// 5. NOTIFICATION MESSAGE
// ------------------------------------------------------------------

// TODO: Define a discriminated union `NotificationMessage` with three members
//   whose `kind` mirrors the channel kinds:
//   • { kind: "email"; subject: string; body: string }
//   • { kind: "sms";   text: string }
//   • { kind: "push";  title: string; payload: Record<string, string> }
export type NotificationMessage = never; // replace `never`

// ------------------------------------------------------------------
// 6. DELIVERY OUTCOME
// ------------------------------------------------------------------

export type DeliveryStatus = "sent" | "failed" | "skipped";

// TODO: Define `DeliveryOutcome` as a mapped type over each Channel["kind"]
//   so that every channel kind maps to:
//   { status: DeliveryStatus; detail: string }
//
//   Hint: use a mapped type with `Channel["kind"]` as the key universe.
export type DeliveryOutcome = never; // replace `never`

// ------------------------------------------------------------------
// 7. DISPATCH ERRORS
// ------------------------------------------------------------------

// TODO: Define a discriminated union `DispatchError` with members:
//   • { code: "INVALID_CHANNELS";  message: string }
//   • { code: "EMPTY_CHANNELS";    message: string }
//   • { code: "NO_MATCHING_MSG";   message: string; channelKind: Channel["kind"] }
export type DispatchError = never; // replace `never`

// ------------------------------------------------------------------
// 8. CHANNEL HANDLER TYPE
// ------------------------------------------------------------------

// A handler receives the matched channel and its message, and returns
// a promise that resolves to a Result carrying a detail string on success
// or a plain string error on failure.
//
// TODO: Define `ChannelHandler<C extends Channel, M extends NotificationMessage>`
//   as a generic type alias for:
//   (channel: C, message: M) => Promise<Result<string, string>>
export type ChannelHandler<
  C extends Channel,
  M extends NotificationMessage
> = never; // replace `never`

// ------------------------------------------------------------------
// 9. HANDLER REGISTRY
// ------------------------------------------------------------------

// TODO: Define `HandlerRegistry` as a mapped type over Channel["kind"] where
//   each key K maps to a ChannelHandler whose C is the Channel member with
//   kind === K and whose M is the NotificationMessage member with kind === K.
//
//   Hint: use `Extract<Channel, { kind: K }>` and
//         `Extract<NotificationMessage, { kind: K }>`.
export type HandlerRegistry = never; // replace `never`

// ------------------------------------------------------------------
// 10. VALIDATION FUNCTION
// ------------------------------------------------------------------

// TODO: Implement `validateSubscription`.
//
// Requirements:
//   R1. Return `err({ code: "INVALID_CHANNELS", ... })` if `raw.channels`
//       is not an array.
//   R2. For each element in the array, accept it as a valid Channel only if:
//       - It is an object with a `kind` field equal to "email", "sms", or "push"
//       - "email" channels must have a non-empty string `address`
//       - "sms" channels must have a non-empty string `phone`
//       - "push" channels must have a non-empty string `deviceToken`
//       Silently drop invalid elements (do not error on them).
//   R3. Return `err({ code: "EMPTY_CHANNELS", ... })` if no valid channels remain.
//   R4. Return `ok(validatedSubscription)` otherwise.
export function validateSubscription(
  raw: RawSubscription
): Result<ValidatedSubscription, DispatchError> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 11. DISPATCH FUNCTION
// ------------------------------------------------------------------

// TODO: Implement `dispatchNotifications`.
//
// Requirements:
//   R5. For each channel in `subscription.channels`, find the message in
//       `messages` whose `kind` matches the channel's `kind`.
//       If no matching message exists, record status "skipped" with detail
//       `err({ code: "NO_MATCHING_MSG", ... })` — but do NOT abort the whole
//       dispatch; continue processing remaining channels.
//   R6. For channels that have a matching message, invoke the corresponding
//       handler from `registry` and await its result.
//       - On `ok`, record status "sent"   with the returned detail string.
//       - On `err`, record status "failed" with the error string.
//   R7. All channel handlers must be invoked concurrently (Promise.all).
//   R8. Return a `Result<DeliveryOutcome, never>` — this function always
//       succeeds at the top level; per-channel failures live inside the outcome.
//
// Signature (do not change):
export async function dispatchNotifications(
  subscription: ValidatedSubscription,
  messages: readonly NotificationMessage[],
  registry: HandlerRegistry
): Promise<Result<DeliveryOutcome, never>> {
  // TODO: implement
  throw new Error("Not implemented");
}
