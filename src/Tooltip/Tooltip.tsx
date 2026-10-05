import { useId, useRef, useState, type CSSProperties } from 'react';
import { cx } from '../utils/cx';
import { withDefaults } from '../utils/withDefaults';

import { TooltipAnchor } from '../TooltipAnchor';
import { TooltipBubble, DEFAULT_BUBBLE_STYLE } from '../TooltipBubble';
import {
  useElementHasFocusable,
  useIsoLayoutEffect,
  useStyleInjector,
  useSupports,
} from '../hooks';
import { default as tooltipCss } from './tooltip.css.generated.js';
import {
  TOOLTIP_DEFAULTS,
  TOOLTIP_DEFAULTS_TIMINGS,
  type TooltipProps,
} from './TooltipProps';
import { useControllableOpen } from '../hooks/useControllableOpen';
import { useElementHidden } from '../hooks/useElementHidden';
import { useExternalAnchor } from '../hooks/useExternalAnchor';
import { useFlipPlacement } from '../hooks/useFlipPlacement';
import { usePopover } from '../hooks/usePopover';
import { useTooltipAnimations } from '../hooks/useTooltipAnimations';
import { cssTimeToMs } from '../utils/cssTime';
import { useTooltipInteractions } from '../hooks/interactions';

export type { TooltipProps };

/**
 * Tooltip on the Popover API and CSS anchor positioning. Wraps `children`, or
 * attaches via `anchorRef` / `anchorName`; falls back to a native `title`.
 */
export const Tooltip = ({
  children,
  content,
  placement = TOOLTIP_DEFAULTS.placement,
  arrowPlacement = TOOLTIP_DEFAULTS.arrowPlacement,
  triggers = TOOLTIP_DEFAULTS.triggers,
  timings,
  offset = TOOLTIP_DEFAULTS.offset,
  flip = TOOLTIP_DEFAULTS.flip,
  animationDuration = TOOLTIP_DEFAULTS.animationDuration,
  defaultOpen = TOOLTIP_DEFAULTS.defaultOpen,
  open,
  onOpenChange,
  bubbleStyle,
  className,
  style,
  anchorRef: anchorRefProp,
  anchorName: anchorNameProp,
}: TooltipProps) => {
  useStyleInjector(tooltipCss);
  // The styled tooltip needs anchor positioning and the Popover API; without
  // them it degrades to a native `title` (no polyfill). Animations and
  // IntersectionObserver features switch off on their own.
  const support = useSupports();
  const styled = support.anchorPositioning && support.popover;

  const internalAnchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  // The anchor element (the consumer's anchorRef, else our wrapper), kept in
  // state and re-read after every commit, so the hooks re-wire when it mounts
  // late or is swapped for another element.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  useIsoLayoutEffect(() => {
    const el = anchorRefProp?.current ?? internalAnchorRef.current;
    if (el !== anchor) setAnchor(el);
  });

  // A supplied anchorName wins; otherwise generate a CSS-safe dashed-ident.
  const safeId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const anchorName = anchorNameProp ?? `--tooltip-${safeId}`;
  const tooltipId = `tooltip-${safeId}`;
  const wrapping = !anchorRefProp && !anchorNameProp;

  const { isOpen, isControlled, setOpen } = useControllableOpen(
    open,
    defaultOpen,
    onOpenChange
  );

  // First: a layout effect, so the popover is shown before the hooks below
  // measure it. Hiding waits for the fade-out (see the fade below).
  const hidePopover = usePopover(popoverRef, isOpen);

  // Rich content renders from the first open on, so closed tooltips stay cheap.
  // Plain text always renders: it is the aria-describedby description.
  const [hasOpened, setHasOpened] = useState(isOpen);
  if (isOpen && !hasOpened) setHasOpened(true);
  const renderContent =
    hasOpened || typeof content === 'string' || typeof content === 'number';

  const t = withDefaults(TOOLTIP_DEFAULTS_TIMINGS, timings);
  // Mirrored onto the popover for tooltip.css (transition, arrow inset).
  const bs = withDefaults(DEFAULT_BUBBLE_STYLE, bubbleStyle);

  // `keptOpenRef`: focus or a click is keeping the tooltip open.
  const { keptOpenRef } = useTooltipInteractions({
    anchor,
    popoverRef,
    triggers,
    showDelay: t.showDelay,
    hideDelay: t.hideDelay,
    clickGuard: t.clickGuard,
    minVisibleTime: t.minVisibleTime,
    anchorPositioning: styled,
    isOpen,
    isControlled,
    setOpen,
  });

  // A hover-only tooltip never flips; focus, a click or `open` enables it.
  const effectivePlacement = useFlipPlacement({
    anchor,
    popoverRef,
    placement,
    enabled: flip && support.intersectionObserver,
    isOpen,
    anchorPositioning: styled,
    keptOpenRef,
    isControlled,
  });

  useExternalAnchor({
    anchorPositioning: styled,
    anchor: anchorRefProp ? anchor : null,
    anchorNameProp,
    anchorName,
    content,
    tooltipId,
  });
  // Fades the bubble while its anchor is scrolled out of sight.
  const anchorHidden = useElementHidden(anchor, {
    enabled: isOpen && styled && support.intersectionObserver,
  });

  const durationMs = cssTimeToMs(animationDuration);
  const { fade, slide } = useTooltipAnimations(
    popoverRef,
    Number.isFinite(durationMs) ? durationMs : 0,
    { animate: support.webAnimations }
  );

  // Fade in while open with the anchor in sight; fade out otherwise, and hide
  // the popover once a close has faded out (a reopen cancels that fade).
  const visible = isOpen && !anchorHidden;
  useIsoLayoutEffect(() => {
    if (visible) return void fade(1);
    if (!popoverRef.current?.matches(':popover-open')) return;
    const fadeOut = fade(0);
    if (isOpen) return; // anchor out of sight: stay open, faded out
    if (fadeOut) fadeOut.finished.then(hidePopover, () => undefined);
    else hidePopover();
  }, [visible, isOpen, fade, hidePopover, popoverRef]);

  // A flip while visible: fade in from 0 and slide from the anchor side.
  const placementRef = useRef(effectivePlacement);
  useIsoLayoutEffect(() => {
    if (placementRef.current === effectivePlacement) return;
    placementRef.current = effectivePlacement;
    if (!visible) return;
    fade(1, 0);
    slide();
  }, [effectivePlacement, visible, fade, slide]);

  // Wrapping mode only: decides whether our wrapper needs a tab stop.
  const hasFocusable = useElementHasFocusable(wrapping ? anchor : null);
  const useFocus = triggers.includes('focus');

  // Fallback: wrapping mode carries the title itself; by-ref mode sets it in
  // useExternalAnchor, and by-name mode has no element for it.
  if (!styled) {
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
    '--tooltip-radius': bs.radius,
    '--tooltip-arrow-size': bs.arrowSize,
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
        {renderContent && (
          <TooltipBubble
            placement={effectivePlacement}
            arrowPlacement={arrowPlacement}
            bubbleStyle={bubbleStyle}
          >
            {content}
          </TooltipBubble>
        )}
      </div>
    </>
  );
};
