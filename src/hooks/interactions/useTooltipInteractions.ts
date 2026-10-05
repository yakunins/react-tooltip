import {
  useCallback,
  useEffect,
  type MutableRefObject,
  type RefObject,
} from 'react';

import type { TooltipTrigger } from '../../types';
import { useClickToggle } from './useClickToggle';
import type { SetOpen } from '../useControllableOpen';
import { useKeepOpen } from './useKeepOpen';
import { useOutsideClick } from '../useOutsideClick';
import { useDelayedToggle } from './useDelayedToggle';
import { useEscape } from '../useEscape';

export interface TooltipInteractionsParams {
  anchor: HTMLElement | null;
  popoverRef: RefObject<HTMLElement>;
  triggers: TooltipTrigger[];
  showDelay: number;
  hideDelay: number;
  clickGuard: number;
  minVisibleTime: number;
  // False in the title fallback: no popover to wire.
  anchorPositioning: boolean;
  isOpen: boolean;
  isControlled: boolean;
  setOpen: SetOpen;
}

export interface TooltipInteractionsResult {
  // Kept open by focus or a click; a hover-only tooltip never flips.
  keptOpenRef: MutableRefObject<boolean>;
}

// Wires hover / focus / click onto the anchor and bubble; Escape closes.
export const useTooltipInteractions = ({
  anchor,
  popoverRef,
  triggers,
  showDelay,
  hideDelay,
  clickGuard,
  minVisibleTime,
  anchorPositioning,
  isOpen,
  isControlled,
  setOpen,
}: TooltipInteractionsParams): TooltipInteractionsResult => {
  const delayed = useDelayedToggle({
    showDelay,
    hideDelay,
    minVisibleTime,
    isOpen,
    setOpen,
  });
  const keepOpen = useKeepOpen({ isOpen, isControlled });
  const { focusRef, clickRef, set: setKeepOpen } = keepOpen;
  const onClick = useClickToggle({
    isOpen,
    clickGuard,
    delayed,
    keepOpen,
    setOpen,
  });

  const useHover = triggers.includes('hover');
  const useFocus = triggers.includes('focus');
  const useClick = triggers.includes('click');

  const closeOnHover = useCallback(
    (e?: Event) => {
      if (keepOpen.ref.current) return;
      delayed.close(e);
    },
    [delayed.close, keepOpen.ref]
  );

  useEffect(() => {
    if (!anchorPositioning) return;
    // By-name mode has no element to listen to.
    const popover = popoverRef.current;
    if (!anchor) return;

    const cleanups: Array<() => void> = [];
    const on = (el: HTMLElement, type: string, fn: (e: Event) => void) => {
      el.addEventListener(type, fn);
      cleanups.push(() => el.removeEventListener(type, fn));
    };

    if (useHover) {
      on(anchor, 'mouseenter', delayed.open);
      on(anchor, 'mouseleave', closeOnHover);
      // stay open while the pointer is over the bubble
      if (popover) {
        on(popover, 'mouseenter', delayed.open);
        on(popover, 'mouseleave', closeOnHover);
      }
    }
    // Focus anywhere in anchor + bubble holds it open. The bubble side runs
    // even without the focus trigger, so focused content is never hidden.
    const inScope = (node: EventTarget | null): boolean =>
      node != null &&
      (anchor.contains(node as Node) ||
        Boolean(popover?.contains(node as Node)));
    const keepOpenOnFocus = () => setKeepOpen('focus', true);
    const releaseOnFocusOut = (e: Event) => {
      // A pinned tooltip survives focus leaving (e.g. alt-tab).
      if (!focusRef.current || clickRef.current) return;
      if (inScope((e as FocusEvent).relatedTarget)) return;
      setKeepOpen('focus', false);
      delayed.close(e);
    };

    if (useFocus) {
      on(anchor, 'focusin', (e: Event) => {
        keepOpenOnFocus();
        delayed.open(e);
      });
    }
    on(anchor, 'focusout', releaseOnFocusOut);
    if (popover) {
      on(popover, 'focusin', keepOpenOnFocus);
      on(popover, 'focusout', releaseOnFocusOut);
    }
    if (useClick) on(anchor, 'click', onClick);
    return () => cleanups.forEach(fn => fn());
  }, [
    anchorPositioning,
    useHover,
    useFocus,
    useClick,
    delayed.open,
    delayed.close,
    closeOnHover,
    onClick,
    setKeepOpen,
    focusRef,
    clickRef,
    anchor,
    popoverRef,
  ]);

  const dismiss = () => {
    delayed.cancel();
    setOpen(false);
  };
  useEscape(isOpen, dismiss);
  // While kept open by a click, any other click dismisses, bubble included. Anchor
  // clicks are left to the click trigger's own toggle.
  useOutsideClick(
    useClick ? [anchor] : [],
    dismiss,
    keepOpen.byClick && isOpen
  );

  return { keptOpenRef: keepOpen.ref };
};
