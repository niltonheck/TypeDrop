// ============================================================
// Typed HTTP API Client Builder
// ============================================================
// GOAL: Build a small, strongly-typed API client factory.
// Consumers declare endpoint definitions once; the factory
// returns a caller function whose parameters and return type
// are inferred entirely from that definition.
//
// You may NOT use `any`, `as`, or non-trivial type assertions.
// All code must compile under strict: true.
// ============================================================

// ------------------------------------------------------------
// 1. HTTP method union
// ------------------------------------------------------------
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// ------------------------------------------------------------
// 2. Endpoint definition
//
// An endpoint definition describes one API route:
//   - `method`  : the HTTP verb
//   - `path`    : a template-literal path, e.g. "/users/:id/posts/:postId"
//   - `response`: the shape of a successful JSON response (type-level only)
//
// TODO (Requirement 1): Define `EndpointDef<TPath, TResponse>` as a type
// (or interface) that holds `method`, `path`, and a phantom `response`
// marker. The `response` field must carry the type `TResponse` at the
// type level — use `_response?: TResponse` (optional phantom field) so
// callers never need to supply a runtime value for it.
// ------------------------------------------------------------
export type EndpointDef<TPath extends string, TResponse> = {
  method: HttpMethod;
  path: TPath;
  _response?: TResponse; // phantom — carries TResponse into the type system
};

// ------------------------------------------------------------
// 3. Extract path parameter names from a path string
//
// Given "/users/:id/posts/:postId", produce the union "id" | "postId".
//
// TODO (Requirement 2): Implement the conditional/recursive type
// `ExtractPathParams<T>` so that:
//   ExtractPathParams<"/users/:id">          → "id"
//   ExtractPathParams<"/users/:id/posts/:postId"> → "id" | "postId"
//   ExtractPathParams<"/health">             → never
// ------------------------------------------------------------
export type ExtractPathParams<T extends string> =
  T extends `${string}/:${infer Param}/${infer Rest}`
    ? Param | ExtractPathParams<`/${Rest}`>
    : T extends `${string}/:${infer Param}`
    ? Param
    : never;

// ------------------------------------------------------------
// 4. Call options
//
// When invoking an endpoint, the caller may need to supply:
//   - `pathParams` : a Record keyed by the extracted param names
//                    (omitted entirely when the path has no params)
//   - `queryParams`: an optional Record<string, string | number | boolean>
//   - `body`       : an optional unknown payload (for POST/PUT/PATCH)
//   - `headers`    : optional extra headers
//
// TODO (Requirement 3): Define `CallOptions<TPath>` so that:
//   - When `ExtractPathParams<TPath>` is `never`, `pathParams` is absent.
//   - When path params exist, `pathParams` is a required
//     `Record<ExtractPathParams<TPath>, string>`.
//   Use a conditional type + intersection or a conditional type directly.
// ------------------------------------------------------------
export type CallOptions<TPath extends string> =
  [ExtractPathParams<TPath>] extends [never]
    ? {
        queryParams?: Record<string, string | number | boolean>;
        body?: unknown;
        headers?: Record<string, string>;
      }
    : {
        pathParams: Record<ExtractPathParams<TPath>, string>;
        queryParams?: Record<string, string | number | boolean>;
        body?: unknown;
        headers?: Record<string, string>;
      };

// ------------------------------------------------------------
// 5. Result type
//
// Every call returns a discriminated union:
//   { ok: true;  status: number; data: TResponse }
// | { ok: false; status: number; error: string   }
// ------------------------------------------------------------
export type ApiResult<TResponse> =
  | { ok: true; status: number; data: TResponse }
  | { ok: false; status: number; error: string };

// ------------------------------------------------------------
// 6. The endpoint caller function type
//
// A caller for `EndpointDef<TPath, TResponse>` is an async function:
//   (options: CallOptions<TPath>) => Promise<ApiResult<TResponse>>
// ------------------------------------------------------------
export type EndpointCaller<TPath extends string, TResponse> = (
  options: CallOptions<TPath>
) => Promise<ApiResult<TResponse>>;

