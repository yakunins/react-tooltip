import type { CSSProperties, ReactNode, RefObject } from 'react';

import type {
  ArrowPlacement,
  Placement,
  TooltipBubbleStyle,
  TooltipTimings,
  TooltipTrigger,
} from '../types';

export type TooltipProps = {
  /** The trigger to wrap; omit when using `anchorRef` or `anchorName`. */
  children?: ReactNode;
  /** The tooltip bubble content. */
  content: ReactNode;
  /** Side of the anchor the bubble prefers. Default `'top'`. */
  placement?: Placement;
  /**
   * Arrow position along the bubble edge; `'start'` / `'end'` extend the
   * bubble the other way. Default `'center'`.
   */
  arrowPlacement?: ArrowPlacement;
  /** Interactions that reveal the tooltip. Default `['hover', 'focus']`. */
  triggers?: TooltipTrigger[];
  /** Trigger timings in ms; pass any subset, the rest keep their defaults. */
  timings?: TooltipTimings;
  /** Gap between anchor and bubble, any CSS length. Default `'0rem'`. */
  offset?: string;
  /** Flip to the opposite side when out of room. Default `true`. */
  flip?: boolean;
  /** Fade duration (CSS time); the flip slide takes 2x. Default `'0.2s'`. */
  animationDuration?: string;
  /** Initial open state, for uncontrolled usage. Default `false`. */
  defaultOpen?: boolean;
  /** Open state, for controlled usage; pair with `onOpenChange`. */
  open?: boolean;
  /** Called whenever the open state should change. */
  onOpenChange?: (open: boolean) => void;
  /** Visual customization of the bubble. */
  bubbleStyle?: TooltipBubbleStyle;
  /** Class name applied to the popover element. */
  className?: string;
  /** Inline style applied to the popover element. */
  style?: CSSProperties;
  /** Attach to this element instead of wrapping `children`. */
  anchorRef?: RefObject<HTMLElement>;
  /** Attach by CSS anchor name; alone it wires no triggers, so use `open`. */
  anchorName?: string;
};

// Typed against TooltipProps: renaming a defaulted prop breaks the build here.
type TooltipDefaults = Required<
  Pick<
    TooltipProps,
    | 'placement'
    | 'arrowPlacement'
    | 'triggers'
    | 'timings'
    | 'offset'
    | 'flip'
    | 'animationDuration'
    | 'defaultOpen'
  >
>;

// Default trigger timings; a `timings` prop is layered over these.
export const TOOLTIP_DEFAULTS_TIMINGS: Required<TooltipTimings> = {
  showDelay: 200,
  hideDelay: 100,
  clickGuard: 1000,
  minVisibleTime: 1000,
};

export const TOOLTIP_DEFAULTS: TooltipDefaults = {
  placement: 'top',
  arrowPlacement: 'center',
  triggers: ['hover', 'focus'],
  timings: TOOLTIP_DEFAULTS_TIMINGS,
  offset: '0rem',
  flip: true,
  animationDuration: '0.2s',
  defaultOpen: false,
};
