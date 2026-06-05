import { useId, useRef, type CSSProperties } from 'react';
import { default as cx } from 'clsx';

import { TooltipAnchor } from '../TooltipAnchor';
import { TooltipShape, DEFAULT_BUBBLE_STYLE } from '../TooltipShape';
import {
  useHasFocusable,
  useStyleInjector,
  useSupportsAnchorPositioning,
} from '../hooks';
import type { TooltipTimings } from '../types';
import { default as tooltipCss } from './tooltip.css.generated.js';
import {
  TOOLTIP_DEFAULTS,
  TOOLTIP_DEFAULTS_TIMINGS,
  type TooltipProps,
} from './TooltipProps';
import { useAutoFlip } from './hooks/useAutoFlip';
import { useControllableOpen } from './hooks/useControllableOpen';
import { useExternalAnchor } from './hooks/useExternalAnchor';
import { useFlipAnimation, type FlipAnimation } from './hooks/useFlipAnimation';
import { usePopover } from './hooks/usePopover';
import { useTooltipTriggers } from './hooks/useTooltipTriggers';

export type { TooltipProps };

// The flip animation, owned here and handed to useFlipAnimation. The keyframes
// read the per-placement `--flip-from` custom property (set in tooltip.css) so
// the bubble emerges from the anchor side. `duration` is a CSS <time>
// expression resolved against the popover by the hook (WAAPI needs a number).
const FLIP_ANIMATION: FlipAnimation = {
  keyframes: [
    { opacity: 0, transform: 'var(--flip-from, none)' },
    { opacity: 1, transform: 'none' },
  ],
  options: {
    duration: 'calc(var(--tooltip-transition-duration) * 2)', // double period, hide here + show there
    easing: 'ease',
  },
};

/**
 * Tooltip — top-layer tooltip built on the Popover API and CSS anchor
 * positioning.
 *
 * Three composition modes:
 *
 *   1. *Wrapping* (default) — pass `children`; Tooltip renders a
 *      `<TooltipAnchor>` wrapper and pins the bubble to it.
 *
 *   2. *External by ref* — pass `anchorRef` (omit `children`); Tooltip
 *      writes `anchor-name` onto the referenced element, wires the
 *      trigger listeners to it, and mirrors `aria-describedby`.
 *
 *   3. *External by name* — pass `anchorName` only (omit both `anchorRef`
 *      and `children`); Tooltip uses that CSS anchor name verbatim and
 *      does *not* wire any trigger listeners — pair with controlled
 *      `open` / `onOpenChange`.
 *
 * The component injects its own stylesheet at runtime, so no CSS import
 * or bundler CSS loader is required.
 *
 * Browsers without native CSS anchor positioning get a graceful fallback
 * rather than a polyfill: the styled bubble is skipped and `content` (when it
 * is a string) is surfaced through the element's native `title` tooltip.
 *
 * The behavior is composed from focused hooks — `useControllableOpen`,
 * `useTooltipTriggers`, `useAutoFlip`, `useExternalAnchor`, `usePopover`,
 * `useFlipAnimation` — leaving this component as an orchestrator + render.
 */
