import type { CSSProperties, ReactNode, RefObject } from 'react';

import type {
  ArrowPlacement,
  Placement,
  TooltipBubbleStyle,
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
   * Delay before showing on hover/focus, in ms. Applies only to the `hover`
   * and `focus` triggers; a `click` shows the tooltip instantly. Default `200`.
   */
  delayShow?: number;
  /**
   * Delay before hiding on hover-out/blur, in ms. Applies only to the `hover`
   * and `focus` triggers; a dismissing `click` hides instantly. Default `100`.
   */
  delayHide?: number;
  /**
   * With both `hover` and `click` triggers, suppress click-to-close for this
   * many ms after a hover/focus reveal — a click within the window pins the
   * tooltip instead of closing it, preventing an accidental close right as it
   * appears. Measured from when the tooltip opens (excludes `delayShow` and the
   * fade-in). `0` disables the guard. Default `500`.
   */
  clickCloseGuard?: number;
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
    | 'delayShow'
    | 'delayHide'
    | 'clickCloseGuard'
    | 'offset'
    | 'autoFlip'
    | 'defaultOpen'
  >
>;

export const TOOLTIP_DEFAULTS: TooltipDefaults = {
  placement: 'top',
  arrowPlacement: 'center',
  trigger: ['hover', 'focus'],
  delayShow: 200,
  delayHide: 100,
  clickCloseGuard: 500,
  offset: '0.25em',
  autoFlip: true,
  defaultOpen: false,
};
