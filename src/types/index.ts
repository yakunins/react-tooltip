import type { CSSProperties } from 'react';

/** Side of the anchor the tooltip bubble is placed on. */
export type Placement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Where the arrow sits along the bubble edge; it always points at the anchor.
 * `'start'` / `'end'` extend the bubble body toward the other side.
 */
export type ArrowPlacement = 'start' | 'center' | 'end';

/** Interaction that reveals the tooltip. */
export type TooltipTrigger = 'hover' | 'focus' | 'click';

/** Trigger timings in ms; omitted fields keep their defaults. */
export type TooltipTimings = {
  /** Delay before showing on hover/focus; click is instant. Default `200`. */
  showDelay?: number;
  /** Delay before hiding on hover-out/blur; click is instant. Default `100`. */
  hideDelay?: number;
  /**
   * After a hover/focus reveal, a click within this window keeps the tooltip
   * open instead of closing it. `0` disables it. Default `1000`.
   */
  clickGuard?: number;
  /**
   * Minimum time a hover/focus-revealed tooltip stays visible; click and Escape
   * ignore it. `0` disables it. Default `1000`.
   */
  minVisibleTime?: number;
};

/** Visual customisation of the tooltip bubble. */
export type TooltipBubbleStyle = {
  /** Bubble background. Default `#000`. */
  background?: CSSProperties['background'];
  /** Text color. Default `#fff`. */
  color?: CSSProperties['color'];
  /** Bubble font size. Default `0.875rem`. */
  fontSize?: CSSProperties['fontSize'];
  /** Corner radius, any CSS length. Default `0.5rem`. */
  radius?: CSSProperties['borderRadius'];
  /** Arrow size (half-diagonal), any CSS length. Default `0.5rem`. */
  arrowSize?: string;
  /** Horizontal padding, any CSS length. Default `0.7rem`. */
  paddingX?: string;
  /** Vertical padding, any CSS length. Default `0.4rem`. */
  paddingY?: string;
  /** Maximum bubble width. Default `16rem`. */
  maxWidth?: CSSProperties['maxWidth'];
  /** Straight segments per rounded corner; more is smoother. Default `5`. */
  cornerSegments?: 3 | 5 | 7;
};
