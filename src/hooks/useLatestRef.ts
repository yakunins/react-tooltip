import { useRef, type MutableRefObject } from 'react';

import { useIsoLayoutEffect } from './useIsoLayoutEffect';

// A ref holding the latest committed value, for handlers and effects that must
// not read stale props. Updated in a layout effect, not during render, so a
// discarded render (Strict Mode, concurrent rendering) never leaks into it.
export const useLatestRef = <T>(value: T): MutableRefObject<T> => {
  const ref = useRef(value);
  useIsoLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
};
