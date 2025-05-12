// https://www.codemzy.com/blog/reactjs-debounce-hook
import React from "react";

// debounce function (defaults wait to .2 seconds)
// biome-ignore lint/suspicious/noExplicitAny: any is fine
const debounce = (func: any, wait = 200) => {
  let timeout: NodeJS.Timeout; // for the setTimeout function and so it can be cleared
  // biome-ignore lint/suspicious/noExplicitAny: any is fine
  function executedFunction(...args: any) {
    // the function returned from debounce
    const later = () => {
      // this is the delayed function
      clearTimeout(timeout); // clears the timeout when the function is called
      func(...args); // calls the function
    };
    clearTimeout(timeout); // this clears the timeout each time the function is run again preventing later from running until we stop calling the function
    timeout = setTimeout(later, wait); // this sets the time out to run after the wait period
  }
  executedFunction.cancel = () => {
    // so can be cancelled
    clearTimeout(timeout); // clears the timeout
  };
  return executedFunction;
};

// hook for using the debounce function
export function useDebouncedCallback(
  // biome-ignore lint/suspicious/noExplicitAny: any is fine
  callback: any,
  delay = 1000,
  // biome-ignore lint/suspicious/noExplicitAny: any is fine
  deps: any[] = [],
) {
  // debounce the callback
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const debouncedCallback = React.useCallback(debounce(callback, delay), [
    delay,
    ...deps,
  ]); // with the delay
  // clean up on unmount or dependency change
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    return () => {
      debouncedCallback.cancel(); // cancel any pending calls
    };
  }, [delay, ...deps]);
  // return the debounce function so we can use it
  return debouncedCallback;
}
