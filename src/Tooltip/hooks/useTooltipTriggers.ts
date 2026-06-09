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

// Browsers fire synthetic mouse events after a touch — those must be ignored
// so the tooltip is not toggled twice on a single tap.
const isSyntheticFromTouch = (e?: Event): boolean =>
  Boolean(
    (e as TouchMouseEvent | undefined)?.sourceCapabilities?.firesTouchEvents
  );

export interface TooltipTriggersParams {
  /** External anchor element (anchorRef mode), if any. */
  anchorRef?: RefObject<HTMLElement>;
  /** The wrapper element rendered in wrapping mode. */
  internalAnchorRef: RefObject<HTMLElement>;
  /** The popover element (kept open while hovered). */
  popoverRef: RefObject<HTMLElement>;
  /** Interactions that reveal the tooltip. */
  trigger: TooltipTrigger[];
  /** Delay before showing on hover/focus, ms. */
  delayShow: number;
  /** Delay before hiding on hover-out/blur, ms. */
  delayHide: number;
  /** Suppress click-to-close for this many ms after a hover/focus reveal. */
  clickCloseGuard: number;
  /** Keep a hover/focus tooltip visible at least this many ms from opening. */
  minVisibleDuration: number;
  /** False when degraded to the native `title` fallback (no popover to wire). */
  supported: boolean;
  /** Current open state — gates Escape / outside-click dismissal. */
  isOpen: boolean;
  /** Parent owns `open` — a controlled tooltip is not auto-pinned by defaultOpen. */
  isControlled: boolean;
  /** Stable committer that flips the open state. */
  commitRef: MutableRefObject<(next: boolean) => void>;
}

export interface TooltipTriggersResult {
  /**
   * True while the tooltip is held open by focus or a pinning click — the
   * "non-hover" holds. autoFlip uses this (with `isControlled`) so a tooltip
   * shown purely by hover is never autoflipped; focus re-enables it.
   */
  heldRef: MutableRefObject<boolean>;
}

