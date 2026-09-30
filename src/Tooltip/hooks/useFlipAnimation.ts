import { useRef, type RefObject } from 'react';

import { useIsoLayoutEffect } from '../../hooks';
import type { Placement } from '../../types';

// A WAAPI animation. `options.duration` may also be a CSS <time> expression
// (var()/calc()), resolved against the popover since WAAPI needs a number.
export interface FlipAnimation {
  keyframes: Keyframe[];
  options?: KeyframeAnimationOptions;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Computed CSS <time> ('0.48s' | '160ms') to ms.
export const cssTimeToMs = (value: string): number => {
  const v = value.trim();
  if (v.endsWith('ms')) return parseFloat(v);
  if (v.endsWith('s')) return parseFloat(v) * 1000;
  return parseFloat(v);
};

// Evaluates a CSS <time> expression through a throwaway animation-duration:
// the only way to turn arbitrary var()/calc() into a number.
const resolveDurationMs = (el: HTMLElement, value: string): number => {
  const prev = el.style.animationDuration;
  el.style.animationDuration = value;
  const computed = getComputedStyle(el).animationDuration;
  el.style.animationDuration = prev;
  return cssTimeToMs(computed);
};

// Plays `animation` when the placement changes while already open. Skipped on
// open (which has its own @starting-style fade) and under reduced motion.
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
