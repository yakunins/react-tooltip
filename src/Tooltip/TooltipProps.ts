import type { CSSProperties, ReactNode, RefObject } from 'react';

import type {
  ArrowPlacement,
  Placement,
  TooltipBubbleStyle,
  TooltipTimings,
  TooltipTrigger,
} from '../types';

export type TooltipProps = {
  /**
   * The trigger element to wrap. Required in *wrapping mode*; omit when
   * pairing with `anchorRef` or `anchorName` to attach to an existing
   * element.
   */
  children?: ReactNode;
  /** The tooltip bubble content. */
  content: ReactNode;
  /** Side of the anchor the bubble prefers. Default `'top'`. */
  placement?: Placement;
  /**
   * Where the arrow sits along the bubble edge. The arrow always points at the
   * anchor's center; `arrowPlacement` only chooses which way the bubble body
   * extends. `'center'` (default) centers the bubble on the anchor; `'start'`
   * keeps the arrow near the bubble's leading edge so the body extends toward
   * the trailing side; `'end'` mirrors that. Default `'center'`.
   */
  arrowPlacement?: ArrowPlacement;
  /** Interactions that reveal the tooltip. Default `['hover', 'focus']`. */
  trigger?: TooltipTrigger[];
  /**
   * Timing knobs (all in ms) for the trigger interactions: `delayShow`,
   * `delayHide`, `clickCloseGuard`, and `minVisibleDuration`. Pass any subset;
   * omitted fields keep their defaults (see `TooltipTimings` /
   * `TOOLTIP_DEFAULTS_TIMINGS`).
   */
  timings?: TooltipTimings;
  /** Gap between anchor and bubble, any CSS length. Default `'0.25em'`. */
  offset?: string;
  /** Flip to the opposite side when the bubble would overflow. Default `true`. */
  autoFlip?: boolean;
  /** Initial open state, for uncontrolled usage. Default `false`. */
  defaultOpen?: boolean;
  /** Open state, for controlled usage; pair with `onOpenChange`. */
  open?: boolean;
  /** Called whenever the open state should change. */
  onOpenChange?: (open: boolean) => void;
  /** Visual customisation of the bubble. */
  bubbleStyle?: TooltipBubbleStyle;
  /** Class name applied to the popover element. */
  className?: string;
  /** Inline style applied to the popover element. */
  style?: CSSProperties;
  /**
   * Attach to an existing element by ref instead of wrapping `children`.
   * Tooltip writes `anchor-name` onto the referenced element (unless you
   * also supply `anchorName`), wires the configured triggers to it, and
   * mirrors `aria-describedby` on it for accessibility.
   */
  anchorRef?: RefObject<HTMLElement>;
  /**
   * Attach to an existing element by CSS anchor name (a `<dashed-ident>`
   * you have already applied via `style={{ anchorName: '--x' }}` or in a
   * stylesheet). When used *without* `anchorRef`, Tooltip cannot wire
   * trigger listeners — pair with controlled `open` / `onOpenChange`.
   */
  anchorName?: string;
};

/**
 * Default values for the props that have a concrete fallback. Typed against
 * `TooltipProps` so renaming or removing one of these props breaks the build
 * right here; the remaining props (`open`, `onOpenChange`, `bubbleStyle`,
 * `className`, `style`, `anchorRef`, `anchorName`) intentionally default to
 * `undefined` and are not listed.
 */
type TooltipDefaults = Required<
  Pick<
    TooltipProps,
    | 'placement'
    | 'arrowPlacement'
    | 'trigger'
    | 'timings'
    | 'offset'
    | 'autoFlip'
    | 'defaultOpen'
  >
>;

/** Default trigger timings; a `timings` prop is layered over this. */
export const TOOLTIP_DEFAULTS_TIMINGS: Required<TooltipTimings> = {
  delayShow: 200,
  delayHide: 100,
  clickCloseGuard: 1000,
  minVisibleDuration: 1000,
};

export const TOOLTIP_DEFAULTS: TooltipDefaults = {
  placement: 'top',
  arrowPlacement: 'center',
  trigger: ['hover', 'focus'],
  timings: TOOLTIP_DEFAULTS_TIMINGS,
  offset: '0.25em',
  autoFlip: true,
  defaultOpen: false,
};
