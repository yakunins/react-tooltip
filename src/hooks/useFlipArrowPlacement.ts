import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';

import type { ArrowPlacement, Placement } from '../types';
import {
  flipArrowRootMargins,
  chooseArrowPlacement,
} from '../utils/flipArrowGeometry';
import {
  findScrollContainer,
  FLIP_RATIOS,
  getBounds,
} from '../utils/flipGeometry';
import { observe } from '../utils/dom';
import { FLIP_THROTTLE_MS } from './useFlipPlacement';
import { useLatestRef } from './useLatestRef';
import { useOnPopoverHidden } from './useOnPopoverHidden';
import { useThrottledCallback } from './useThrottledCallback';

export interface FlipArrowPlacementParams {
  anchor: HTMLElement | null;
  popoverRef: RefObject<HTMLElement>;
  // The `placement` prop: a flip keeps the axis, so it sets the cross axis.
  placement: Placement;
  arrowPlacement: ArrowPlacement;
  // The `flip` prop; off, the arrow placement is returned as-is.
  enabled: boolean;
  // The `flipBack` prop: return to `arrowPlacement` once it has room again.
  flipBack?: boolean;
  isOpen: boolean;
  // False in the title fallback: no bubble to shift.
  styled: boolean;
  // Kept open by focus or a click; a hover-only tooltip never shifts.
  keptOpenRef: MutableRefObject<boolean>;
  // Parent owns `open`; such a tooltip always shifts.
  isControlled: boolean;
}

// The popover-resolved --tooltip-arrow-inset (a registered <length>), in px.
const arrowInset = (pop: HTMLElement): number =>
  parseFloat(getComputedStyle(pop).getPropertyValue('--tooltip-arrow-inset')) ||
  0;

// Returns `arrowPlacement`, moved to 'start' / 'center' / 'end' when the
// bubble would overflow the viewport or the anchor's scroll container across
// the placement axis: flip's counterpart on the other axis. Sticky unless
// `flipBack`, reset after close.
export const useFlipArrowPlacement = ({
  anchor,
  popoverRef,
  placement,
  arrowPlacement,
  enabled,
  flipBack = false,
  isOpen,
  styled,
  keptOpenRef,
  isControlled,
}: FlipArrowPlacementParams): ArrowPlacement => {
  const [effectiveArrow, setEffectiveArrow] =
    useState<ArrowPlacement>(arrowPlacement);
  const effectiveArrowRef = useLatestRef(effectiveArrow);
  // The anchor's scroll container for this open session (null = page).
  const containerRef = useRef<HTMLElement | null>(null);

  const decideArrow = useCallback(() => {
    if (!isControlled && !keptOpenRef.current) return;
    const pop = popoverRef.current;
    if (!anchor || !pop) return;
    const p = pop.getBoundingClientRect();
    if (!p.width && !p.height) return; // not shown yet
    const next = chooseArrowPlacement(
      effectiveArrowRef.current,
      placement,
      anchor.getBoundingClientRect(),
      p,
      getBounds(containerRef.current),
      arrowInset(pop),
      flipBack ? arrowPlacement : undefined
    );
    setEffectiveArrow(prev => (prev === next ? prev : next));
  }, [
    anchor,
    popoverRef,
    keptOpenRef,
    isControlled,
    effectiveArrowRef,
    placement,
    flipBack,
    arrowPlacement,
  ]);

  const decide = useThrottledCallback(decideArrow, FLIP_THROTTLE_MS);

  // Follow `arrowPlacement` while disabled and on every change. The ref skips
  // the mount.
  const prevArrowRef = useRef(arrowPlacement);
  useEffect(() => {
    const changed = prevArrowRef.current !== arrowPlacement;
    prevArrowRef.current = arrowPlacement;
    if (changed || !enabled) setEffectiveArrow(arrowPlacement);
  }, [enabled, arrowPlacement]);

  // Reset a shifted arrow once fully closed, so the next open starts on
  // `arrowPlacement`.
  useOnPopoverHidden(
    popoverRef,
    enabled && !isOpen && effectiveArrow !== arrowPlacement,
    () => setEffectiveArrow(arrowPlacement)
  );

  // Watch the anchor against the viewport and its scroll container, inset on
  // the cross axis at each fit boundary. The popover is already shown.
  useEffect(() => {
    if (!enabled || !isOpen || !styled || !anchor) return;
    const pop = popoverRef.current;
    if (!pop) return;
    const container = findScrollContainer(anchor);
    containerRef.current = container;
    const margins = (box: Pick<HTMLElement, 'clientWidth' | 'clientHeight'>) =>
      flipArrowRootMargins(
        placement,
        anchor.getBoundingClientRect(),
        pop.getBoundingClientRect(),
        arrowInset(pop),
        box
      );
    // `document`, not the default (null) root: inside an iframe that is the
    // top-level viewport, which the margins, measured here, don't match.
    const roots: [Document | HTMLElement, string[]][] = [
      [document, margins(document.documentElement)],
    ];
    if (container) roots.push([container, margins(container)]);
    const stops = roots.flatMap(([root, list]) =>
      list.map(rootMargin =>
        observe(anchor, decide.run, {
          root,
          rootMargin,
          threshold: FLIP_RATIOS,
        })
      )
    );

    return () => {
      stops.forEach(stop => stop());
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

  return effectiveArrow;
};
