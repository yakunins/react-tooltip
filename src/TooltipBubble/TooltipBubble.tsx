import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';

import { useStyleInjector } from '../hooks';
import {
  type ArrowPlacement,
  type Placement,
  type TooltipBubbleStyle,
} from '../types';
import { default as bubbleCss } from './tooltipBubble.css.generated.js';
import { default as cornersCss } from './roundedCorners.css.generated.js';

/**
 * The bubble's default appearance — the single source of truth for every
 * `TooltipBubbleStyle` field. A consumer's `bubbleStyle` is layered on top and
 * each resolved field is applied as a CSS custom property (or, for
 * `cornerSegments`, the `.corners-N` class), so `tooltipBubble.css` no longer
 * carries its own `--default-*` fallbacks. `transitionDuration` is consumed by
 * the popover layer (see `Tooltip.tsx`), the rest by the bubble here.
 */
export const DEFAULT_BUBBLE_STYLE: Required<TooltipBubbleStyle> = {
  background: '#000',
  color: '#fff',
  fontSize: '0.875rem',
  radius: '0.5rem',
  arrowSize: '0.5rem',
  paddingX: '0.7rem',
  paddingY: '0.4rem',
  maxWidth: '16rem',
  transitionDuration: '0.2s',
  cornerSegments: 5,
};

// Supported corner-segment counts; anything else falls back to the default.
const CORNER_SEGMENTS = [3, 4, 5, 6, 7] as const;

type DivProps = HTMLAttributes<HTMLDivElement>;

export type TooltipBubbleProps = DivProps & {
  /** Side of the anchor the bubble sits on; the arrow points the other way. */
  placement?: Placement;
  /**
   * Where the arrow sits along the bubble edge. `'center'` (default) centers
   * it; `'start'`/`'end'` slide it toward the leading/trailing edge. Default
   * `'center'`.
   */
  arrowPlacement?: ArrowPlacement;
  /** Visual customisation; each field maps to a CSS custom property. */
  bubbleStyle?: TooltipBubbleStyle;
  /** Bubble content. */
  children?: ReactNode;
};

/**
 * TooltipBubble — the visual bubble.
 *
 * The rounded rectangle *and* its arrow are drawn as a single
 * `clip-path: polygon(...)` — no borders, no pseudo-elements, no SVG — so
 * the arrow inherits the bubble's background, shadow and corner radius for
 * free. The arrow points back toward the anchor, i.e. opposite `placement`.
 *
 * It injects its own stylesheet (`tooltipBubble.css`) at runtime, so it
 * renders correctly on its own — no CSS import required by the consumer.
 */
export const TooltipBubble = ({
  placement = 'top',
  arrowPlacement = 'center',
  bubbleStyle,
  className,
  style,
  children,
  ...rest
}: TooltipBubbleProps) => {
  useStyleInjector(bubbleCss.content);
  useStyleInjector(cornersCss.content);

  // Resolve every field against the defaults (ignoring explicit `undefined`),
  // so the merged style is the single source of truth and tooltipBubble.css
  // needs no fallbacks of its own.
  const definedStyle = Object.fromEntries(
    Object.entries(bubbleStyle ?? {}).filter(([, v]) => v !== undefined)
  );
  const bs: Required<TooltipBubbleStyle> = {
    ...DEFAULT_BUBBLE_STYLE,
    ...definedStyle,
  };
  const segments = CORNER_SEGMENTS.includes(bs.cornerSegments)
    ? bs.cornerSegments
    : DEFAULT_BUBBLE_STYLE.cornerSegments;

  const vars: CSSProperties = {
    '--tooltip-background': bs.background,
    '--tooltip-color': bs.color,
    '--tooltip-font-size': bs.fontSize,
    '--tooltip-radius': bs.radius,
    '--tooltip-arrow-size': bs.arrowSize,
    '--tooltip-padding-x': bs.paddingX,
    '--tooltip-padding-y': bs.paddingY,
    '--tooltip-max-width': bs.maxWidth,
    ...style,
  } as CSSProperties;

  return (
    <div
      {...rest}
      className={cx(
        'tooltip-bubble',
        `placement-${placement}`,
        `arrow-${arrowPlacement}`,
        `corners-${segments}`,
        className
      )}
      style={vars}
    >
      {children}
    </div>
  );
};
