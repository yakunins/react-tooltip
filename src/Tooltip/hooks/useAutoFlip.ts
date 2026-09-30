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

// Edge slack (px), used both as the observer margin and in the fit test.
const FLIP_THRESHOLD = 10;
// Max re-evaluation rate while open, so fast scrolling can't thrash placement.
const AUTOFLIP_THROTTLE_MS = 500;
// Graded ratios re-run the decision as the bubble clips; [0, 1] alone would
// only fire once it has fully left the edge.
const FLIP_RATIOS = Array.from({ length: 21 }, (_, i) => i / 20);

interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// Nearest scrolling ancestor (null = scrolls with the page). It can't clip the
// top-layer bubble, but a bubble sticking out past its edge looks detached.
const findScrollContainer = (el: HTMLElement): HTMLElement | null => {
  const root = document.documentElement;
  for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
    if (p === document.body) break;
    const { overflowX, overflowY } = getComputedStyle(p);
    if (/auto|scroll|hidden|overlay/.test(overflowX + overflowY)) return p;
  }
  return null;
};

// The viewport, narrowed to the scroll container's visible padding box.
const getBounds = (container: HTMLElement | null): Bounds => {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const b: Bounds = { top: 0, left: 0, bottom: vh, right: vw };
  if (container) {
    const r = container.getBoundingClientRect();
    const top = r.top + container.clientTop;
    const left = r.left + container.clientLeft;
    b.top = Math.max(b.top, top);
    b.left = Math.max(b.left, left);
    b.bottom = Math.min(b.bottom, top + container.clientHeight);
    b.right = Math.min(b.right, left + container.clientWidth);
  }
  return b;
};

export interface AutoFlipParams {
  anchorRef?: RefObject<HTMLElement>;
  internalAnchorRef: RefObject<HTMLElement>;
  popoverRef: RefObject<HTMLElement>;
  placement: Placement;
  autoFlip: boolean;
  isOpen: boolean;
  // False in the title fallback: no bubble to flip.
  supported: boolean;
  // Held by focus or a pin; a hover-only tooltip never flips.
  heldRef?: MutableRefObject<boolean>;
  // Parent owns `open`; such a tooltip always flips.
  isControlled?: boolean;
}

// Returns `placement`, flipped to the opposite side when it would overflow the
// viewport or the anchor's scroll container. Sticky, reset after close.
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
  // The anchor's scroll container for this open session (null = page).
  const containerRef = useRef<HTMLElement | null>(null);

  const decidePlacement = useCallback(() => {
    if (!isControlled && heldRef && !heldRef.current) return;
    const anchorEl = anchorRef?.current ?? internalAnchorRef.current;
    const pop = popoverRef.current;
    if (!anchorEl || !pop) return;
    const a = anchorEl.getBoundingClientRect();
    const p = pop.getBoundingClientRect();
    if (!p.width && !p.height) return; // not shown yet
    const b = getBounds(containerRef.current);
    const space: Record<Placement, number> = {
      top: a.top - b.top,
      bottom: b.bottom - a.bottom,
      left: a.left - b.left,
      right: b.right - a.right,
    };
    const need: Record<Placement, number> = {
      top: p.height,
      bottom: p.height,
      left: p.width,
      right: p.width,
    };
    // Sticky on the current side: flip only when it runs out of room, so a
    // side regaining space never pulls the bubble back (no oscillation).
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

  // Throttle (leading + trailing).
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

  useEffect(() => {
    if (!autoFlip) setEffectivePlacement(placement);
  }, [autoFlip, placement]);

  // A `placement` prop change applies immediately. Not keyed on `isOpen`, so
  // reopening never replays the flip animation; the ref skips the mount.
  const settledPlacementRef = useRef(placement);
  useEffect(() => {
    if (settledPlacementRef.current === placement) return;
    settledPlacementRef.current = placement;
    if (autoFlip) setEffectivePlacement(placement);
  }, [autoFlip, placement]);

  // Reset a flipped side once fully closed, so the next open starts on the
  // preferred side; wait for the fade-out so it doesn't jump mid-fade.
  useEffect(() => {
    if (!autoFlip || isOpen) return;
    if (effectivePlacementRef.current === placement) return;
    const pop = popoverRef.current;
    const reset = () => setEffectivePlacement(placement);
    if (!pop || !pop.matches(':popover-open')) {
      reset();
      return;
    }
    const onEnd = (e: TransitionEvent) => {
      if (e.target === pop && e.propertyName === 'opacity') reset();
    };
    pop.addEventListener('transitionend', onEnd);
    const fallback = setTimeout(reset, 1000); // in case transitionend never fires
    return () => {
      pop.removeEventListener('transitionend', onEnd);
      clearTimeout(fallback);
    };
  }, [autoFlip, isOpen, placement, popoverRef]);

  useEffect(() => {
    if (!autoFlip || !isOpen || !supported) return;
    const pop = popoverRef.current;
    if (!pop || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(scheduleDecide, {
      rootMargin: `-${FLIP_THRESHOLD}px`,
      threshold: FLIP_RATIOS,
    });
    io.observe(pop);

    // In a scroll container the bubble never nears the viewport edge, so also
    // watch the anchor against the container, shrunk by the bubble's size.
    // Set up a frame later, once the popover is shown and has a size.
    const anchorEl = anchorRef?.current ?? internalAnchorRef.current;
    const container = anchorEl ? findScrollContainer(anchorEl) : null;
    containerRef.current = container;
    let containerIo: IntersectionObserver | undefined;
    const frame = requestAnimationFrame(() => {
      if (!container || !anchorEl) return;
      const { width, height } = pop.getBoundingClientRect();
      // Inset only the placement's axis, capped under half the container: an
      // empty root would never report an intersection change.
      const vertical = placement === 'top' || placement === 'bottom';
      const inset = (bubble: number, box: number) =>
        Math.max(0, Math.min(Math.round(bubble) + FLIP_THRESHOLD, box / 2 - 1));
      const v = vertical ? inset(height, container.clientHeight) : 0;
      const h = vertical ? 0 : inset(width, container.clientWidth);
      containerIo = new IntersectionObserver(scheduleDecide, {
        root: container,
        rootMargin: `${-v}px ${-h}px`,
        threshold: FLIP_RATIOS,
      });
      containerIo.observe(anchorEl);
    });

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      containerIo?.disconnect();
      containerRef.current = null;
      clearTimeout(decideTimerRef.current);
    };
  }, [
    autoFlip,
    isOpen,
    supported,
    scheduleDecide,
    popoverRef,
    anchorRef,
    internalAnchorRef,
    placement,
  ]);

  return effectivePlacement;
};
