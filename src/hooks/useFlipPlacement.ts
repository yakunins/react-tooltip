import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';

import type { Placement } from '../types';
import {
  choosePlacement,
  containerRootMargin,
  findScrollContainer,
  FLIP_RATIOS,
  FLIP_THRESHOLD,
  getBounds,
} from '../utils/flipGeometry';
import { observe } from '../utils/dom';
import { useLatestRef } from './useLatestRef';
import { useOnPopoverHidden } from './useOnPopoverHidden';
import { useThrottledCallback } from './useThrottledCallback';

// Max re-evaluation rate while open, so fast scrolling can't thrash placement.
export const FLIP_THROTTLE_MS = 500;

export interface FlipPlacementParams {
  anchor: HTMLElement | null;
  popoverRef: RefObject<HTMLElement>;
  placement: Placement;
  // The `flip` prop; off, the placement is returned as-is.
  enabled: boolean;
  // The `flipBack` prop: return to `placement` once it has room again.
  flipBack?: boolean;
  isOpen: boolean;
  // False in the title fallback: no bubble to flip.
  styled: boolean;
  // Kept open by focus or a click; a hover-only tooltip never flips.
  keptOpenRef: MutableRefObject<boolean>;
  // Parent owns `open`; such a tooltip always flips.
  isControlled: boolean;
}

// Returns `placement`, flipped to the opposite side when it would overflow the
// viewport or the anchor's scroll container. Sticky unless `flipBack`, reset
// after close.
export const useFlipPlacement = ({
  anchor,
  popoverRef,
  placement,
  enabled,
  flipBack = false,
  isOpen,
  styled,
  keptOpenRef,
  isControlled,
}: FlipPlacementParams): Placement => {
  const [effectivePlacement, setEffectivePlacement] =
    useState<Placement>(placement);
  const effectivePlacementRef = useLatestRef(effectivePlacement);
  // The anchor's scroll container for this open session (null = page).
  const containerRef = useRef<HTMLElement | null>(null);

  const decidePlacement = useCallback(() => {
    if (!isControlled && !keptOpenRef.current) return;
    const pop = popoverRef.current;
    if (!anchor || !pop) return;
    const p = pop.getBoundingClientRect();
    if (!p.width && !p.height) return; // not shown yet
    const next = choosePlacement(
      effectivePlacementRef.current,
      anchor.getBoundingClientRect(),
      p,
      getBounds(containerRef.current),
      flipBack ? placement : undefined
    );
    setEffectivePlacement(prev => (prev === next ? prev : next));
  }, [
    anchor,
    popoverRef,
    keptOpenRef,
    isControlled,
    effectivePlacementRef,
    flipBack,
    placement,
  ]);

  const decide = useThrottledCallback(decidePlacement, FLIP_THROTTLE_MS);

  // Follow `placement` while disabled and on every change; not on reopen,
  // which would replay the flip animation. The ref skips the mount.
  const prevPlacementRef = useRef(placement);
  useEffect(() => {
    const changed = prevPlacementRef.current !== placement;
    prevPlacementRef.current = placement;
    if (changed || !enabled) setEffectivePlacement(placement);
  }, [enabled, placement]);

  // Reset a flipped side once fully closed, so the next open starts on
  // `placement`.
  useOnPopoverHidden(
    popoverRef,
    enabled && !isOpen && effectivePlacement !== placement,
    () => setEffectivePlacement(placement)
  );

  useEffect(() => {
    if (!enabled || !isOpen || !styled) return;
    const pop = popoverRef.current;
    if (!pop) return;
    const stopViewport = observe(pop, decide.run, {
      rootMargin: `-${FLIP_THRESHOLD}px`,
      threshold: FLIP_RATIOS,
    });

    // In a scroll container the bubble never nears the viewport edge, so also
    // watch the anchor against it. The popover is already shown (usePopover).
    const container = anchor ? findScrollContainer(anchor) : null;
    containerRef.current = container;
    const stopContainer =
      anchor && container
        ? observe(anchor, decide.run, {
            root: container,
            rootMargin: containerRootMargin(
              placement,
              pop.getBoundingClientRect(),
              container
            ),
            threshold: FLIP_RATIOS,
          })
        : undefined;

    // A flipped bubble sits clear of the viewport edge, so the popover watch
    // can't see room return on the preferred side; watch the anchor instead.
    // Against `document`: the default root is the top-level viewport inside
    // an iframe, which the margins, measured here, don't match.
    const stopFlipBack =
      anchor && flipBack
        ? observe(anchor, decide.run, {
            root: document,
            rootMargin: containerRootMargin(
              placement,
              pop.getBoundingClientRect(),
              document.documentElement
            ),
            threshold: FLIP_RATIOS,
          })
        : undefined;

    return () => {
      stopViewport();
      stopContainer?.();
      stopFlipBack?.();
      containerRef.current = null;
      decide.cancel();
    };
  }, [
    enabled,
    isOpen,
    styled,
    decide.run,
    decide.cancel,
    popoverRef,
    anchor,
    placement,
    flipBack,
  ]);

  return effectivePlacement;
};
