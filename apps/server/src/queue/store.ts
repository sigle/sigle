import { Effect, Layer } from "effect";
import { PersistedQueue } from "effect/persistence";

/**
 * SQL-backed persisted queue store. Initializing it creates the
 * `effect_queue` table and indexes; it does not start any worker.
 *
 * The store polls every queue each second from fibers it forks itself, which
 * would make a trace of every poll. They inherit this disabled tracer, while
 * `offer` and the job spans run in their callers' fibers and stay traced.
 */
export const QueueStoreLive = Layer.effect(
  PersistedQueue.PersistedQueueStore,
  PersistedQueue.makeStoreSql().pipe(Effect.withTracerEnabled(false)),
).pipe(Layer.orDie);

/** Store plus the queue factory, without any workers. */
export const QueueServicesLive = PersistedQueue.layer.pipe(
  Layer.provideMerge(QueueStoreLive),
);