export const Tooltip = ({
  children,
  content,
  placement = TOOLTIP_DEFAULTS.placement,
  arrowPlacement = TOOLTIP_DEFAULTS.arrowPlacement,
  trigger = TOOLTIP_DEFAULTS.trigger,
  timings,
  offset = TOOLTIP_DEFAULTS.offset,
  autoFlip = TOOLTIP_DEFAULTS.autoFlip,
  defaultOpen = TOOLTIP_DEFAULTS.defaultOpen,
  open,
  onOpenChange,
  bubbleStyle,
  className,
  style,
  anchorRef: anchorRefProp,
  anchorName: anchorNameProp,
}: TooltipProps) => {
  useStyleInjector(tooltipCss.content);
  // Native CSS anchor positioning is required for the styled bubble to track
  // its anchor. Where it is missing we degrade to a native `title` tooltip
  // instead of pulling in a positioning polyfill.
  const supported = useSupportsAnchorPositioning();

  const internalAnchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // `anchorNameProp` (if supplied) takes priority — the consumer owns the
  // CSS contract in that case. Otherwise we generate a CSS-safe dashed-ident.
  const safeId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const anchorName = anchorNameProp ?? `--tooltip-${safeId}`;
  const tooltipId = `tooltip-${safeId}`;
  // wrapping mode = no external anchor source provided
  const wrapping = !anchorRefProp && !anchorNameProp;

  const { isOpen, isControlled, commitRef } = useControllableOpen(
    open,
    defaultOpen,
    onOpenChange
  );

  // Resolve the timing knobs against their defaults (ignoring explicit
  // undefined), so a partial `timings` object overrides only what it sets.
  const definedTimings = Object.fromEntries(
    Object.entries(timings ?? {}).filter(([, v]) => v !== undefined)
  );
  const t: Required<TooltipTimings> = {
    ...TOOLTIP_DEFAULTS_TIMINGS,
    ...definedTimings,
  };

  // Triggers (hover/focus/click-toggle + outside-click + Escape). `heldRef`
  // reports whether focus or a pin is holding the tooltip open.
  const { heldRef } = useTooltipTriggers({
    anchorRef: anchorRefProp,
    internalAnchorRef,
    popoverRef,
    trigger,
    delayShow: t.delayShow,
    delayHide: t.delayHide,
    clickCloseGuard: t.clickCloseGuard,
    minVisibleDuration: t.minVisibleDuration,
    supported,
    isOpen,
    commitRef,
  });

  // autoFlip → the side the bubble is actually placed on (flips near edges).
  // A purely hover-shown tooltip is never autoflipped; focus, a pin, or being
  // controlled re-enables it.
  const effectivePlacement = useAutoFlip({
    anchorRef: anchorRefProp,
    internalAnchorRef,
    popoverRef,
    placement,
    autoFlip,
    isOpen,
    supported,
    heldRef,
    isControlled,
  });

  useExternalAnchor({
    supported,
    anchorRef: anchorRefProp,
    anchorNameProp,
    anchorName,
    content,
    tooltipId,
  });
  usePopover(popoverRef, isOpen);
  useFlipAnimation(popoverRef, effectivePlacement, isOpen, FLIP_ANIMATION);

  // Only meaningful in wrapping mode; harmless when the wrapper is absent
  // (internalAnchorRef.current stays null, hasFocusable stays false).
  const hasFocusable = useHasFocusable(internalAnchorRef);
  const useFocus = trigger.includes('focus');

  // --- fallback: no native anchor positioning -> native `title` tooltip ---
  // Wrapping mode owns an element to carry the title; external modes attach it
  // to the consumer's element (by-ref, via useExternalAnchor) or cannot (by-name).
  if (!supported) {
    if (!wrapping) return null;
    const title = typeof content === 'string' ? content : undefined;
    return (
      <span style={{ display: 'inline-block' }} title={title}>
        {children}
      </span>
    );
  }

  const popoverStyle = {
    positionAnchor: anchorName,
    '--tooltip-offset': offset,
    '--tooltip-transition-duration':
      bubbleStyle?.transitionDuration ?? DEFAULT_BUBBLE_STYLE.transitionDuration,
    // Mirrored so the popover can compute --tooltip-arrow-inset (the
    // arrow-start / arrow-end shift) from the same radius / arrow size the
    // bubble uses. Resolved against DEFAULT_BUBBLE_STYLE (the single source of
    // defaults) so the value is always concrete — tooltip.css has no fallback.
    '--tooltip-radius': bubbleStyle?.radius ?? DEFAULT_BUBBLE_STYLE.radius,
    '--tooltip-arrow-size':
      bubbleStyle?.arrowSize ?? DEFAULT_BUBBLE_STYLE.arrowSize,
    ...style,
  } as CSSProperties;

  return (
    <>
      {wrapping && (
        <TooltipAnchor
          ref={internalAnchorRef}
          anchorName={anchorName}
          aria-describedby={tooltipId}
          tabIndex={!hasFocusable && useFocus ? 0 : undefined}
        >
          {children}
        </TooltipAnchor>
      )}
      <div
        ref={popoverRef}
        popover="manual"
        id={tooltipId}
        role="tooltip"
        className={cx(
          'tooltip-popover',
          `placement-${effectivePlacement}`,
          `arrow-${arrowPlacement}`,
          className
        )}
        style={popoverStyle}
      >
        <TooltipShape
          placement={effectivePlacement}
          arrowPlacement={arrowPlacement}
          bubbleStyle={bubbleStyle}
        >
          {content}
        </TooltipShape>
      </div>
    </>
  );
};
