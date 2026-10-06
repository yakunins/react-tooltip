import type { Placement } from '../types';

export const OPPOSITE: Record<Placement, Placement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

// Edge slack (px), used both as the observer margin and in the fit test.
export const FLIP_THRESHOLD = 10;
// Graded ratios re-run the decision as the bubble clips; [0, 1] alone fires
// only once it has fully left.
export const FLIP_RATIOS = Array.from({ length: 21 }, (_, i) => i / 20);

export interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

type Rect = Pick<
  DOMRect,
  'top' | 'bottom' | 'left' | 'right' | 'width' | 'height'
>;

export const isVertical = (p: Placement): boolean =>
  p === 'top' || p === 'bottom';

// Nearest scrolling ancestor (null = the page). It can't clip the top-layer
// bubble, but a bubble past its edge looks detached.
export const findScrollContainer = (el: HTMLElement): HTMLElement | null => {
  const root = document.documentElement;
  for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
    if (p === document.body) break;
    const { overflowX, overflowY } = getComputedStyle(p);
    if (/auto|scroll|hidden|overlay/.test(overflowX + overflowY)) return p;
  }
  return null;
};

// The viewport, narrowed to the scroll container's visible padding box.
export const getBounds = (container: HTMLElement | null): Bounds => {
  const b: Bounds = {
    top: 0,
    left: 0,
    bottom: document.documentElement.clientHeight,
    right: document.documentElement.clientWidth,
  };
  if (container) {
    const r = container.getBoundingClientRect();
    const top = r.top + container.clientTop;
    const left = r.left + container.clientLeft;
    b.top = Math.max(b.top, top);
    b.left = Math.max(b.left, left);
    b.bottom = Math.min(b.bottom, top + container.clientHeight);
    b.right = Math.min(b.right, left + container.clientWidth);
  }
  return b;
};

// Sticky on the current side: flip only when it runs out of room, so a side
// regaining space never pulls the bubble back (no oscillation).
export const choosePlacement = (
  current: Placement,
  anchor: Rect,
  bubble: Rect,
  bounds: Bounds
): Placement => {
  const space: Record<Placement, number> = {
    top: anchor.top - bounds.top,
    bottom: bounds.bottom - anchor.bottom,
    left: anchor.left - bounds.left,
    right: bounds.right - anchor.right,
  };
  const need = isVertical(current) ? bubble.height : bubble.width;
  const opp = OPPOSITE[current];
  if (space[current] >= need + FLIP_THRESHOLD) return current;
  if (space[opp] >= need + FLIP_THRESHOLD) return opp;
  return space[current] >= space[opp] ? current : opp;
};

// Root margin for watching the anchor in `container`: inset by the bubble on
// the placement's axis, under half the container (an empty root never fires).
export const containerRootMargin = (
  placement: Placement,
  bubble: Pick<DOMRect, 'width' | 'height'>,
  container: Pick<HTMLElement, 'clientWidth' | 'clientHeight'>
): string => {
  const inset = (size: number, box: number) =>
    Math.max(0, Math.min(Math.round(size) + FLIP_THRESHOLD, box / 2 - 1));
  const v = isVertical(placement)
    ? inset(bubble.height, container.clientHeight)
    : 0;
  const h = isVertical(placement)
    ? 0
    : inset(bubble.width, container.clientWidth);
  return `${-v}px ${-h}px`;
};
