import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { default as cx } from 'clsx';

import { type Placement, type TooltipShapeStyle } from '../types';

type DivProps = HTMLAttributes<HTMLDivElement>;

export type TooltipShapeProps = DivProps & {
  /** Side of the anchor the bubble sits on; the arrow points the other way. */
  placement?: Placement;
  /** Visual customisation; each field maps to a CSS custom property. */
  shapeStyle?: TooltipShapeStyle;
  /** Bubble content. */
  children?: ReactNode;
};

/**
 * TooltipShape — the visual bubble.
 *
 * The rounded rectangle *and* its arrow are drawn as a single
 * `clip-path: polygon(...)` — no borders, no pseudo-elements, no SVG — so
 * the arrow inherits the bubble's background, shadow and corner radius for
 * free. The arrow points back toward the anchor, i.e. opposite `placement`:
 * `placement="top"` puts the bubble above the anchor with the arrow at its
 * bottom edge.
 *
 * The component is purely presentational: it neither positions itself nor
 * tracks an anchor (see `TooltipAnchor` and `Tooltip` for that).
 */
export const TooltipShape = ({
  placement = 'top',
  shapeStyle,
  className,
  style,
  children,
  ...rest
}: TooltipShapeProps) => {
  const vars: CSSProperties = {
    '--tooltip-background': shapeStyle?.background,
    '--tooltip-color': shapeStyle?.color,
    '--tooltip-font-size': shapeStyle?.fontSize,
    '--tooltip-radius': shapeStyle?.radius,
    '--tooltip-arrow-size': shapeStyle?.arrowSize,
    '--tooltip-padding-x': shapeStyle?.paddingX,
    '--tooltip-padding-y': shapeStyle?.paddingY,
    '--tooltip-max-width': shapeStyle?.maxWidth,
    ...style,
  } as CSSProperties;

  return (
    <div
      {...rest}
      className={cx('tooltip', `placement-${placement}`, className)}
      style={vars}
    >
      {children}
    </div>
  );
};
