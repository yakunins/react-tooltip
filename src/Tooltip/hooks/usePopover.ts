import { useEffect, type RefObject } from 'react';

/** Drives the native Popover API (`showPopover` / `hidePopover`) from `isOpen`. */
export const usePopover = (
  popoverRef: RefObject<HTMLElement>,
  isOpen: boolean
): void => {
  useEffect(() => {
    const el = popoverRef.current;
    if (!el || typeof el.showPopover !== 'function') return;
    const shown = el.matches(':popover-open');
    try {
      if (isOpen && !shown) el.showPopover();
      else if (!isOpen && shown) el.hidePopover();
    } catch {
      // showPopover/hidePopover throw if the element is in the wrong state
    }
  }, [isOpen, popoverRef]);
};
