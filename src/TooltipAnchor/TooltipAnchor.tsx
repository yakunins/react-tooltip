import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../utils/cx';

import { useStyleInjector } from '../hooks';
import { default as anchorCss } from './tooltipAnchor.css.generated.js';

type DivProps = HTMLAttributes<HTMLDivElement>;

export type TooltipAnchorProps = DivProps & {
  /** CSS anchor name, a `<dashed-ident>` such as `--tooltip-r1`. */
  anchorName: string;
  /** The trigger element. */
  children?: ReactNode;
};

/**
 * Wraps the trigger in an `inline-block` box exposed as a CSS anchor
 * (`anchor-name`), which the tooltip popover pins itself to.
 */
export const TooltipAnchor = forwardRef<HTMLDivElement, TooltipAnchorProps>(
  ({ anchorName, className, style, children, ...rest }, ref) => {
    useStyleInjector(anchorCss.content);

    // `anchorName` isn't in CSSProperties yet, hence the cast.
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
