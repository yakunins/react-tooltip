import { useRef, type RefObject } from 'react';

import { useIsoLayoutEffect } from '../../hooks';
import type { Placement } from '../../types';

/**
 * A Web Animations API description, passed in by Tooltip.
 *
 * `options.duration` may be a number (ms) as usual, **or** a CSS `<time>`
 * string with `var()` / `calc()` (e.g.
 * `'calc(var(--tooltip-transition-duration) * 3)'`). WAAPI itself only accepts
 * a number, so such a string is resolved against the popover before use.
 */
export interface FlipAnimation {
  keyframes: Keyframe[];
  options?: KeyframeAnimationOptions;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Parse a computed CSS `<time>` (`'0.48s'` | `'160ms'`) to milliseconds. */
const cssTimeToMs = (value: string): number => {
  const v = value.trim();
  if (v.endsWith('ms')) return parseFloat(v);
  if (v.endsWith('s')) return parseFloat(v) * 1000;
  return parseFloat(v);
};

/**
 * Resolve a CSS `<time>` expression (`var()` / `calc()` allowed) to ms by
 * computing it through a throwaway `animation-duration` on the element — there
 * is no other way to evaluate an arbitrary CSS expression to a number, and
 * WAAPI's `duration` won't take the string.
 */
const resolveDurationMs = (el: HTMLElement, value: string): number => {
  const prev = el.style.animationDuration;
  el.style.animationDuration = value;
  const computed = getComputedStyle(el).animationDuration;
  el.style.animationDuration = prev;
  return cssTimeToMs(computed);
};

/**
 * Plays `animation` (via the Web Animations API) when the placement changes
 * while the tooltip is already open — a quick cross-fade + slide so the bubble
 * appears to hop to the new side. The whole bubble animates, so the arrow rides
 * along. Skipped on the opening transition (which has its own `@starting-style`
 * fade) and under reduced-motion. `el.animate()` is one-shot, so there is no
 * keyframe-replay hack and nothing to clean up.
 */
export const useFlipAnimation = (
  popoverRef: RefObject<HTMLElement>,
  effectivePlacement: Placement,
  isOpen: boolean,
  animation: FlipAnimation
): void => {
  const prevFlipPlacementRef = useRef(effectivePlacement);
  const wasOpenRef = useRef(isOpen);
  useIsoLayoutEffect(() => {
    const el = popoverRef.current;
    const placementChanged =
      prevFlipPlacementRef.current !== effectivePlacement;
    const wasOpen = wasOpenRef.current;
    prevFlipPlacementRef.current = effectivePlacement;
    wasOpenRef.current = isOpen;
    if (!el || !isOpen || !wasOpen || !placementChanged) return;
    if (typeof el.animate !== 'function' || prefersReducedMotion()) return;

    let options = animation.options;
    const duration = options?.duration;
    if (typeof duration === 'string' && duration !== 'auto') {
      const ms = resolveDurationMs(el, duration);
      if (Number.isFinite(ms)) options = { ...options, duration: ms };
    }
    el.animate(animation.keyframes, options);
  }, [effectivePlacement, isOpen, animation]);
};
