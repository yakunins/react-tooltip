import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { default as cx } from 'clsx';

import { TooltipAnchor } from './components/TooltipAnchor';
import { TooltipShape } from './components/TooltipShape';
import { useHasFocusable } from './hooks';
import type { Placement, TooltipShapeStyle, TooltipTrigger } from './types';

export type TooltipProps = {
  /** The trigger element the tooltip is attached to. */
  children: ReactNode;
  /** The tooltip bubble content. */
  content: ReactNode;
  /** Side of the anchor the bubble prefers. Default `'top'`. */
  placement?: Placement;
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
  shapeStyle?: TooltipShapeStyle;
  /** Class name applied to the popover element. */
  className?: string;
  /** Inline style applied to the popover element. */
  style?: CSSProperties;
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

/**
 * UnstyledTooltip — the tooltip behaviour, without the bundled stylesheet.
 *
 * Composition:
 *   <TooltipAnchor>  — wraps `children`, carries `anchor-name`
 *   <div popover>    — the top-layer element, pinned with `anchor()`
 *     <TooltipShape> — the clip-path bubble holding `content`
 *
 * Use this when the host app already ships `tooltip.css` itself; otherwise
 * use `Tooltip`, which injects the stylesheet at runtime.
 */
export const UnstyledTooltip = ({
  children,
  content,
  placement = 'top',
  trigger = ['hover', 'focus'],
  openDelay = 200,
  closeDelay = 100,
  offset = '0.25em',
  autoFlip = true,
  defaultOpen = false,
  open,
  onOpenChange,
  shapeStyle,
  className,
  style,
}: TooltipProps) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // anchor-name and id are derived from a sanitised useId() — useId()'s raw
  // output contains ':' which is invalid in a CSS <dashed-ident> / id.
  const safeId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const anchorName = `--tooltip-${safeId}`;
  const tooltipId = `tooltip-${safeId}`;

  // open state — controlled (`open`) or uncontrolled (`defaultOpen`)
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? (open as boolean) : internalOpen;

  // effective placement — may flip away from `placement` to stay on-screen
  const [effectivePlacement, setEffectivePlacement] =
    useState<Placement>(placement);

  const hasFocusable = useHasFocusable(anchorRef);

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

  // --- wire trigger listeners onto the anchor and the popover ---
  useEffect(() => {
    const anchor = anchorRef.current;
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
  }, [useHover, useFocus, useClick, scheduleOpen, scheduleClose, toggle]);

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

  const popoverStyle = {
    positionAnchor: anchorName,
    '--tooltip-offset': offset,
    '--tooltip-transition-duration': shapeStyle?.transitionDuration,
    ...style,
  } as CSSProperties;

  return (
    <>
      <TooltipAnchor
        ref={anchorRef}
        anchorName={anchorName}
        aria-describedby={tooltipId}
        tabIndex={!hasFocusable && useFocus ? 0 : undefined}
      >
        {children}
      </TooltipAnchor>
      <div
        ref={popoverRef}
        popover="manual"
        id={tooltipId}
        role="tooltip"
        className={cx(
          'tooltip-popover',
          `placement-${effectivePlacement}`,
          className
        )}
        style={popoverStyle}
      >
        <TooltipShape placement={effectivePlacement} shapeStyle={shapeStyle}>
          {content}
        </TooltipShape>
      </div>
    </>
  );
};
