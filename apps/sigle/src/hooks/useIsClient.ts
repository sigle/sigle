// https://usehooks-ts.com/react-hook/use-is-client
import { useSyncExternalStore } from "react";

// Nothing changes once on the client, so there is nothing to subscribe to.
const subscribe = () => () => {};

/**
 * `false` on the server and during hydration, `true` on the client after.
 */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
