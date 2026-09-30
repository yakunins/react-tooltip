import { useId, useRef, type CSSProperties } from 'react';
import { cx } from '../utils/cx';

import { TooltipAnchor } from '../TooltipAnchor';
import { TooltipBubble, DEFAULT_BUBBLE_STYLE } from '../TooltipBubble';
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
import { useAnchorVisibility } from './hooks/useAnchorVisibility';
import { useAutoFlip } from './hooks/useAutoFlip';
import { useControllableOpen } from './hooks/useControllableOpen';
import { useExternalAnchor } from './hooks/useExternalAnchor';
import { useFlipAnimation, type FlipAnimation } from './hooks/useFlipAnimation';
import { usePopover } from './hooks/usePopover';
import { useTooltipTriggers } from './hooks/useTooltipTriggers';

export type { TooltipProps };

// Keyframes read the per-placement --flip-from (tooltip.css); the hook resolves
// the CSS <time> duration to ms, since WAAPI needs a number.
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
 * Tooltip on the Popover API and CSS anchor positioning. Wraps `children`, or
 * attaches via `anchorRef` / `anchorName`; falls back to a native `title`.
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
  // Without native anchor positioning, degrade to a `title` (no polyfill).
  const supported = useSupportsAnchorPositioning();

  const internalAnchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // A supplied anchorName wins; otherwise generate a CSS-safe dashed-ident.
  const safeId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const anchorName = anchorNameProp ?? `--tooltip-${safeId}`;
  const tooltipId = `tooltip-${safeId}`;
  const wrapping = !anchorRefProp && !anchorNameProp;

  const { isOpen, isControlled, commitRef } = useControllableOpen(
    open,
    defaultOpen,
    onOpenChange
  );

  // A partial `timings` overrides only what it sets (undefined keeps defaults).
  const definedTimings = Object.fromEntries(
    Object.entries(timings ?? {}).filter(([, v]) => v !== undefined)
  );
  const t: Required<TooltipTimings> = {
    ...TOOLTIP_DEFAULTS_TIMINGS,
    ...definedTimings,
  };

  // `heldRef`: focus or a pin is holding the tooltip open.
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
    isControlled,
    commitRef,
  });

  // A hover-only tooltip never flips; focus, a pin or `open` enables it.
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
  // Fades the bubble while its anchor is scrolled out of sight.
  const anchorHidden = useAnchorVisibility({
    anchorRef: anchorRefProp,
    internalAnchorRef,
    isOpen,
    supported,
  });
  usePopover(popoverRef, isOpen);
  useFlipAnimation(popoverRef, effectivePlacement, isOpen, FLIP_ANIMATION);

  // Wrapping mode only; without the wrapper it stays false.
  const hasFocusable = useHasFocusable(internalAnchorRef);
  const useFocus = trigger.includes('focus');

  // Fallback: wrapping mode carries the title itself; by-ref mode sets it in
  // useExternalAnchor, and by-name mode has no element for it.
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
      bubbleStyle?.transitionDuration ??
      DEFAULT_BUBBLE_STYLE.transitionDuration,
    // Mirrored for tooltip.css's --tooltip-arrow-inset, which has no fallback.
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
          'tooltip',
          `placement-${effectivePlacement}`,
          `arrow-${arrowPlacement}`,
          anchorHidden && 'anchor-hidden',
          className
        )}
        style={popoverStyle}
      >
        <TooltipBubble
          placement={effectivePlacement}
          arrowPlacement={arrowPlacement}
          bubbleStyle={bubbleStyle}
        >
          {content}
        </TooltipBubble>
      </div>
    </>
  );
};
