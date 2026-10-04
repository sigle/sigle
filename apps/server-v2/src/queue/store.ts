import { Layer } from "effect";
import { PersistedQueue } from "effect/persistence";

/**
 * SQL-backed persisted queue store. Initializing it creates the
 * `effect_queue` table and indexes; it does not start any worker.
 */
export const QueueStoreLive = PersistedQueue.layerStoreSql().pipe(Layer.orDie);

/** Store plus the queue factory, without any workers. */
export const QueueServicesLive = PersistedQueue.layer.pipe(
  Layer.provideMerge(QueueStoreLive),
);
