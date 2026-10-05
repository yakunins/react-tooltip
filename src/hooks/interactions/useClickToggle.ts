import { useCallback } from 'react';

import { isSyntheticFromTouch } from '../../utils/dom';
import type { SetOpen } from '../useControllableOpen';
import type { KeepOpen } from './useKeepOpen';
import { useLatestRef } from '../useLatestRef';
import type { DelayedToggle } from './useDelayedToggle';

export interface ClickToggleParams {
  isOpen: boolean;
  // Click-to-close is suppressed this long (ms) after a hover/focus reveal.
  clickGuard: number;
  delayed: DelayedToggle;
  keepOpen: KeepOpen;
  setOpen: SetOpen;
}

// The anchor's click handler: opens and keeps it open, or closes. Within
// clickGuard of a hover/focus reveal a click keeps it open instead of closing,
// so a click right after the reveal doesn't dismiss it.
export const useClickToggle = ({
  isOpen,
  clickGuard,
  delayed,
  keepOpen,
  setOpen,
}: ClickToggleParams) => {
  const openRef = useLatestRef(isOpen);
  const guardRef = useLatestRef(clickGuard);
  const { cancel, openedAtRef } = delayed;
  const { clickRef, set } = keepOpen;

  return useCallback(
    (e?: Event) => {
      if (isSyntheticFromTouch(e)) return;
      cancel();
      if (!openRef.current) {
        openedAtRef.current = performance.now();
        set('click', true);
        setOpen(true);
        return;
      }
      const guard = guardRef.current;
      const justRevealed =
        !clickRef.current &&
        guard > 0 &&
        performance.now() - openedAtRef.current < guard;
      if (justRevealed) return set('click', true);
      set('click', false);
      setOpen(false);
    },
    [cancel, openedAtRef, clickRef, set, setOpen, openRef, guardRef]
  );
};