/**
 * Wires the configured triggers onto the anchor (and the popover for hover):
 *
 *   - hover / focus open and close after `delayShow` / `delayHide`;
 *   - click *toggles* — a shown tooltip hides, a hidden one shows and pins
 *     (surviving hover-out); a pinned tooltip is dismissed by Escape or an
 *     outside (document) click.
 *
 * `focusHold` keeps the tooltip open across a mouseleave while the anchor stays
 * focused; it's released once the tooltip is next hidden or the anchor blurs.
 */
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
  // Timestamp (performance.now) of the last show, for the click-close guard
  // and the minimum-visible window.
  const shownAtRef = useRef(0);

  // `pinned` = held open by a click — or, equivalently, open from the start via
  // an uncontrolled `defaultOpen`. Either way it behaves like a click-opened
  // tooltip: it suppresses the hover-out close, autoflips (heldRef), and is
  // dismissed by any document click, a focus-out, or Escape.
  const [pinned, setPinned] = useState(() => !isControlled && isOpen);
  const pinnedRef = useRef(pinned);
  pinnedRef.current = pinned;
  // The click that pins the tooltip open also bubbles to the document, where
  // the dismiss listener lives — remember it so that listener can skip it.
  const openingClickRef = useRef<Event | null>(null);

  // `focusHold` = focus is *actively* keeping the tooltip open: true from a
  // focusin until the tooltip is next hidden or the anchor blurs. Plain "anchor
  // is focused" isn't enough — a hover-shown tooltip must still hide on
  // mouseleave even while the anchor happens to be focused.
  const focusHoldRef = useRef(false);
  // `held` = focus or pin is holding the tooltip open (the non-hover holds).
  const heldRef = useRef(false);
  heldRef.current = focusHoldRef.current || pinned;

  // Current open state, read by the click toggle without stale closures.
  const openStateRef = useRef(isOpen);
  openStateRef.current = isOpen;

  const useHover = trigger.includes('hover');
  const useFocus = trigger.includes('focus');
  const useClick = trigger.includes('click');

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Recompute `held` after a focus change (refs don't re-render).
  const syncHeld = useCallback(() => {
    heldRef.current = focusHoldRef.current || pinnedRef.current;
  }, []);

  // The delayed open/close paths, used by the hover and focus triggers only.
  // Click commits immediately, so `delayShow` / `delayHide` never apply to it.
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
      // Keep the tooltip visible for at least minVisibleDuration from when it
      // opened: stretch the hide delay so it never fires before that window
      // closes. Only this hover-out / focus-out path is held back; click and
      // Escape commit the close immediately.
      const { delayHide, minVisibleDuration } = delaysRef.current;
      const elapsed = performance.now() - shownAtRef.current;
      const delay = Math.max(delayHide, minVisibleDuration - elapsed);
      timer.current = setTimeout(() => commitRef.current(false), delay);
    },
    [clearTimer, commitRef]
  );

  // Click toggles: a shown tooltip hides; a hidden one shows and pins (so it
  // survives hover-out). A pinned tooltip is also dismissed by an outside click
  // (document listener below) or Escape.
  //
  // Guard: if the tooltip was just revealed by hover/focus (not yet pinned) and
  // is still within `clickCloseGuard` ms of opening, a click pins it instead of
  // closing — so a click that lands right after the reveal doesn't accidentally
  // dismiss it.
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

  // mouseleave close — suppressed while pinned, or while focus is actively
  // holding the tooltip open. A hover-shown tooltip still closes on mouseleave
  // even if the anchor happens to be focused. focus-out still closes.
  const closeOnHover = useCallback(
    (e?: Event) => {
      if (pinnedRef.current || focusHoldRef.current) return;
      scheduleClose(e);
    },
    [scheduleClose]
  );

  // clear any pending timer on unmount
  useEffect(() => clearTimer, [clearTimer]);

  // --- wire trigger listeners onto the anchor and the popover ---
  useEffect(() => {
    if (!supported) return; // no popover to reveal in the title fallback
    // external-by-ref uses the consumer's element; wrapping uses our own.
    // external-by-name (no ref of any kind) has no element to listen to.
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
      // keep the tooltip open while the pointer is over the bubble itself
      if (popover) {
        on(popover, 'mouseenter', scheduleOpen);
        on(popover, 'mouseleave', closeOnHover);
      }
    }
    // Focus holds the tooltip open while focus is anywhere within the
    // anchor + bubble scope. Tabbing or clicking from the anchor into the
    // bubble (or back) keeps it open; focus leaving the scope entirely closes
    // it. The bubble side runs regardless of the focus trigger, so a focusable
    // element inside the tooltip content (a link, button, ...) is never hidden
    // out from under the user.
    const inScope = (node: EventTarget | null): boolean =>
      node != null &&
      (anchor.contains(node as Node) ||
        Boolean(popover?.contains(node as Node)));
    const holdOnFocus = () => {
      focusHoldRef.current = true;
      syncHeld();
    };
    const releaseOnFocusOut = (e: Event) => {
      // Only act when focus was actually holding the tooltip, and ignore moves
      // that stay inside the scope (anchor <-> bubble).
      if (!focusHoldRef.current) return;
      // A pinned (clicked-open) tooltip is sticky: it survives focus leaving the
      // document, e.g. on window blur / alt-tab. Only an outside click or Escape
      // dismisses it — matching the hover path, which also bails while pinned.
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

  // --- Escape closes the tooltip while it is open ---
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

  // --- clear the pinned flag whenever the tooltip closes, for any reason ---
  useEffect(() => {
    if (!isOpen) setPinned(false);
  }, [isOpen]);

  // --- release the focus-hold whenever the tooltip is hidden (open -> closed),
  // so a later hover-shown tooltip closes on mouseleave even while the anchor
  // stays focused. Falling edge only, to not clobber the focusin during the
  // open delay (when isOpen is still false). ---
  const prevOpenRef = useRef(isOpen);
  useEffect(() => {
    if (prevOpenRef.current && !isOpen) {
      focusHoldRef.current = false;
      syncHeld();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, syncHeld]);

  // --- while pinned, ANY click dismisses ---
  // Added in an effect (which runs after the opening click has propagated), so
  // it never catches the click that pinned the tooltip. Clicks inside the
  // bubble dismiss too, by design.
  useEffect(() => {
    if (!pinned || !isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      // skip the click that opened the tooltip (it bubbles here too)
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
