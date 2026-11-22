/**
 * Header holding the visitor's IP, set by Railway's edge on public requests.
 * The API rate limits by it (`CLIENT_IP_HEADER`), so the website forwards the
 * visitor's IP in it on its server-side calls over the private network, where
 * the edge doesn't set it.
 */
export const VISITOR_IP_HEADER = "x-real-ip";

/**
 * `instrumentation.ts` stores the IP of the request being handled under this
 * key, in an `AsyncLocalStorage`. It is a global because instrumentation and
 * the app are separate bundles, each with its own copy of this module.
 */
const VISITOR_IP_STORE = Symbol.for("sigle.visitorIp");

interface VisitorIpStore {
  getStore(): string | undefined;
}

// SAFETY: only this module reads or writes the `VISITOR_IP_STORE` property,
// always with a `VisitorIpStore`.
const globalStore = globalThis as { [VISITOR_IP_STORE]?: VisitorIpStore };

export const setVisitorIpStore = (store: VisitorIpStore) => {
  globalStore[VISITOR_IP_STORE] = store;
};

/**
 * IP of the visitor whose request the server is handling, undefined in the
 * browser, outside a request, or when the edge sent none.
 */
export const currentVisitorIp = (): string | undefined =>
  globalStore[VISITOR_IP_STORE]?.getStore();