// ------------------------------------------------------------
// 7. `defineEndpoint` — the definition helper
//
// TODO (Requirement 4): Implement `defineEndpoint` so that TypeScript
// infers `TPath` and `TResponse` from the arguments, and returns a
// typed `EndpointDef<TPath, TResponse>`.
//
// Signature hint:
//   function defineEndpoint<TPath extends string, TResponse>(
//     method: HttpMethod,
//     path: TPath,
//   ): EndpointDef<TPath, TResponse>
//
// Because `TResponse` cannot be inferred from runtime values, the
// function should be curried: the first call takes `method` + `path`,
// and returns a second call that accepts nothing but fixes `TResponse`
// via an explicit type parameter.
//
// Usage:
//   const getUser = defineEndpoint("GET", "/users/:id")<User>();
// ------------------------------------------------------------
export function defineEndpoint<TPath extends string>(
  method: HttpMethod,
  path: TPath
): <TResponse>() => EndpointDef<TPath, TResponse> {
  // TODO: implement the curried factory
  return <TResponse>(): EndpointDef<TPath, TResponse> => {
    // TODO: return the endpoint definition object
    throw new Error("Not implemented");
  };
}

// ------------------------------------------------------------
// 8. `buildCaller` — the runtime fetch wrapper
//
// TODO (Requirement 5): Implement `buildCaller` which accepts:
//   - `def`     : an `EndpointDef<TPath, TResponse>`
//   - `baseUrl` : a string base URL (e.g. "https://api.example.com")
//
// and returns an `EndpointCaller<TPath, TResponse>`.
//
// Runtime behaviour:
//   a. Replace each `:param` segment in `def.path` with the matching
//      value from `options.pathParams` (if present).
//   b. Append `options.queryParams` as a URLSearchParams query string.
//   c. Call the global `fetch` with the constructed URL, the correct
//      method, any provided headers, and JSON-stringified body (when
//      `options.body` is defined).
//   d. If the response is `ok`, parse the JSON and return
//      `{ ok: true, status, data }`.
//   e. Otherwise read the response text and return
//      `{ ok: false, status, error }`.
//   f. If `fetch` itself throws (network error), return
//      `{ ok: false, status: 0, error: <message> }`.
// ------------------------------------------------------------
export function buildCaller<TPath extends string, TResponse>(
  def: EndpointDef<TPath, TResponse>,
  baseUrl: string
): EndpointCaller<TPath, TResponse> {
  // TODO: implement the fetch wrapper following rules (a)–(f) above
  throw new Error("Not implemented");
}

// ------------------------------------------------------------
// 9. `createApiClient` — convenience factory
//
// TODO (Requirement 6): Implement `createApiClient` which accepts:
//   - `baseUrl`: string
//   - `endpoints`: a Record whose values are `EndpointDef` objects
//
// and returns a mapped object where each key is replaced by its
// corresponding `EndpointCaller`.
//
// The return type must be inferred — do NOT write it manually.
// Hint: use a mapped type over the keys of `TEndpoints`.
// ------------------------------------------------------------
export type ApiClient<TEndpoints extends Record<string, EndpointDef<string, unknown>>> = {
  [K in keyof TEndpoints]: TEndpoints[K] extends EndpointDef<infer TPath, infer TResponse>
    ? EndpointCaller<TPath, TResponse>
    : never;
};

export function createApiClient<
  TEndpoints extends Record<string, EndpointDef<string, unknown>>
>(
  baseUrl: string,
  endpoints: TEndpoints
): ApiClient<TEndpoints> {
  // TODO: iterate over `endpoints`, call `buildCaller` for each,
  // and return the resulting object cast to `ApiClient<TEndpoints>`.
  // (A single `as ApiClient<TEndpoints>` cast on the final return is acceptable here.)
  throw new Error("Not implemented");
}
