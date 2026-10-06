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
import { useThrottledCallback } from './useThrottledCallback';

// Max re-evaluation rate while open, so fast scrolling can't thrash placement.
const FLIP_THROTTLE_MS = 500;

export interface FlipPlacementParams {
  anchor: HTMLElement | null;
  popoverRef: RefObject<HTMLElement>;
  placement: Placement;
  // The `flip` prop; off, the placement is returned as-is.
  enabled: boolean;
  isOpen: boolean;
  // False in the title fallback: no bubble to flip.
  styled: boolean;
  // Kept open by focus or a click; a hover-only tooltip never flips.
  keptOpenRef: MutableRefObject<boolean>;
  // Parent owns `open`; such a tooltip always flips.
  isControlled: boolean;
}

// Returns `placement`, flipped to the opposite side when it would overflow the
// viewport or the anchor's scroll container. Sticky, reset after close.
export const useFlipPlacement = ({
  anchor,
  popoverRef,
  placement,
  enabled,
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
      getBounds(containerRef.current)
    );
    setEffectivePlacement(prev => (prev === next ? prev : next));
  }, [anchor, popoverRef, keptOpenRef, isControlled, effectivePlacementRef]);

  const decide = useThrottledCallback(decidePlacement, FLIP_THROTTLE_MS);

  // Follow the `placement` prop: always while disabled, and on every change.
  // Not keyed on `isOpen`, so reopening never resets the side (and replays the
  // flip animation); the ref skips the mount.
  const prevPlacementRef = useRef(placement);
  useEffect(() => {
    const changed = prevPlacementRef.current !== placement;
    prevPlacementRef.current = placement;
    if (changed || !enabled) setEffectivePlacement(placement);
  }, [enabled, placement]);

  // Reset a flipped side once fully closed, so the next open starts on the
  // preferred side. The popover stays open while it fades out, so wait for
  // its toggle to closed; otherwise the bubble would jump sides mid-fade.
  useEffect(() => {
    if (!enabled || isOpen) return;
    if (effectivePlacementRef.current === placement) return;
    const pop = popoverRef.current;
    const reset = () => setEffectivePlacement(placement);
    if (!pop || !pop.matches(':popover-open')) {
      reset();
      return;
    }
    const onToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === 'closed') reset();
    };
    pop.addEventListener('toggle', onToggle);
    const fallback = setTimeout(reset, 1000); // in case toggle never fires
    return () => {
      pop.removeEventListener('toggle', onToggle);
      clearTimeout(fallback);
    };
  }, [enabled, isOpen, placement, popoverRef, effectivePlacementRef]);

  useEffect(() => {
    if (!enabled || !isOpen || !styled) return;
    const pop = popoverRef.current;
    if (!pop) return;
    const stopViewport = observe(pop, decide.run, {
      rootMargin: `-${FLIP_THRESHOLD}px`,
      threshold: FLIP_RATIOS,
    });

    // In a scroll container the bubble never nears the viewport edge, so also
    // watch the anchor against the container. usePopover (a layout effect) has
    // already shown the popover, so it has a size here.
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

    return () => {
      stopViewport();
      stopContainer?.();
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
  ]);

  return effectivePlacement;
};
