import { useCallback, useRef } from 'react';

// Runs `fn` at most once per `ms`, leading and trailing. `cancel` drops a
// pending trailing call.
export const useThrottledCallback = (
  fn: () => void,
  ms: number
): { run: () => void; cancel: () => void } => {
  const lastRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const run = useCallback(() => {
    const elapsed = performance.now() - lastRef.current;
    clearTimeout(timerRef.current);
    if (elapsed >= ms) {
      lastRef.current = performance.now();
      fn();
    } else {
      timerRef.current = setTimeout(() => {
        lastRef.current = performance.now();
        fn();
      }, ms - elapsed);
    }
  }, [fn, ms]);

  const cancel = useCallback(() => clearTimeout(timerRef.current), []);

  return { run, cancel };
};
