// ============================================================
// Typed Dependency Injection Container
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill every TODO section. Do NOT modify the public API signatures.
// ============================================================

// ---------------------------------------------------------------------------
// 1. TOKEN — a branded nominal key that carries the resolved type as a phantom
// ---------------------------------------------------------------------------

/** A unique token that identifies a service of type T in the container. */
// TODO: Define `Token<T>` as a branded/nominal type so that two tokens for
//       different T values are not assignable to each other.
//       Hint: use an intersection with `{ readonly __type: T }` or a similar
//       phantom-type trick — but keep the runtime value a plain symbol.
export type Token<T> = symbol & { readonly __tokenType: T };

/** Create a new unique Token for a service of type T. */
// TODO: Implement `createToken`. The generic parameter T must be supplied by
//       the caller (it cannot be inferred from arguments).
//       Requirements:
//       R1. Each call must produce a distinct runtime symbol (use `description`
//           for debugging only).
//       R2. Return type must be `Token<T>`.
export function createToken<T>(description: string): Token<T> {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 2. FACTORY — a function that receives resolved deps and returns a service
// ---------------------------------------------------------------------------

/**
 * A tuple of Token values whose resolved types are collected into a
 * corresponding tuple of concrete types.
 *
 * Example:
 *   TokenTuple<[Token<Logger>, Token<DB>]>  →  [Logger, DB]
 */
// TODO: Define `ResolvedTuple<Tokens>` — a mapped/conditional type that turns
//       a tuple of `Token<X>` values into a tuple of the corresponding X types.
//       Hint: use `{ [K in keyof Tokens]: Tokens[K] extends Token<infer U> ? U : never }`
export type ResolvedTuple<Tokens extends ReadonlyArray<Token<unknown>>> = {
  [K in keyof Tokens]: Tokens[K] extends Token<infer U> ? U : never;
};

/** A factory descriptor for a service of type T with dependencies Deps. */
export interface ServiceFactory<
  T,
  Deps extends ReadonlyArray<Token<unknown>> = []
> {
  /** The tokens this factory depends on, in order. */
  readonly deps: Deps;
  /** Given the resolved dependency instances, produce the service. */
  readonly create: (...args: ResolvedTuple<Deps>) => T;
}

// ---------------------------------------------------------------------------
// 3. REGISTRATION MAP — internal bookkeeping
// ---------------------------------------------------------------------------

/**
 * Internal entry stored per token.
 * We need to erase the specific T/Deps here so we can store heterogeneous
 * entries in a single map — but without using `any`.
 *
 * TODO: Define `RegistrationEntry` using `unknown` (not `any`) in a way that
 *       lets the container store and retrieve entries type-safely via
 *       narrowing / generic helpers.
 */
export interface RegistrationEntry {
  // TODO: add the fields needed (deps array and create function).
  //       Use `unknown` where you must erase a type parameter.
  readonly deps: ReadonlyArray<Token<unknown>>;
  readonly create: (...args: ReadonlyArray<unknown>) => unknown;
}

// ---------------------------------------------------------------------------
// 4. RESOLUTION RESULT
// ---------------------------------------------------------------------------

/** Successful resolution */
export interface ResolveOk<T> {
  readonly ok: true;
  readonly value: T;
}

/** Failed resolution — always carries a human-readable reason */
export interface ResolveErr {
  readonly ok: false;
  readonly reason:
    | "NOT_REGISTERED"    // token has no factory
    | "CIRCULAR_DEP"      // a cycle was detected in the dep graph
    | "FACTORY_THREW";    // the factory function itself threw
  readonly message: string;
}

export type ResolveResult<T> = ResolveOk<T> | ResolveErr;

// ---------------------------------------------------------------------------
// 5. CONTAINER
// ---------------------------------------------------------------------------

export class Container {
  // TODO: declare private fields:
  //   - a Map from Token<unknown> to RegistrationEntry (for registered factories)
  //   - a Map from Token<unknown> to unknown (for the singleton cache)

  // TODO: Implement `register<T, Deps>(token, factory)`.
  //       Requirements:
  //       R3. Registering the same token twice must silently overwrite the
  //           previous registration and clear its cached singleton (if any).
  //       R4. The method must be chainable (return `this`).
  register<T, Deps extends ReadonlyArray<Token<unknown>>>(
    token: Token<T>,
    factory: ServiceFactory<T, Deps>
  ): this {
    // TODO
    throw new Error("Not implemented");
  }

  // TODO: Implement `resolve<T>(token): ResolveResult<T>`.
  //       Requirements:
  //       R5. If the token is not registered, return a ResolveErr with
  //           reason "NOT_REGISTERED".
  //       R6. Detect circular dependencies using a `visiting` set that tracks
  //           tokens currently on the resolution stack; return a ResolveErr
  //           with reason "CIRCULAR_DEP" if a token is encountered twice.
  //       R7. Cache resolved instances so each factory is called at most once
  //           (singleton semantics).
  //       R8. If a factory function throws, catch it and return a ResolveErr
  //           with reason "FACTORY_THREW" and the error message.
  //       R9. Dependency resolution is recursive: resolve each dep token
  //           before calling the factory. If any dep resolution fails, bubble
  //           the ResolveErr up immediately.
  resolve<T>(token: Token<T>): ResolveResult<T> {
    // TODO: delegate to a private helper that also accepts the `visiting` set
    throw new Error("Not implemented");
  }

  // Private recursive helper — already declared for you; fill the body.
  // NOTE: you may change the signature of this private method freely.
  private resolveInner<T>(
    token: Token<T>,
    visiting: Set<symbol>
  ): ResolveResult<T> {
    // TODO
    throw new Error("Not implemented");
  }

  // TODO: Implement `isRegistered<T>(token): boolean`
  //       R10. Returns true iff the token has a registered factory.
  isRegistered<T>(token: Token<T>): boolean {
    // TODO
    throw new Error("Not implemented");
  }

  // TODO: Implement `unregister<T>(token): boolean`
  //       R11. Removes the factory AND the cached singleton for the token.
  //       R12. Returns true if the token existed, false otherwise.
  unregister<T>(token: Token<T>): boolean {
    // TODO
    throw new Error("Not implemented");
  }
}

// ---------------------------------------------------------------------------
// 6. HELPER — `provide` convenience wrapper (eliminates verbose generics)
// ---------------------------------------------------------------------------

/**
 * TODO: Implement `provide<T, Deps>(deps, create): ServiceFactory<T, Deps>`.
 *
 * This is a convenience factory-builder so callers don't have to write
 * `ServiceFactory<T, Deps>` by hand.  The return type must be inferred
 * precisely — callers should NOT need to supply T or Deps explicitly;
 * they should be inferred from the `deps` array and the `create` function.
 *
 * Requirements:
 * R13. `deps` must be inferred as a `const` tuple (use `as const` guidance in
 *      the type signature, i.e. `Deps extends ReadonlyArray<Token<unknown>>`).
 * R14. The `create` callback's parameter types must be inferred from `deps`
 *      via `ResolvedTuple<Deps>` — callers must NOT have to annotate them.
 * R15. Return a plain object satisfying `ServiceFactory<T, Deps>`.
 */
export function provide<T, Deps extends ReadonlyArray<Token<unknown>>>(
  deps: Deps,
  create: (...args: ResolvedTuple<Deps>) => T
): ServiceFactory<T, Deps> {
  // TODO
  throw new Error("Not implemented");
}
