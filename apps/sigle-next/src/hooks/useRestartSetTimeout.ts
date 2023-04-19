import { useRef } from 'react';

export const useRestartSetTimeout = () => {
  let ref = useRef<NodeJS.Timeout | null>(null);

  return (timer: NodeJS.Timeout) => {
    if (ref.current) {
      clearTimeout(ref.current);
    }
    ref.current = timer;
  };
};
