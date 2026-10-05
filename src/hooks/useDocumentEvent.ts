import { useEffect } from 'react';

import { useLatestRef } from './useLatestRef';

// A document listener attached while `enabled`. Added in an effect, so it never
// sees the event that caused the render enabling it.
export const useDocumentEvent = <K extends keyof DocumentEventMap>(
  type: K,
  handler: (e: DocumentEventMap[K]) => void,
  enabled: boolean
): void => {
  const handlerRef = useLatestRef(handler);
  useEffect(() => {
    if (!enabled) return;
    const listener = (e: DocumentEventMap[K]) => handlerRef.current(e);
    document.addEventListener(type, listener);
    return () => document.removeEventListener(type, listener);
  }, [type, enabled, handlerRef]);
};
