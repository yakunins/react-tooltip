import {
  flipArrowRootMargins,
  chooseArrowPlacement,
  crossOverflow,
} from '../src/utils/flipArrowGeometry';
import { FLIP_THRESHOLD, type Bounds } from '../src/utils/flipGeometry';

const rect = (top: number, left: number, width: number, height: number) => ({
  top,
  left,
  width,
  height,
  bottom: top + height,
  right: left + width,
});

const viewport: Bounds = { top: 0, left: 0, bottom: 600, right: 800 };
const bubble = rect(0, 0, 80, 40);
const INSET = 12;
// A 20px-wide anchor centered at x.
const at = (x: number) => rect(300, x - 10, 20, 20);

describe('crossOverflow', () => {
  it('is 0 when the bubble fits', () => {
    expect(
      crossOverflow('center', 'top', at(400), bubble, viewport, INSET)
    ).toBe(0);
  });

  it('measures past the edge plus the threshold', () => {
    // center at x = 50: bubble spans 10..90, the left edge at the threshold
    expect(
      crossOverflow('center', 'top', at(50), bubble, viewport, INSET)
    ).toBe(0);
    expect(
      crossOverflow('center', 'top', at(49), bubble, viewport, INSET)
    ).toBe(1);
    expect(crossOverflow('start', 'top', at(15), bubble, viewport, INSET)).toBe(
      FLIP_THRESHOLD - 3
    );
  });
});

describe('chooseArrowPlacement', () => {
  it('keeps the current arrow while the bubble fits', () => {
    expect(
      chooseArrowPlacement('center', 'top', at(400), bubble, viewport, INSET)
    ).toBe('center');
  });

  it("moves to 'start' near the start edge, 'end' near the end edge", () => {
    expect(
      chooseArrowPlacement('center', 'top', at(30), bubble, viewport, INSET)
    ).toBe('start');
    expect(
      chooseArrowPlacement('center', 'top', at(770), bubble, viewport, INSET)
    ).toBe('end');
  });

  it('measures left / right placements along the height', () => {
    const anchor = rect(10, 400, 20, 20); // centered at y = 20
    expect(
      chooseArrowPlacement('center', 'left', anchor, bubble, viewport, INSET)
    ).toBe('start');
  });

  it("moves to 'end' near the bottom edge for left / right", () => {
    const anchor = rect(565, 400, 20, 20); // centered at y = 575
    expect(
      chooseArrowPlacement('center', 'right', anchor, bubble, viewport, INSET)
    ).toBe('end');
  });

  it('is sticky: a shifted arrow stays while it still fits', () => {
    expect(
      chooseArrowPlacement('start', 'top', at(400), bubble, viewport, INSET)
    ).toBe('start');
  });

  it('with a preferred arrow, returns there once it fits again', () => {
    expect(
      chooseArrowPlacement(
        'start',
        'top',
        at(400),
        bubble,
        viewport,
        INSET,
        'center'
      )
    ).toBe('center');
    expect(
      chooseArrowPlacement(
        'start',
        'top',
        at(30),
        bubble,
        viewport,
        INSET,
        'center'
      )
    ).toBe('start');
  });

  it('picks the least overflow when nothing fits, keeping the current on a tie', () => {
    expect(
      chooseArrowPlacement('center', 'top', at(15), bubble, viewport, INSET)
    ).toBe('start');
    const narrow: Bounds = { top: 0, left: 0, bottom: 600, right: 60 };
    expect(chooseArrowPlacement('end', 'top', at(30), bubble, narrow, 30)).toBe(
      'end'
    );
  });

  it('measures against narrowed bounds (a scroll container)', () => {
    const box: Bounds = { top: 200, left: 100, bottom: 400, right: 400 };
    expect(
      chooseArrowPlacement('center', 'top', at(130), bubble, box, INSET)
    ).toBe('start');
  });
});

describe('flipArrowRootMargins', () => {
  const box = { clientWidth: 800, clientHeight: 600 };
  const anchor = { width: 50, height: 20 };

  it('insets the side edges at each fit boundary for top / bottom', () => {
    // reach 40 / 12 / 68, minus half the anchor (25), plus the threshold
    expect(
      flipArrowRootMargins('top', anchor, { width: 80, height: 40 }, 12, box)
    ).toEqual(['0px -25px', '0px 3px', '0px -53px']);
  });

  it('insets the top / bottom edges for left / right', () => {
    expect(
      flipArrowRootMargins('left', anchor, { width: 80, height: 40 }, 12, box)
    ).toEqual(['-20px 0px', '-12px 0px', '-28px 0px']);
  });

  it('drops duplicate boundaries', () => {
    expect(
      flipArrowRootMargins('top', anchor, { width: 80, height: 40 }, 40, box)
    ).toEqual(['0px -25px']);
  });

  it('caps the inset below half the box', () => {
    expect(
      flipArrowRootMargins('top', anchor, { width: 80, height: 40 }, 12, {
        clientWidth: 60,
        clientHeight: 600,
      })
    ).toEqual(['0px -25px', '0px 3px', '0px -29px']);
  });
});
