import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from 'react';

import { isSyntheticFromTouch } from '../../utils/dom';
import type { SetOpen } from '../useControllableOpen';
import { useLatestRef } from '../useLatestRef';

export interface DelayedToggle {
  open: (e?: Event) => void;
  close: (e?: Event) => void;
  cancel: () => void;
  // When it last opened, for the click guard and the minimum-visible window.
  openedAtRef: MutableRefObject<number>;
}

export interface DelayedToggleParams {
  showDelay: number;
  hideDelay: number;
  // A hover/focus tooltip stays visible at least this long (ms).
  minVisibleTime: number;
  isOpen: boolean;
  setOpen: SetOpen;
}

// The delayed open/close used by hover and focus (click acts immediately).
export const useDelayedToggle = ({
  showDelay,
  hideDelay,
  minVisibleTime,
  isOpen,
  setOpen,
}: DelayedToggleParams): DelayedToggle => {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const delaysRef = useLatestRef({ showDelay, hideDelay, minVisibleTime });
  const openRef = useLatestRef(isOpen);
  const openedAtRef = useRef(0);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const open = useCallback(
    (e?: Event) => {
      if (isSyntheticFromTouch(e)) return;
      cancel();
      timer.current = setTimeout(() => {
        if (!openRef.current) openedAtRef.current = performance.now();
        setOpen(true);
      }, delaysRef.current.showDelay);
    },
    [cancel, setOpen, delaysRef, openRef]
  );

  const close = useCallback(
    (e?: Event) => {
      if (isSyntheticFromTouch(e)) return;
      cancel();
      // Stretch the hide delay so it never fires before minVisibleTime.
      const { hideDelay, minVisibleTime } = delaysRef.current;
      const elapsed = performance.now() - openedAtRef.current;
      const delay = Math.max(hideDelay, minVisibleTime - elapsed);
      timer.current = setTimeout(() => setOpen(false), delay);
    },
    [cancel, setOpen, delaysRef]
  );

  useEffect(() => cancel, [cancel]);

  return useMemo(
    () => ({ open, close, cancel, openedAtRef }),
    [open, close, cancel]
  );
};
