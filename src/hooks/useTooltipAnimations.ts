import { useCallback, useMemo, useRef, type RefObject } from 'react';

import type { ArrowPlacement, Placement } from '../types';
import { isVertical } from '../utils/flipGeometry';
import { useLatestRef } from './useLatestRef';

const prefersReducedMotion = (): boolean =>
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

// Independent channels: fade (opacity), slide across the anchor side on a
// flip (transform), slide along the edge on an arrow shift (translate, with
// the bubble's arrow position). A new animation stops only its own channel,
// so a mid-flip fade-out leaves the slide running. With `animate` off, the
// fade sets the opacity instantly and slides skip.
export const useTooltipAnimations = (
  popoverRef: RefObject<HTMLElement>,
  durationMs: number,
  { animate }: { animate: boolean }
) => {
  const fadeRef = useRef<Animation>();
  const slideAcrossRef = useRef<Animation>();
  const slideAlongRef = useRef<Animation>();
  const arrowPosRef = useRef<Animation>();
  const durationRef = useLatestRef(durationMs);
  const animateRef = useLatestRef(animate);

  const run = useCallback(
    (
      channel: typeof fadeRef,
      keyframes: Keyframe[],
      duration: number,
      fill?: FillMode,
      el: HTMLElement | null = popoverRef.current
    ): Animation | undefined => {
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

  // Fades from `from` (default: current opacity) to `to`, timed by distance;
  // `fill` holds the end value, as the base opacity is 0.
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

  // The flip slide across, from the anchor side (--flip-from, set in
  // tooltipPopover.css).
  const slideAcross = useCallback(
    () =>
      run(
        slideAcrossRef,
        [{ transform: 'var(--flip-from, none)' }, { transform: 'none' }],
        durationRef.current * 2
      ),
    [run, durationRef]
  );

  // The arrow-shift slide along the edge: the bubble's arrow position glides
  // from `from` to `to` while the popover's translate moves by the opposite
  // amount, so the tip stays on the anchor. A slide already running continues
  // from where it is.
  const slideAlong = useCallback(
    (placement: Placement, from: ArrowPlacement, to: ArrowPlacement) => {
      const pop = popoverRef.current;
      const bubble = pop?.querySelector<HTMLElement>('.tooltip-bubble');
      if (!pop || !bubble) return undefined;
      const v = isVertical(placement);
      const r = pop.getBoundingClientRect();
      const size = v ? r.width : r.height;
      const style = getComputedStyle(pop);
      const inset =
        parseFloat(style.getPropertyValue('--tooltip-arrow-inset')) || 0;
      // Arrow tip from the bubble's start edge, in px.
      const pos = (ap: ArrowPlacement) =>
        ap === 'start' ? inset : ap === 'end' ? size - inset : size / 2;
      const inFlight =
        slideAlongRef.current?.playState === 'running'
          ? -parseFloat(
              style.getPropertyValue('translate').split(' ')[v ? 0 : 1] ?? ''
            )
          : NaN;
      const start = Number.isFinite(inFlight) ? inFlight : pos(from);
      const end = pos(to);
      const translate = (p: number) => (v ? `${-p}px 0px` : `0px ${-p}px`);
      const ms = durationRef.current;
      run(
        arrowPosRef,
        [
          { '--tooltip-arrow-pos': `${start}px` },
          { '--tooltip-arrow-pos': `${end}px` },
        ],
        ms,
        undefined,
        bubble
      );
      return run(
        slideAlongRef,
        [{ translate: translate(start) }, { translate: translate(end) }],
        ms
      );
    },
    [popoverRef, run, durationRef]
  );

  return useMemo(
    () => ({ fade, slideAcross, slideAlong }),
    [fade, slideAcross, slideAlong]
  );
};
