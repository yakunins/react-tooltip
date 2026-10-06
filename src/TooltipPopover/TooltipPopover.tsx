import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { useStyleInjector } from '../hooks';
import type { ArrowPlacement, Placement } from '../types';
import { cx } from '../utils/cx';
import { default as popoverCss } from './tooltipPopover.css.generated.js';

type DivProps = HTMLAttributes<HTMLDivElement>;

export type TooltipPopoverProps = DivProps & {
  /** Side of the anchor the popover sits on. */
  placement: Placement;
  /** Arrow position along the bubble edge. Default `'center'`. */
  arrowPlacement?: ArrowPlacement;
  /** Anchor scrolled out of sight: the popover ignores the pointer. */
  anchorHidden?: boolean;
  /** Usually a `TooltipBubble`. */
  children?: ReactNode;
};

/**
 * The top-layer popover (`popover="manual"`, `role="tooltip"`) that holds the
 * bubble and pins itself to the anchor with CSS anchor positioning. Injects
 * its own stylesheet.
 */
export const TooltipPopover = forwardRef<HTMLDivElement, TooltipPopoverProps>(
  (
    {
      placement,
      arrowPlacement = 'center',
      anchorHidden = false,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    useStyleInjector(popoverCss);
    return (
      <div
        {...rest}
        ref={ref}
        popover="manual"
        role="tooltip"
        className={cx('tooltip-popover', className)}
        data-placement={placement}
        data-arrow={arrowPlacement}
        data-anchor-hidden={anchorHidden || undefined}
      >
        {children}
      </div>
    );
  }
);

TooltipPopover.displayName = 'TooltipPopover';
