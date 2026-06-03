import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { default as cx } from 'clsx';

import { TooltipAnchor } from '../TooltipAnchor';
import { TooltipShape } from '../TooltipShape';
import {
  useHasFocusable,
  useStyleInjector,
  useSupportsAnchorPositioning,
} from '../hooks';
import type {
  ArrowPlacement,
  Placement,
  TooltipBubbleStyle,
  TooltipTrigger,
} from '../types';
import { default as tooltipCss } from './tooltip.css.generated.js';

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
  /** Delay before showing, in ms. Default `200`. */
  openDelay?: number;
  /** Delay before hiding, in ms. Default `100`. */
  closeDelay?: number;
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
    | 'openDelay'
    | 'closeDelay'
    | 'offset'
    | 'autoFlip'
    | 'defaultOpen'
  >
>;

const TOOLTIP_DEFAULTS: TooltipDefaults = {
  placement: 'top',
  arrowPlacement: 'center',
  trigger: ['hover', 'focus'],
  openDelay: 200,
  closeDelay: 100,
  offset: '0.25em',
  autoFlip: true,
  defaultOpen: false,
};

const OPPOSITE: Record<Placement, Placement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

interface TouchMouseEvent extends MouseEvent {
  sourceCapabilities?: { firesTouchEvents?: boolean };
}

// Browsers fire synthetic mouse events after a touch — those must be ignored
// so the tooltip is not toggled twice on a single tap.
const isSyntheticFromTouch = (e?: Event): boolean =>
  Boolean(
    (e as TouchMouseEvent | undefined)?.sourceCapabilities?.firesTouchEvents
  );

// `useLayoutEffect` fires before paint (no positioning flash) but warns on
// the server; fall back to `useEffect` when there's no DOM.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Tooltip — top-layer tooltip built on the Popover API and CSS anchor
 * positioning.
 *
 * Three composition modes:
 *
 *   1. *Wrapping* (default) — pass `children`; Tooltip renders a
 *      `<TooltipAnchor>` wrapper and pins the bubble to it.
 *
 *   2. *External by ref* — pass `anchorRef` (omit `children`); Tooltip
 *      writes `anchor-name` onto the referenced element, wires the
 *      trigger listeners to it, and mirrors `aria-describedby`.
 *
 *   3. *External by name* — pass `anchorName` only (omit both `anchorRef`
 *      and `children`); Tooltip uses that CSS anchor name verbatim and
 *      does *not* wire any trigger listeners — pair with controlled
 *      `open` / `onOpenChange`.
 *
 * The component injects its own stylesheet at runtime, so no CSS import
 * or bundler CSS loader is required.
 *
 * Browsers without native CSS anchor positioning get a graceful fallback
 * rather than a polyfill: the styled bubble is skipped and `content` (when it
 * is a string) is surfaced through the element's native `title` tooltip.
 */
