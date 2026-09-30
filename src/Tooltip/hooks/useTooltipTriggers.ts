import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';

import type { TooltipTrigger } from '../../types';

interface TouchMouseEvent extends MouseEvent {
  sourceCapabilities?: { firesTouchEvents?: boolean };
}

// Mouse events synthesized after a touch would toggle the tooltip twice.
const isSyntheticFromTouch = (e?: Event): boolean =>
  Boolean(
    (e as TouchMouseEvent | undefined)?.sourceCapabilities?.firesTouchEvents
  );

export interface TooltipTriggersParams {
  anchorRef?: RefObject<HTMLElement>;
  internalAnchorRef: RefObject<HTMLElement>;
  popoverRef: RefObject<HTMLElement>;
  trigger: TooltipTrigger[];
  delayShow: number;
  delayHide: number;
  // Click-to-close is suppressed this long (ms) after a hover/focus reveal.
  clickCloseGuard: number;
  // A hover/focus tooltip stays visible at least this long (ms).
  minVisibleDuration: number;
  // False in the title fallback: no popover to wire.
  supported: boolean;
  isOpen: boolean;
  // A controlled tooltip isn't auto-pinned by defaultOpen.
  isControlled: boolean;
  commitRef: MutableRefObject<(next: boolean) => void>;
}

export interface TooltipTriggersResult {
  // Held open by focus or a pin; autoFlip never flips a hover-only tooltip.
  heldRef: MutableRefObject<boolean>;
}

