import { Layer } from "effect";
import { RateLimiter } from "effect/persistence";

/**
 * `RateLimiter` backed by a process-local in-memory store. Every limit is a
 * one-minute window, so a restart only gives each client a fresh window. The
 * server runs as a single instance, so the counters are not shared, and the
 * store sweeps expired entries itself. Keeping them out of SQLite spares
 * every request a write transaction and Litestream an upload.
 */
export const RateLimiterLive: Layer.Layer<RateLimiter.RateLimiter> =
  RateLimiter.layer.pipe(Layer.provide(RateLimiter.layerStoreMemory));
