import { useCallback, type RefObject } from 'react';

import { useIsoLayoutEffect } from './useIsoLayoutEffect';

// showPopover/hidePopover throw if the element is in the wrong state.
const toggle = (el: HTMLElement | null, show: boolean) => {
  if (!el) return;
  if (el.matches(':popover-open') === show) return;
  try {
    if (show) el.showPopover();
    else el.hidePopover();
  } catch {
    // already in the requested state
  }
};

// Shows the native popover on open, in a layout effect so it is measurable
// before the other hooks' effects run. Returns `hide`: the caller hides it once
// the fade-out has finished.
export const usePopover = (
  popoverRef: RefObject<HTMLElement>,
  isOpen: boolean
): (() => void) => {
  useIsoLayoutEffect(() => {
    if (isOpen) toggle(popoverRef.current, true);
  }, [isOpen, popoverRef]);
  return useCallback(() => toggle(popoverRef.current, false), [popoverRef]);
};
