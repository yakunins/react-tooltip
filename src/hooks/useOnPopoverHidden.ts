import { useEffect, type RefObject } from 'react';

import { useEventListener } from './useEventListener';
import { useLatestRef } from './useLatestRef';

// While `active`, calls `callback` once the popover is hidden: right away if
// it already is, else on its toggle to closed (it fades out while still open).
export const useOnPopoverHidden = (
  popoverRef: RefObject<HTMLElement>,
  active: boolean,
  callback: () => void
): void => {
  const callbackRef = useLatestRef(callback);
  useEffect(() => {
    if (active && !popoverRef.current?.matches(':popover-open'))
      callbackRef.current();
  }, [active, popoverRef, callbackRef]);
  useEventListener<ToggleEvent>(
    popoverRef,
    'toggle',
    e => {
      if (e.newState === 'closed') callback();
    },
    active
  );
};
