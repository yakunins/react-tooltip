import { useRef, type MutableRefObject } from 'react';

import { useIsoLayoutEffect } from './useIsoLayoutEffect';

// The latest committed value, for handlers that must not read stale props.
// Set in a layout effect, so a discarded render never leaks into it.
export const useLatestRef = <T>(value: T): MutableRefObject<T> => {
  const ref = useRef(value);
  useIsoLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
};
