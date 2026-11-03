import type { ArrowPlacement, Placement } from '../types';
import { FLIP_THRESHOLD, isVertical, type Bounds } from './flipGeometry';

type Rect = Pick<
  DOMRect,
  'top' | 'bottom' | 'left' | 'right' | 'width' | 'height'
>;

// Tie-break order when no arrow placement fits.
const ARROW_PLACEMENTS: ArrowPlacement[] = ['center', 'start', 'end'];

// Bubble reach from the arrow tip (on the anchor center) toward the start and
// the end of the cross axis.
const reach = (
  ap: ArrowPlacement,
  size: number,
  inset: number
): [number, number] => {
  if (ap === 'start') return [inset, size - inset];
  if (ap === 'end') return [size - inset, inset];
  return [size / 2, size / 2];
};

// How far the bubble pokes past the bounds (plus the edge slack) on the axis
// across `placement`, with the arrow at `ap`; 0 when it fits.
export const crossOverflow = (
  ap: ArrowPlacement,
  placement: Placement,
  anchor: Rect,
  bubble: Rect,
  bounds: Bounds,
  inset: number
): number => {
  const v = isVertical(placement);
  const center = v
    ? (anchor.left + anchor.right) / 2
    : (anchor.top + anchor.bottom) / 2;
  const [toStart, toEnd] = reach(ap, v ? bubble.width : bubble.height, inset);
  const min = (v ? bounds.left : bounds.top) + FLIP_THRESHOLD;
  const max = (v ? bounds.right : bounds.bottom) - FLIP_THRESHOLD;
  return (
    Math.max(0, min - (center - toStart)) + Math.max(0, center + toEnd - max)
  );
};

// Sticky like choosePlacement: keep `current` while it fits, else the arrow
// placement that overflows least. With `preferred` (`flipBack`), return there
// as soon as it fits again.
export const chooseArrowPlacement = (
  current: ArrowPlacement,
  placement: Placement,
  anchor: Rect,
  bubble: Rect,
  bounds: Bounds,
  inset: number,
  preferred?: ArrowPlacement
): ArrowPlacement => {
  const overflow = (ap: ArrowPlacement) =>
    crossOverflow(ap, placement, anchor, bubble, bounds, inset);
  if (preferred && overflow(preferred) === 0) return preferred;
  return [current, ...ARROW_PLACEMENTS].reduce((best, ap) =>
    overflow(ap) < overflow(best) ? ap : best
  );
};

// Root margins watching the anchor against `box` on the cross axis, one per
// distinct fit boundary, so crossing any of them re-runs the decision. Capped
// under half the box (an empty root never fires).
export const flipArrowRootMargins = (
  placement: Placement,
  anchor: Pick<DOMRect, 'width' | 'height'>,
  bubble: Pick<DOMRect, 'width' | 'height'>,
  inset: number,
  box: Pick<HTMLElement, 'clientWidth' | 'clientHeight'>
): string[] => {
  const v = isVertical(placement);
  const size = v ? bubble.width : bubble.height;
  const half = (v ? anchor.width : anchor.height) / 2;
  const cap = (v ? box.clientWidth : box.clientHeight) / 2 - 1;
  const margins = [size / 2, inset, size - inset].map(r => {
    const d = Math.min(Math.round(r - half) + FLIP_THRESHOLD, cap);
    return v ? `0px ${-d}px` : `${-d}px 0px`;
  });
  return [...new Set(margins)];
};
