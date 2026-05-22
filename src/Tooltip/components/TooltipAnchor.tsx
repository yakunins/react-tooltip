import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { default as cx } from 'clsx';

import { useAnchorPolyfill } from '../hooks';

type DivProps = HTMLAttributes<HTMLDivElement>;

export type TooltipAnchorProps = DivProps & {
  /**
   * CSS anchor name — a `<dashed-ident>` such as `--tooltip-r1`. The tooltip
   * popover references it through `position-anchor` and `anchor()`.
   */
  anchorName: string;
  /** The trigger element. */
  children?: ReactNode;
};

/**
 * TooltipAnchor — the "anchor" half of CSS anchor positioning.
 *
 * Wraps the trigger in an `inline-block` box and exposes that box as a
 * positioning anchor via the `anchor-name` property. A fixed-positioned
 * (top-layer) tooltip popover then pins itself to this box with
 * `position-anchor` + `anchor()`, so it tracks the trigger through scroll
 * and layout changes with no JavaScript measuring.
 *
 * Browsers that lack native anchor positioning (currently Firefox) get the
 * `@oddbird` polyfill, loaded on demand by `useAnchorPolyfill`.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/position-anchor
 */
export const TooltipAnchor = forwardRef<HTMLDivElement, TooltipAnchorProps>(
  ({ anchorName, className, style, children, ...rest }, ref) => {
    useAnchorPolyfill();

    // `anchorName` is not yet in CSSProperties — set it through a cast.
    const vars = {
      anchorName,
      ...style,
    } as CSSProperties;

    return (
      <div
        {...rest}
        ref={ref}
        className={cx('tooltip-anchor', className)}
        style={vars}
      >
        {children}
      </div>
    );
  }
);

TooltipAnchor.displayName = 'TooltipAnchor';