// Hover/focus open and close after the delays; click toggles and pins, and a
// pinned tooltip is dismissed by Escape or any document click.
export const useTooltipTriggers = ({
  anchorRef,
  internalAnchorRef,
  popoverRef,
  trigger,
  delayShow,
  delayHide,
  clickCloseGuard,
  minVisibleDuration,
  supported,
  isOpen,
  isControlled,
  commitRef,
}: TooltipTriggersParams): TooltipTriggersResult => {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const delaysRef = useRef({
    delayShow,
    delayHide,
    clickCloseGuard,
    minVisibleDuration,
  });
  delaysRef.current = {
    delayShow,
    delayHide,
    clickCloseGuard,
    minVisibleDuration,
  };
  // When it last opened, for the click guard and the minimum-visible window.
  const shownAtRef = useRef(0);

  // Pinned by a click, or by an uncontrolled defaultOpen: survives hover-out,
  // autoflips, and is dismissed by a document click, focus-out or Escape.
  const [pinned, setPinned] = useState(() => !isControlled && isOpen);
  const pinnedRef = useRef(pinned);
  pinnedRef.current = pinned;
  // The pinning click also bubbles to the document dismiss listener; skip it.
  const openingClickRef = useRef<Event | null>(null);

  // Focus actively holding it open, from focusin until hidden or blurred. Not
  // just "anchor focused": a hover-shown tooltip must still hide on mouseleave.
  const focusHoldRef = useRef(false);
  const heldRef = useRef(false);
  heldRef.current = focusHoldRef.current || pinned;

  const openStateRef = useRef(isOpen);
  openStateRef.current = isOpen;

  const useHover = trigger.includes('hover');
  const useFocus = trigger.includes('focus');
  const useClick = trigger.includes('click');

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Refs don't re-render, so recompute `held` after a focus change.
  const syncHeld = useCallback(() => {
    heldRef.current = focusHoldRef.current || pinnedRef.current;
  }, []);

  // Delayed paths for hover and focus only; click commits immediately.
  const scheduleOpen = useCallback(
    (e?: Event) => {
      if (isSyntheticFromTouch(e)) return;
      clearTimer();
      timer.current = setTimeout(() => {
        if (!openStateRef.current) shownAtRef.current = performance.now();
        commitRef.current(true);
      }, delaysRef.current.delayShow);
    },
    [clearTimer, commitRef]
  );

  const scheduleClose = useCallback(
    (e?: Event) => {
      if (isSyntheticFromTouch(e)) return;
      clearTimer();
      // Stretch the hide delay so it never fires before minVisibleDuration.
      const { delayHide, minVisibleDuration } = delaysRef.current;
      const elapsed = performance.now() - shownAtRef.current;
      const delay = Math.max(delayHide, minVisibleDuration - elapsed);
      timer.current = setTimeout(() => commitRef.current(false), delay);
    },
    [clearTimer, commitRef]
  );

  // Toggle; within clickCloseGuard of a hover/focus reveal a click pins
  // instead, so a click right after the reveal doesn't dismiss it.
  const onClick = useCallback(
    (e?: Event) => {
      if (isSyntheticFromTouch(e)) return;
      clearTimer();
      if (openStateRef.current) {
        const guard = delaysRef.current.clickCloseGuard;
        const guarded =
          !pinnedRef.current &&
          guard > 0 &&
          performance.now() - shownAtRef.current < guard;
        if (guarded) {
          openingClickRef.current = e ?? null;
          setPinned(true);
          heldRef.current = true;
          return;
        }
        setPinned(false);
        commitRef.current(false);
        return;
      }
      shownAtRef.current = performance.now();
      openingClickRef.current = e ?? null;
      setPinned(true);
      heldRef.current = true;
      commitRef.current(true);
    },
    [clearTimer, commitRef]
  );

  const closeOnHover = useCallback(
    (e?: Event) => {
      if (pinnedRef.current || focusHoldRef.current) return;
      scheduleClose(e);
    },
    [scheduleClose]
  );

  useEffect(() => clearTimer, [clearTimer]);

  useEffect(() => {
    if (!supported) return;
    // By-name mode has no element to listen to.
    const anchor = anchorRef?.current ?? internalAnchorRef.current;
    const popover = popoverRef.current;
    if (!anchor) return;

    const cleanups: Array<() => void> = [];
    const on = (el: HTMLElement, type: string, fn: (e: Event) => void) => {
      el.addEventListener(type, fn);
      cleanups.push(() => el.removeEventListener(type, fn));
    };

    if (useHover) {
      on(anchor, 'mouseenter', scheduleOpen);
      on(anchor, 'mouseleave', closeOnHover);
      // stay open while the pointer is over the bubble
      if (popover) {
        on(popover, 'mouseenter', scheduleOpen);
        on(popover, 'mouseleave', closeOnHover);
      }
    }
    // Focus anywhere in anchor + bubble holds it open. The bubble side runs
    // even without the focus trigger, so focused content is never hidden.
    const inScope = (node: EventTarget | null): boolean =>
      node != null &&
      (anchor.contains(node as Node) ||
        Boolean(popover?.contains(node as Node)));
    const holdOnFocus = () => {
      focusHoldRef.current = true;
      syncHeld();
    };
    const releaseOnFocusOut = (e: Event) => {
      if (!focusHoldRef.current) return;
      // A pinned tooltip survives focus leaving (e.g. alt-tab).
      if (pinnedRef.current) return;
      if (inScope((e as FocusEvent).relatedTarget)) return;
      focusHoldRef.current = false;
      syncHeld();
      scheduleClose(e);
    };

    if (useFocus) {
      on(anchor, 'focusin', (e: Event) => {
        holdOnFocus();
        scheduleOpen(e);
      });
    }
    on(anchor, 'focusout', releaseOnFocusOut);
    if (popover) {
      on(popover, 'focusin', holdOnFocus);
      on(popover, 'focusout', releaseOnFocusOut);
    }
    if (useClick) {
      on(anchor, 'click', onClick);
    }
    return () => cleanups.forEach(fn => fn());
  }, [
    supported,
    useHover,
    useFocus,
    useClick,
    scheduleOpen,
    scheduleClose,
    closeOnHover,
    onClick,
    syncHeld,
    anchorRef,
    internalAnchorRef,
    popoverRef,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTimer();
        commitRef.current(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, clearTimer, commitRef]);

  useEffect(() => {
    if (!isOpen) setPinned(false);
  }, [isOpen]);

  // Release the focus-hold on close. Falling edge only, so the focusin during
  // the open delay (isOpen still false) isn't clobbered.
  const prevOpenRef = useRef(isOpen);
  useEffect(() => {
    if (prevOpenRef.current && !isOpen) {
      focusHoldRef.current = false;
      syncHeld();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, syncHeld]);

  // While pinned any click dismisses, bubble included. Added in an effect, so
  // it runs after the pinning click has propagated.
  useEffect(() => {
    if (!pinned || !isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (e === openingClickRef.current) {
        openingClickRef.current = null;
        return;
      }
      clearTimer();
      commitRef.current(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [pinned, isOpen, clearTimer, commitRef]);

  return { heldRef };
};
