import type { CSSProperties } from 'react';

/** Side of the anchor the tooltip bubble is placed on. */
export type Placement = 'top' | 'bottom' | 'left' | 'right';

/** Interaction that reveals the tooltip. */
export type TooltipTrigger = 'hover' | 'focus' | 'click';

/**
 * Visual customisation of the tooltip bubble.
 *
 * Every field maps to a CSS custom property consumed by `tooltipShape.css`;
 * any omitted field falls back to the stylesheet default.
 */
export type TooltipShapeStyle = {
  /** Bubble background. Default `#1f1f1f`. */
  background?: CSSProperties['background'];
  /** Text color. Default `#fff`. */
  color?: CSSProperties['color'];
  /** Bubble font size. Default `0.875em`. */
  fontSize?: CSSProperties['fontSize'];
  /** Corner radius, any CSS length. Default `0.4em`. */
  radius?: CSSProperties['borderRadius'];
  /** Arrow size (half-diagonal), any CSS length. Default `0.5em`. */
  arrowSize?: string;
  /** Horizontal padding, any CSS length. Default `0.7em`. */
  paddingX?: string;
  /** Vertical padding, any CSS length. Default `0.4em`. */
  paddingY?: string;
  /** Maximum bubble width. Default `16rem`. */
  maxWidth?: CSSProperties['maxWidth'];
  /** Fade in/out duration. Default `0.16s`. */
  transitionDuration?: CSSProperties['transitionDuration'];
};
