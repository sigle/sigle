// https://www.codemzy.com/blog/reactjs-debounce-hook
import React from "react";

// debounce function (defaults wait to .2 seconds)
const debounce = <Args extends unknown[]>(
  func: (...args: Args) => void,
  wait = 200,
) => {
  // oxlint-disable-next-line init-declarations timeout will be initialized later
  let timeout: NodeJS.Timeout;
  // The arguments of the call waiting for the timeout, null when none is.
  let pendingArgs: Args | null = null;

  function executedFunction(...args: Args) {
    pendingArgs = args;
    clearTimeout(timeout);
    timeout = setTimeout(() => executedFunction.flush(), wait);
  }

  // Runs the pending call now, if there is one.
  executedFunction.flush = () => {
    clearTimeout(timeout);

    if (pendingArgs === null) return;
    const args = pendingArgs;
    pendingArgs = null;
    func(...args);
  };

  executedFunction.cancel = () => {
    clearTimeout(timeout);
    pendingArgs = null;
  };

  return executedFunction;
};

// hook for using the debounce function
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay = 1000,
  deps: React.DependencyList = [],
) {
  // debounce the callback
  // oxlint-disable-next-line exhaustive-deps
  const debouncedCallback = React.useCallback(debounce(callback, delay), [
    delay,
    ...deps,
    // oxlint-disable-next-line exhaustive-deps
  ]); // with the delay

  // run any pending call on unmount or dependency change, so it isn't lost
  // oxlint-disable-next-line exhaustive-deps
  React.useEffect(() => {
    return () => {
      debouncedCallback.flush();
    };
    // oxlint-disable-next-line exhaustive-deps
  }, [delay, ...deps]);

  // return the debounce function so we can use it
  return debouncedCallback;
}
