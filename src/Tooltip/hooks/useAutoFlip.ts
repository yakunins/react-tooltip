import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';

import type { Placement } from '../../types';

const OPPOSITE: Record<Placement, Placement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

// autoFlip tuning.
// FLIP_THRESHOLD: how close (px) the bubble may come to a viewport edge before
// flipping — used both as the IntersectionObserver rootMargin (the trigger)
// and as the slack in the fit test (the decision).
// AUTOFLIP_THROTTLE_MS: max re-evaluation rate while a tooltip is open, so fast
// scrolling can't thrash the placement.
const FLIP_THRESHOLD = 10;
const AUTOFLIP_THROTTLE_MS = 500;

export interface AutoFlipParams {
  /** External anchor element (anchorRef mode), if any. */
  anchorRef?: RefObject<HTMLElement>;
  /** The wrapper element rendered in wrapping mode. */
  internalAnchorRef: RefObject<HTMLElement>;
  /** The popover (bubble) element being placed. */
  popoverRef: RefObject<HTMLElement>;
  /** Preferred side. */
  placement: Placement;
  /** Whether to flip away from the preferred side near a viewport edge. */
  autoFlip: boolean;
  /** Only observe while open. */
  isOpen: boolean;
  /** No styled bubble (and so no flipping) in the title fallback. */
  supported: boolean;
  /**
   * True while the tooltip is held open by focus or a pinning click. A tooltip
   * shown purely by hover is never autoflipped (it can't track the cursor on
   * scroll anyway); focus or a pin re-enables flipping.
   */
  heldRef?: MutableRefObject<boolean>;
  /** Parent owns `open`; such a tooltip always flips. */
  isControlled?: boolean;
}

/**
 * Returns the *effective* placement: the preferred `placement`, flipped to the
 * opposite side when it would overflow the viewport.
 *
 * An IntersectionObserver on the bubble (rootMargin = -FLIP_THRESHOLD) fires
 * whenever it comes within the threshold of a viewport edge — on scroll, anchor
 * movement, or open — and re-runs a (throttled) decision that reads geometry
 * only (no measure→render→remeasure). The decision is sticky on the current
 * side — it flips only when that side runs out of room — so a side regaining
 * space never pulls the bubble back and the placement can't oscillate. The
 * preferred `placement` is re-established as the starting side on each open.
 */
export const useAutoFlip = ({
  anchorRef,
  internalAnchorRef,
  popoverRef,
  placement,
  autoFlip,
  isOpen,
  supported,
  heldRef,
  isControlled,
}: AutoFlipParams): Placement => {
  const [effectivePlacement, setEffectivePlacement] =
    useState<Placement>(placement);
  const effectivePlacementRef = useRef(effectivePlacement);
  effectivePlacementRef.current = effectivePlacement;

  const decidePlacement = useCallback(() => {
    // A tooltip shown purely by hover never autoflips; only flip when it's
    // held by focus or a pin, or owned by the parent (controlled).
    if (!isControlled && heldRef && !heldRef.current) return;
    const anchorEl = anchorRef?.current ?? internalAnchorRef.current;
    const pop = popoverRef.current;
    if (!anchorEl || !pop) return;
    const a = anchorEl.getBoundingClientRect();
    const p = pop.getBoundingClientRect();
    if (!p.width && !p.height) return; // not shown yet — nothing to measure
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const space: Record<Placement, number> = {
      top: a.top,
      bottom: vh - a.bottom,
      left: a.left,
      right: vw - a.right,
    };
    const need: Record<Placement, number> = {
      top: p.height,
      bottom: p.height,
      left: p.width,
      right: p.width,
    };
    // Sticky on the *current* side: keep it as long as its outer edge still has
    // room, and flip to the opposite only when the current side runs out. This
    // is what stops the oscillation — a side that regains room while the bubble
    // sits comfortably on the opposite side no longer pulls it back. The
    // preferred `placement` is re-established as the starting side on each open
    // (reset effect below), so this only governs flips within one open session.
    const current = effectivePlacementRef.current;
    const opp = OPPOSITE[current];
    let next: Placement;
    if (space[current] >= need[current] + FLIP_THRESHOLD) {
      next = current;
    } else if (space[opp] >= need[opp] + FLIP_THRESHOLD) {
      next = opp;
    } else {
      next = space[current] >= space[opp] ? current : opp;
    }
    setEffectivePlacement(prev => (prev === next ? prev : next));
  }, [anchorRef, internalAnchorRef, popoverRef, heldRef, isControlled]);

  // Throttle re-evaluation to AUTOFLIP_THROTTLE_MS (leading + trailing).
  const lastDecideRef = useRef(0);
  const decideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const scheduleDecide = useCallback(() => {
    const elapsed = performance.now() - lastDecideRef.current;
    if (elapsed >= AUTOFLIP_THROTTLE_MS) {
      lastDecideRef.current = performance.now();
      decidePlacement();
    } else {
      clearTimeout(decideTimerRef.current);
      decideTimerRef.current = setTimeout(() => {
        lastDecideRef.current = performance.now();
        decidePlacement();
      }, AUTOFLIP_THROTTLE_MS - elapsed);
    }
  }, [decidePlacement]);

  // --- autoFlip off: the effective placement is simply `placement` ---
  useEffect(() => {
    if (!autoFlip) setEffectivePlacement(placement);
  }, [autoFlip, placement]);

  // --- reset to the preferred side on each open and whenever `placement`
  // changes; the sticky decision above then governs flips within that open
  // session (so a reopen always starts from the requested side) ---
  useEffect(() => {
    if (autoFlip && isOpen) setEffectivePlacement(placement);
  }, [autoFlip, isOpen, placement]);

  // --- autoFlip on: re-evaluate the side while the tooltip is open ---
  useEffect(() => {
    if (!autoFlip || !isOpen || !supported) return;
    const pop = popoverRef.current;
    if (!pop || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(scheduleDecide, {
      rootMargin: `-${FLIP_THRESHOLD}px`,
      threshold: [0, 1],
    });
    io.observe(pop);
    return () => {
      io.disconnect();
      clearTimeout(decideTimerRef.current);
    };
  }, [autoFlip, isOpen, supported, scheduleDecide, popoverRef]);

  return effectivePlacement;
};
