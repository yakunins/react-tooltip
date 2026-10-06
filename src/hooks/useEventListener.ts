import { useEffect, type RefObject } from 'react';

import { useLatestRef } from './useLatestRef';

type Target = EventTarget | RefObject<EventTarget> | null | undefined;

const resolve = (target: Target): EventTarget | null | undefined =>
  target && 'current' in target ? target.current : target;

// Listens on `target` (element, document, window or a ref) while `enabled`,
// calling the latest handler. Added in an effect, so it never sees the event
// that caused the render enabling it.
export const useEventListener = <E extends Event = Event>(
  target: Target,
  type: string,
  handler: (e: E) => void,
  enabled = true
): void => {
  const handlerRef = useLatestRef(handler);
  useEffect(() => {
    const el = resolve(target);
    if (!enabled || !el) return;
    const listener = (e: Event) => handlerRef.current(e as E);
    el.addEventListener(type, listener);
    return () => el.removeEventListener(type, listener);
  }, [target, type, enabled, handlerRef]);
};
