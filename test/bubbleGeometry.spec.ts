import { readFileSync } from 'fs';
import { join } from 'path';

import { BubbleGeometry, signedArea, type Point } from './helpers/cssEval';

// Checks the clip-path for every corners x placement x arrow combination.

const css = readFileSync(
  join(__dirname, '../src/TooltipBubble/tooltipBubble.css'),
  'utf-8'
);

const W = 200;
const H = 60;
const RAD = 8;
const ARROW = 10;
const K = 0.707; // the arrow's half-width / height factor used by the CSS

const geo = new BubbleGeometry(
  css,
  { width: W, height: H },
  {
    '--tooltip-padding-x': '11px',
    '--tooltip-padding-y': '6px',
    '--tooltip-radius': `${RAD}px`,
    '--tooltip-arrow-size': `${ARROW}px`,
  }
);

const SEGMENTS = [3, 5, 7] as const;
const PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const;
const ARROWS = ['start', 'center', 'end'] as const;

const cases = SEGMENTS.flatMap(n =>
  PLACEMENTS.flatMap(placement =>
    ARROWS.map(arrow => ({ n, placement, arrow }))
  )
);

const classesOf = ({ n, placement, arrow }: (typeof cases)[number]) => [
  `corners-${n}`,
  `placement-${placement}`,
  `arrow-${arrow}`,
];

// Area cut off one corner: rad^2 minus the N-triangle fan inside it.
const cornerCut = (n: number) =>
  RAD * RAD - (n / 2) * RAD * RAD * Math.sin(Math.PI / 2 / n);

// Expected arrow tip, from placement and arrow position alone.
const expectedTip = (placement: string, arrow: string): Point => {
  const inset = RAD + ARROW * K;
  const along = (size: number) =>
    arrow === 'start' ? inset : arrow === 'end' ? size - inset : size / 2;
  switch (placement) {
    case 'top':
      return [along(W), H - ARROW + ARROW * K];
    case 'bottom':
      return [along(W), ARROW - ARROW * K];
    case 'left':
      return [W - ARROW + ARROW * K, along(H)];
    default:
      return [ARROW - ARROW * K, along(H)];
  }
};

const near = (a: Point, b: Point, eps = 1e-6) =>
  Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps;

describe('tooltipBubble.css clip-path geometry', () => {
  it.each(cases)(
    'corners-$n placement-$placement arrow-$arrow: stays inside the box',
    c => {
      for (const [x, y] of geo.polygon(classesOf(c))) {
        expect(x).toBeGreaterThanOrEqual(-1e-9);
        expect(x).toBeLessThanOrEqual(W + 1e-9);
        expect(y).toBeGreaterThanOrEqual(-1e-9);
        expect(y).toBeLessThanOrEqual(H + 1e-9);
      }
    }
  );

  it.each(cases)(
    'corners-$n placement-$placement arrow-$arrow: has the arrow tip in place',
    c => {
      const tip = expectedTip(c.placement, c.arrow);
      expect(geo.polygon(classesOf(c)).some(p => near(p, tip))).toBe(true);
    }
  );

  // A clockwise outline encloses body + arrow; a reversed arrow subtracts it.
  it.each(cases)(
    'corners-$n placement-$placement arrow-$arrow: encloses body + arrow, clockwise',
    c => {
      const vertical = c.placement === 'top' || c.placement === 'bottom';
      const body =
        (vertical ? W : W - ARROW) * (vertical ? H - ARROW : H) -
        4 * cornerCut(c.n);
      const arrow = ARROW * K * ARROW * K;
      // the corner constants are rounded to 4 decimals in the CSS
      expect(signedArea(geo.polygon(classesOf(c)))).toBeCloseTo(
        body + arrow,
        1
      );
    }
  );

  it.each(SEGMENTS)(
    'corners-%p: every corner point lies on a true quarter-circle',
    n => {
      const cls = [`corners-${n}`, 'placement-top'];
      const t = 0;
      const b = ARROW; // placement-top reserves the arrow below
      const centers: Point[] = [
        [RAD, t + RAD],
        [W - RAD, t + RAD],
        [W - RAD, H - b - RAD],
        [RAD, H - b - RAD],
      ];
      centers.forEach(([cx, cy], i) => {
        const pts = geo.points(`var(--corner${i + 1})`, cls);
        expect(pts).toHaveLength(n + 1);
        for (const [x, y] of pts) {
          expect(Math.hypot(x - cx, y - cy)).toBeCloseTo(RAD, 2);
        }
      });
    }
  );

  it('falls back to 3 segments without a corners-N class', () => {
    expect(geo.points('var(--corner1)', ['placement-top'])).toHaveLength(4);
  });

  it('pushes the padding out by the arrow size on the arrow side', () => {
    expect(geo.length('var(--py)', ['placement-top'], 1) + ARROW).toBeCloseTo(
      geo.length(geo.cascade(['placement-top'])['padding-bottom'], [
        'placement-top',
      ])
    );
  });
});
