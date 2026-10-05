import {
  choosePlacement,
  containerRootMargin,
  FLIP_THRESHOLD,
  type Bounds,
} from '../src/utils/autoFlipGeometry';

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

describe('choosePlacement', () => {
  it('keeps the current side while it has room', () => {
    expect(
      choosePlacement('top', rect(300, 100, 50, 20), bubble, viewport)
    ).toBe('top');
  });

  it('flips when the current side runs out of room', () => {
    expect(choosePlacement('top', rect(5, 100, 50, 20), bubble, viewport)).toBe(
      'bottom'
    );
  });

  it('needs the bubble size plus the threshold', () => {
    const justEnough = rect(40 + FLIP_THRESHOLD, 100, 50, 20);
    const justShort = rect(40 + FLIP_THRESHOLD - 1, 100, 50, 20);
    expect(choosePlacement('top', justEnough, bubble, viewport)).toBe('top');
    expect(choosePlacement('top', justShort, bubble, viewport)).toBe('bottom');
  });

  it('is sticky: a flipped side stays while it still fits', () => {
    expect(
      choosePlacement('bottom', rect(300, 100, 50, 20), bubble, viewport)
    ).toBe('bottom');
  });

  it('measures left / right against the bubble width', () => {
    expect(
      choosePlacement('left', rect(300, 50, 20, 20), bubble, viewport)
    ).toBe('right');
  });

  it('picks the roomier side when neither fits, keeping the current on a tie', () => {
    const tight: Bounds = { top: 0, left: 0, bottom: 60, right: 800 };
    expect(choosePlacement('top', rect(10, 0, 50, 20), bubble, tight)).toBe(
      'bottom'
    );
    expect(choosePlacement('top', rect(20, 0, 50, 20), bubble, tight)).toBe(
      'top'
    );
  });

  it('measures against narrowed bounds (a scroll container)', () => {
    const box: Bounds = { top: 200, left: 100, bottom: 400, right: 400 };
    expect(choosePlacement('top', rect(210, 200, 50, 20), bubble, box)).toBe(
      'bottom'
    );
  });
});

describe('containerRootMargin', () => {
  const box = { clientWidth: 300, clientHeight: 200 };

  it('insets only the vertical edges for top / bottom', () => {
    expect(containerRootMargin('top', { width: 80, height: 40 }, box)).toBe(
      '-50px 0px'
    );
  });

  it('insets only the side edges for left / right', () => {
    expect(containerRootMargin('right', { width: 80, height: 40 }, box)).toBe(
      '0px -90px'
    );
  });

  it('ignores a bubble wider than the container for vertical placements', () => {
    expect(containerRootMargin('top', { width: 500, height: 40 }, box)).toBe(
      '-50px 0px'
    );
  });

  it('caps the inset below half the container', () => {
    expect(containerRootMargin('bottom', { width: 80, height: 150 }, box)).toBe(
      '-99px 0px'
    );
  });
});