export const Tooltip = ({
  children,
  content,
  placement = TOOLTIP_DEFAULTS.placement,
  arrowPlacement = TOOLTIP_DEFAULTS.arrowPlacement,
  trigger = TOOLTIP_DEFAULTS.trigger,
  openDelay = TOOLTIP_DEFAULTS.openDelay,
  closeDelay = TOOLTIP_DEFAULTS.closeDelay,
  offset = TOOLTIP_DEFAULTS.offset,
  autoFlip = TOOLTIP_DEFAULTS.autoFlip,
  defaultOpen = TOOLTIP_DEFAULTS.defaultOpen,
  open,
  onOpenChange,
  bubbleStyle,
  className,
  style,
  anchorRef: anchorRefProp,
  anchorName: anchorNameProp,
}: TooltipProps) => {
  useStyleInjector(tooltipCss.content);
  // Native CSS anchor positioning is required for the styled bubble to track
  // its anchor. Where it is missing we degrade to a native `title` tooltip
  // instead of pulling in a positioning polyfill.
  const supported = useSupportsAnchorPositioning();

  const internalAnchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // `anchorNameProp` (if supplied) takes priority — the consumer owns the
  // CSS contract in that case. Otherwise we generate a CSS-safe dashed-ident.
  const safeId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const anchorName = anchorNameProp ?? `--tooltip-${safeId}`;
  const tooltipId = `tooltip-${safeId}`;

  // wrapping mode = no external anchor source provided
  const wrapping = !anchorRefProp && !anchorNameProp;

  // open state — controlled (`open`) or uncontrolled (`defaultOpen`)
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? (open as boolean) : internalOpen;

  // effective placement — may flip away from `placement` to stay on-screen
  const [effectivePlacement, setEffectivePlacement] =
    useState<Placement>(placement);

  // Only meaningful in wrapping mode; harmless when the wrapper is absent
  // (internalAnchorRef.current stays null, hasFocusable stays false).
  const hasFocusable = useHasFocusable(internalAnchorRef);

  const useHover = trigger.includes('hover');
  const useFocus = trigger.includes('focus');
  const useClick = trigger.includes('click');

  // --- stable commit path: refs keep event handlers free of stale props ---
  const openRef = useRef(isOpen);
  openRef.current = isOpen;
  const commitRef = useRef<(next: boolean) => void>(() => {});
  commitRef.current = (next: boolean) => {
    if (next === openRef.current) return;
    openRef.current = next;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const delaysRef = useRef({ openDelay, closeDelay });
  delaysRef.current = { openDelay, closeDelay };

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const scheduleOpen = useCallback(
    (e?: Event) => {
      if (isSyntheticFromTouch(e)) return;
      clearTimer();
      timer.current = setTimeout(
        () => commitRef.current(true),
        delaysRef.current.openDelay
      );
    },
    [clearTimer]
  );

  const scheduleClose = useCallback(
    (e?: Event) => {
      if (isSyntheticFromTouch(e)) return;
      clearTimer();
      timer.current = setTimeout(
        () => commitRef.current(false),
        delaysRef.current.closeDelay
      );
    },
    [clearTimer]
  );

  const toggle = useCallback(
    (e?: Event) => {
      if (isSyntheticFromTouch(e)) return;
      clearTimer();
      commitRef.current(!openRef.current);
    },
    [clearTimer]
  );

  // clear any pending timer on unmount
  useEffect(() => clearTimer, [clearTimer]);

  // --- external-by-ref: write `anchor-name` onto the consumer's element ---
  // Skipped when `anchorNameProp` is supplied — then the consumer owns it —
  // and when native anchor positioning is missing (the title fallback runs
  // instead of the styled bubble).
  useIsoLayoutEffect(() => {
    if (!supported || !anchorRefProp || anchorNameProp) return;
    const el = anchorRefProp.current;
    if (!el) return;
    const prev = el.style.getPropertyValue('anchor-name');
    el.style.setProperty('anchor-name', anchorName);
    return () => {
      if (prev) el.style.setProperty('anchor-name', prev);
      else el.style.removeProperty('anchor-name');
    };
  }, [supported, anchorRefProp, anchorName, anchorNameProp]);

  // --- external-by-ref fallback: mirror string content onto the consumer's
  // element as a native `title` when anchor positioning is unsupported ---
  useIsoLayoutEffect(() => {
    if (supported) return;
    const el = anchorRefProp?.current;
    if (!el || typeof content !== 'string') return;
    const prev = el.getAttribute('title');
    el.setAttribute('title', content);
    return () => {
      if (prev !== null) el.setAttribute('title', prev);
      else el.removeAttribute('title');
    };
  }, [supported, anchorRefProp, content]);

  // --- external-by-ref: mirror aria-describedby for accessibility ---
  // Preserves any pre-existing tokens; restored on unmount. Skipped without
  // anchor positioning, where there is no popover for the id to reference.
  useIsoLayoutEffect(() => {
    if (!supported || !anchorRefProp) return;
    const el = anchorRefProp.current;
    if (!el) return;
    const prev = el.getAttribute('aria-describedby');
    const ids = prev ? prev.split(/\s+/).filter(Boolean) : [];
    if (!ids.includes(tooltipId)) {
      el.setAttribute('aria-describedby', [...ids, tooltipId].join(' '));
    }
    return () => {
      const cur = el.getAttribute('aria-describedby');
      if (!cur) return;
      const remaining = cur
        .split(/\s+/)
        .filter(id => id && id !== tooltipId);
      if (remaining.length) {
        el.setAttribute('aria-describedby', remaining.join(' '));
      } else {
        el.removeAttribute('aria-describedby');
      }
    };
  }, [supported, anchorRefProp, tooltipId]);

  // --- wire trigger listeners onto the anchor and the popover ---
  useEffect(() => {
    if (!supported) return; // no popover to reveal in the title fallback
    // external-by-ref uses the consumer's element; wrapping uses our own.
    // external-by-name (no ref of any kind) has no element to listen to.
    const anchor = anchorRefProp?.current ?? internalAnchorRef.current;
    const popover = popoverRef.current;
    if (!anchor) return;

    const cleanups: Array<() => void> = [];
    const on = (el: HTMLElement, type: string, fn: (e: Event) => void) => {
      el.addEventListener(type, fn);
      cleanups.push(() => el.removeEventListener(type, fn));
    };

    if (useHover) {
      on(anchor, 'mouseenter', scheduleOpen);
      on(anchor, 'mouseleave', scheduleClose);
      // keep the tooltip open while the pointer is over the bubble itself
      if (popover) {
        on(popover, 'mouseenter', scheduleOpen);
        on(popover, 'mouseleave', scheduleClose);
      }
    }
    if (useFocus) {
      on(anchor, 'focusin', scheduleOpen);
      on(anchor, 'focusout', scheduleClose);
    }
    if (useClick) {
      on(anchor, 'click', toggle);
    }
    return () => cleanups.forEach(fn => fn());
  }, [
    supported,
    useHover,
    useFocus,
    useClick,
    scheduleOpen,
    scheduleClose,
    toggle,
    anchorRefProp,
  ]);

  // --- Escape closes the tooltip while it is open ---
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTimer();
        commitRef.current(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, clearTimer]);

  // --- drive the native Popover API from `isOpen` ---
  useEffect(() => {
    const el = popoverRef.current;
    if (!el || typeof el.showPopover !== 'function') return;
    const shown = el.matches(':popover-open');
    try {
      if (isOpen && !shown) el.showPopover();
      else if (!isOpen && shown) el.hidePopover();
    } catch {
      // showPopover/hidePopover throw if the element is in the wrong state
    }
  }, [isOpen]);

  // --- reset the effective placement to `placement` on every open ---
  useEffect(() => {
    if (isOpen) setEffectivePlacement(placement);
  }, [isOpen, placement]);

  // --- auto-flip: once visible, flip placement if the bubble overflows ---
  useEffect(() => {
    if (!autoFlip || !isOpen) return;
    const el = popoverRef.current;
    if (!el) return;

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      // second frame: positioning (native or polyfilled) has settled
      raf2 = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const m = 8; // viewport safety margin, px
        const overflow: Record<Placement, boolean> = {
          top: r.top < m,
          bottom: r.bottom > window.innerHeight - m,
          left: r.left < m,
          right: r.right > window.innerWidth - m,
        };
        setEffectivePlacement(
          overflow[placement] ? OPPOSITE[placement] : placement
        );
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [autoFlip, isOpen, placement]);

  // --- fallback: no native anchor positioning -> native `title` tooltip ---
  // Wrapping mode owns an element to carry the title; external modes attach it
  // to the consumer's element (by-ref, via the effect above) or cannot (by-name).
  if (!supported) {
    if (!wrapping) return null;
    const title = typeof content === 'string' ? content : undefined;
    return (
      <span style={{ display: 'inline-block' }} title={title}>
        {children}
      </span>
    );
  }

  const popoverStyle = {
    positionAnchor: anchorName,
    '--tooltip-offset': offset,
    '--tooltip-transition-duration': bubbleStyle?.transitionDuration,
    // Mirrored so the popover can compute --tooltip-arrow-inset (the
    // arrow-start / arrow-end shift) from the same radius / arrow size the
    // bubble uses; omitted values fall back to the CSS defaults.
    '--tooltip-radius': bubbleStyle?.radius,
    '--tooltip-arrow-size': bubbleStyle?.arrowSize,
    ...style,
  } as CSSProperties;

  return (
    <>
      {wrapping && (
        <TooltipAnchor
          ref={internalAnchorRef}
          anchorName={anchorName}
          aria-describedby={tooltipId}
          tabIndex={!hasFocusable && useFocus ? 0 : undefined}
        >
          {children}
        </TooltipAnchor>
      )}
      <div
        ref={popoverRef}
        popover="manual"
        id={tooltipId}
        role="tooltip"
        className={cx(
          'tooltip-popover',
          `placement-${effectivePlacement}`,
          `arrow-${arrowPlacement}`,
          className
        )}
        style={popoverStyle}
      >
        <TooltipShape
          placement={effectivePlacement}
          arrowPlacement={arrowPlacement}
          bubbleStyle={bubbleStyle}
        >
          {content}
        </TooltipShape>
      </div>
    </>
  );
};
