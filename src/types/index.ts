import type { CSSProperties } from 'react';

/** Side of the anchor the tooltip bubble is placed on. */
export type Placement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Where the arrow sits along the bubble edge. In every case the arrow keeps
 * pointing at the anchor's center; what changes is which way the bubble body
 * extends from it. `'center'` (default) centers the bubble on the anchor;
 * `'start'` slides the arrow to the bubble's leading edge so the body extends
 * toward the trailing side; `'end'` mirrors that. Handy when the anchor is
 * near a viewport edge and the bubble should grow the other way.
 *
 * The axis follows `placement`: for `top`/`bottom` it runs left→right, for
 * `left`/`right` it runs top→bottom.
 */
export type ArrowPlacement = 'start' | 'center' | 'end';

/** Interaction that reveals the tooltip. */
export type TooltipTrigger = 'hover' | 'focus' | 'click';

/**
 * Visual customisation of the tooltip bubble.
 *
 * Every field maps to a CSS custom property consumed by `tooltipShape.css`;
 * any omitted field falls back to the stylesheet default.
 */
export type TooltipBubbleStyle = {
  /** Bubble background. Default `#000`. */
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
