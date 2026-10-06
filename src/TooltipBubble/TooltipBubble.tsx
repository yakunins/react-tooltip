import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { withDefaults } from '../utils/withDefaults';

import { useStyleInjector } from '../hooks';
import {
  type ArrowPlacement,
  type Placement,
  type TooltipBubbleStyle,
} from '../types';
import { default as bubbleCss } from './tooltipBubble.css.generated.js';

/** Default `bubbleStyle`; a consumer's `bubbleStyle` is layered on top. */
export const DEFAULT_BUBBLE_STYLE: Required<TooltipBubbleStyle> = {
  background: '#000',
  color: '#fff',
  fontSize: '0.875rem',
  radius: '0.5rem',
  arrowSize: '0.5rem',
  paddingX: '0.7rem',
  paddingY: '0.4rem',
  maxWidth: '16rem',
  cornerSegments: 5,
};

// Supported corner-segment counts; anything else falls back to the default.
const CORNER_SEGMENTS = [3, 5, 7] as const;

type DivProps = HTMLAttributes<HTMLDivElement>;

export type TooltipBubbleProps = DivProps & {
  /** Side of the anchor the bubble sits on. Default `'top'`. */
  placement?: Placement;
  /** Where the arrow sits along the bubble edge. Default `'center'`. */
  arrowPlacement?: ArrowPlacement;
  /** Visual customization of the bubble. */
  bubbleStyle?: TooltipBubbleStyle;
  /** Bubble content. */
  children?: ReactNode;
};

/** The bubble and its arrow as one `clip-path` polygon; injects its own CSS. */
export const TooltipBubble = ({
  placement = 'top',
  arrowPlacement = 'center',
  bubbleStyle,
  className,
  style,
  children,
  ...rest
}: TooltipBubbleProps) => {
  useStyleInjector(bubbleCss);

  // tooltipBubble.css has no fallbacks, so every field resolves here.
  const bs = withDefaults(DEFAULT_BUBBLE_STYLE, bubbleStyle);
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
      className={cx('tooltip-bubble', className)}
      data-placement={placement}
      data-arrow={arrowPlacement}
      data-corners={segments}
      style={vars}
    >
      {children}
    </div>
  );
};
