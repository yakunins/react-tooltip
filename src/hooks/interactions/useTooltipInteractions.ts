import { useCallback, type MutableRefObject, type RefObject } from 'react';

import type { TooltipTrigger } from '../../types';
import type { SetOpen } from '../useControllableOpen';
import { useEscape } from '../useEscape';
import { useEventListener } from '../useEventListener';
import { useOutsideClick } from '../useOutsideClick';
import { useClickToggle } from './useClickToggle';
import { useDelayedToggle } from './useDelayedToggle';
import { useKeepOpen } from './useKeepOpen';

export interface TooltipInteractionsParams {
  anchor: HTMLElement | null;
  popoverRef: RefObject<HTMLElement>;
  triggers: TooltipTrigger[];
  showDelay: number;
  hideDelay: number;
  clickGuard: number;
  minVisibleTime: number;
  // False in the title fallback: no popover to wire.
  styled: boolean;
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
  styled,
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
  const onClick = useClickToggle({
    isOpen,
    clickGuard,
    delayed,
    keepOpen,
    setOpen,
  });

  // Nothing to wire in the title fallback, or by-name (no anchor element).
  const wired = styled && anchor !== null;
  const hoverTrigger = wired && triggers.includes('hover');
  const focusTrigger = wired && triggers.includes('focus');
  const clickTrigger = wired && triggers.includes('click');

  const closeOnHover = useCallback(
    (e: Event) => {
      if (keepOpen.ref.current) return;
      delayed.close(e);
    },
    [delayed, keepOpen.ref]
  );

  // Hover: the bubble counts too, so the pointer can move onto it.
  useEventListener(anchor, 'mouseenter', delayed.open, hoverTrigger);
  useEventListener(anchor, 'mouseleave', closeOnHover, hoverTrigger);
  useEventListener(popoverRef, 'mouseenter', delayed.open, hoverTrigger);
  useEventListener(popoverRef, 'mouseleave', closeOnHover, hoverTrigger);

  // Focus anywhere in anchor + bubble keeps it open. The bubble side runs
  // even without the focus trigger, so focused content is never hidden.
  const keepOpenOnFocus = () => keepOpen.set('focus', true);
  const releaseOnFocusOut = (e: FocusEvent) => {
    // A tooltip kept open by a click survives focus leaving (e.g. alt-tab).
    if (!keepOpen.focusRef.current || keepOpen.clickRef.current) return;
    const next = e.relatedTarget as Node | null;
    if (next && (anchor?.contains(next) || popoverRef.current?.contains(next)))
      return;
    keepOpen.set('focus', false);
    delayed.close(e);
  };
  useEventListener(
    anchor,
    'focusin',
    (e: Event) => {
      keepOpenOnFocus();
      delayed.open(e);
    },
    focusTrigger
  );
  useEventListener(anchor, 'focusout', releaseOnFocusOut, wired);
  useEventListener(popoverRef, 'focusin', keepOpenOnFocus, wired);
  useEventListener(popoverRef, 'focusout', releaseOnFocusOut, wired);

  useEventListener(anchor, 'click', onClick, clickTrigger);

  const dismiss = () => {
    delayed.cancel();
    setOpen(false);
  };
  useEscape(isOpen, dismiss);
  // While kept open by a click, any other click dismisses, bubble included.
  // Anchor clicks are left to the click toggle.
  useOutsideClick(
    clickTrigger ? [anchor] : [],
    dismiss,
    keepOpen.byClick && isOpen
  );

  return { keptOpenRef: keepOpen.ref };
};
