import { useCallback, useMemo, useRef, type RefObject } from 'react';

import { useLatestRef } from './useLatestRef';

const prefersReducedMotion = (): boolean =>
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

// Two independent channels on the popover: fade (opacity) and slide
// (transform). A new animation stops only its own channel's previous one, so a
// fade-out mid-flip leaves the slide running. With `animate` off (no Web
// Animations API) the fade sets the opacity instantly and the slide is skipped.
export const useTooltipAnimations = (
  popoverRef: RefObject<HTMLElement>,
  durationMs: number,
  { animate }: { animate: boolean }
) => {
  const fadeRef = useRef<Animation>();
  const slideRef = useRef<Animation>();
  const durationRef = useLatestRef(durationMs);
  const animateRef = useLatestRef(animate);

  const run = useCallback(
    (
      channel: typeof fadeRef,
      keyframes: Keyframe[],
      duration: number,
      fill?: FillMode
    ): Animation | undefined => {
      const el = popoverRef.current;
      if (!el || !animateRef.current) return undefined;
      channel.current?.cancel();
      const ms = prefersReducedMotion() ? 0 : duration;
      channel.current = el.animate(keyframes, {
        duration: ms,
        easing: 'ease',
        fill,
      });
      return channel.current;
    },
    [popoverRef, animateRef]
  );

  // Fades to `to` from `from` (default: the current opacity, mid-fade
  // included), at a duration proportional to the distance. `fill` holds the
  // end value: the popover's base opacity is 0.
  const fade = useCallback(
    (to: number, from?: number) => {
      const el = popoverRef.current;
      if (el && !animateRef.current) {
        el.style.opacity = String(to);
        return undefined;
      }
      const current = el ? parseFloat(getComputedStyle(el).opacity) : NaN;
      const start = from ?? (Number.isNaN(current) ? 1 - to : current);
      return run(
        fadeRef,
        [{ opacity: start }, { opacity: to }],
        durationRef.current * Math.abs(to - start),
        'forwards'
      );
    },
    [popoverRef, run, durationRef, animateRef]
  );

  // The flip slide: the bubble emerges from the anchor side (--flip-from, set
  // per placement in tooltip.css).
  const slide = useCallback(
    () =>
      run(
        slideRef,
        [{ transform: 'var(--flip-from, none)' }, { transform: 'none' }],
        durationRef.current * 2
      ),
    [run, durationRef]
  );

  return useMemo(() => ({ fade, slide }), [fade, slide]);
};
