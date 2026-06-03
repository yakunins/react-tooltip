import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { default as cx } from 'clsx';

import { useStyleInjector } from '../hooks';
import {
  type ArrowPlacement,
  type Placement,
  type TooltipBubbleStyle,
} from '../types';
import { default as shapeCss } from './tooltipShape.css.generated.js';

type DivProps = HTMLAttributes<HTMLDivElement>;

export type TooltipShapeProps = DivProps & {
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
 * TooltipShape — the visual bubble.
 *
 * The rounded rectangle *and* its arrow are drawn as a single
 * `clip-path: polygon(...)` — no borders, no pseudo-elements, no SVG — so
 * the arrow inherits the bubble's background, shadow and corner radius for
 * free. The arrow points back toward the anchor, i.e. opposite `placement`.
 *
 * It injects its own stylesheet (`tooltipShape.css`) at runtime, so it
 * renders correctly on its own — no CSS import required by the consumer.
 */
export const TooltipShape = ({
  placement = 'top',
  arrowPlacement = 'center',
  bubbleStyle,
  className,
  style,
  children,
  ...rest
}: TooltipShapeProps) => {
  useStyleInjector(shapeCss.content);

  const vars: CSSProperties = {
    '--tooltip-background': bubbleStyle?.background,
    '--tooltip-color': bubbleStyle?.color,
    '--tooltip-font-size': bubbleStyle?.fontSize,
    '--tooltip-radius': bubbleStyle?.radius,
    '--tooltip-arrow-size': bubbleStyle?.arrowSize,
    '--tooltip-padding-x': bubbleStyle?.paddingX,
    '--tooltip-padding-y': bubbleStyle?.paddingY,
    '--tooltip-max-width': bubbleStyle?.maxWidth,
    ...style,
  } as CSSProperties;

  return (
    <div
      {...rest}
      className={cx(
        'tooltip',
        `placement-${placement}`,
        `arrow-${arrowPlacement}`,
        className
      )}
      style={vars}
    >
      {children}
    </div>
  );
};
