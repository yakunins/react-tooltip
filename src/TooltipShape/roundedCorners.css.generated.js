/* This file is auto-generated */

const css = {
  src: `src/TooltipShape/roundedCorners.css`,
  hash: `1gibtynjskk`,
  content: `
/* ============================================================
 * react-tooltip-contemporary - rounded-corner geometry
 *
 * The bubble's four rounded corners, factored out of tooltipShape.css and
 * parameterized. Each corner is approximated by N straight segments (N+1
 * points) lying on a TRUE quarter-circle of radius --rad; N is chosen by a
 * .corners-N class (3..7) - more segments = smoother corner. tooltipShape.css
 * consumes the --corner1..4 lists below and splices the arrow between them.
 *
 * Inputs (set on .tooltip by tooltipShape.css):
 *   --rad            corner radius (length)
 *   --t --b --l --r  per-placement arrow-side insets (the bubble box edges)
 *
 * Outputs:
 *   --corner1  top-left      (left edge   -> top edge)
 *   --corner2  top-right     (top edge    -> right edge)
 *   --corner3  bottom-right  (right edge  -> bottom edge)
 *   --corner4  bottom-left   (bottom edge -> left edge)
 *
 * Point k (k = 0..N) sits at angle 90deg * k / N around the corner center.
 * This file is hand-maintained via scripts-gen-corners.js.
 * ============================================================ */

/* 3 segments - the default, also applied when no .corners-N class is set */
.tooltip,
.tooltip.corners-3 {
  --rcos-0: calc(var(--rad) * cos(90deg * 0 / 3));
  --rsin-0: calc(var(--rad) * sin(90deg * 0 / 3));
  --rcos-1: calc(var(--rad) * cos(90deg * 1 / 3));
  --rsin-1: calc(var(--rad) * sin(90deg * 1 / 3));
  --rcos-2: calc(var(--rad) * cos(90deg * 2 / 3));
  --rsin-2: calc(var(--rad) * sin(90deg * 2 / 3));
  --rcos-3: calc(var(--rad) * cos(90deg * 3 / 3));
  --rsin-3: calc(var(--rad) * sin(90deg * 3 / 3));

  --corner1:
    calc(var(--l) + var(--rad) - var(--rcos-0)) calc(var(--t) + var(--rad) - var(--rsin-0)),
    calc(var(--l) + var(--rad) - var(--rcos-1)) calc(var(--t) + var(--rad) - var(--rsin-1)),
    calc(var(--l) + var(--rad) - var(--rcos-2)) calc(var(--t) + var(--rad) - var(--rsin-2)),
    calc(var(--l) + var(--rad) - var(--rcos-3)) calc(var(--t) + var(--rad) - var(--rsin-3));
  --corner2:
    calc(100% - var(--r) - var(--rad) + var(--rsin-0)) calc(var(--t) + var(--rad) - var(--rcos-0)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-1)) calc(var(--t) + var(--rad) - var(--rcos-1)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-2)) calc(var(--t) + var(--rad) - var(--rcos-2)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-3)) calc(var(--t) + var(--rad) - var(--rcos-3));
  --corner3:
    calc(100% - var(--r) - var(--rad) + var(--rcos-0)) calc(100% - var(--b) - var(--rad) + var(--rsin-0)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-1)) calc(100% - var(--b) - var(--rad) + var(--rsin-1)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-2)) calc(100% - var(--b) - var(--rad) + var(--rsin-2)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-3)) calc(100% - var(--b) - var(--rad) + var(--rsin-3));
  --corner4:
    calc(var(--l) + var(--rad) - var(--rsin-0)) calc(100% - var(--b) - var(--rad) + var(--rcos-0)),
    calc(var(--l) + var(--rad) - var(--rsin-1)) calc(100% - var(--b) - var(--rad) + var(--rcos-1)),
    calc(var(--l) + var(--rad) - var(--rsin-2)) calc(100% - var(--b) - var(--rad) + var(--rcos-2)),
    calc(var(--l) + var(--rad) - var(--rsin-3)) calc(100% - var(--b) - var(--rad) + var(--rcos-3));
}

.tooltip.corners-4 {
  --rcos-0: calc(var(--rad) * cos(90deg * 0 / 4));
  --rsin-0: calc(var(--rad) * sin(90deg * 0 / 4));
  --rcos-1: calc(var(--rad) * cos(90deg * 1 / 4));
  --rsin-1: calc(var(--rad) * sin(90deg * 1 / 4));
  --rcos-2: calc(var(--rad) * cos(90deg * 2 / 4));
  --rsin-2: calc(var(--rad) * sin(90deg * 2 / 4));
  --rcos-3: calc(var(--rad) * cos(90deg * 3 / 4));
  --rsin-3: calc(var(--rad) * sin(90deg * 3 / 4));
  --rcos-4: calc(var(--rad) * cos(90deg * 4 / 4));
  --rsin-4: calc(var(--rad) * sin(90deg * 4 / 4));

  --corner1:
    calc(var(--l) + var(--rad) - var(--rcos-0)) calc(var(--t) + var(--rad) - var(--rsin-0)),
    calc(var(--l) + var(--rad) - var(--rcos-1)) calc(var(--t) + var(--rad) - var(--rsin-1)),
    calc(var(--l) + var(--rad) - var(--rcos-2)) calc(var(--t) + var(--rad) - var(--rsin-2)),
    calc(var(--l) + var(--rad) - var(--rcos-3)) calc(var(--t) + var(--rad) - var(--rsin-3)),
    calc(var(--l) + var(--rad) - var(--rcos-4)) calc(var(--t) + var(--rad) - var(--rsin-4));
  --corner2:
    calc(100% - var(--r) - var(--rad) + var(--rsin-0)) calc(var(--t) + var(--rad) - var(--rcos-0)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-1)) calc(var(--t) + var(--rad) - var(--rcos-1)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-2)) calc(var(--t) + var(--rad) - var(--rcos-2)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-3)) calc(var(--t) + var(--rad) - var(--rcos-3)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-4)) calc(var(--t) + var(--rad) - var(--rcos-4));
  --corner3:
    calc(100% - var(--r) - var(--rad) + var(--rcos-0)) calc(100% - var(--b) - var(--rad) + var(--rsin-0)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-1)) calc(100% - var(--b) - var(--rad) + var(--rsin-1)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-2)) calc(100% - var(--b) - var(--rad) + var(--rsin-2)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-3)) calc(100% - var(--b) - var(--rad) + var(--rsin-3)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-4)) calc(100% - var(--b) - var(--rad) + var(--rsin-4));
  --corner4:
    calc(var(--l) + var(--rad) - var(--rsin-0)) calc(100% - var(--b) - var(--rad) + var(--rcos-0)),
    calc(var(--l) + var(--rad) - var(--rsin-1)) calc(100% - var(--b) - var(--rad) + var(--rcos-1)),
    calc(var(--l) + var(--rad) - var(--rsin-2)) calc(100% - var(--b) - var(--rad) + var(--rcos-2)),
    calc(var(--l) + var(--rad) - var(--rsin-3)) calc(100% - var(--b) - var(--rad) + var(--rcos-3)),
    calc(var(--l) + var(--rad) - var(--rsin-4)) calc(100% - var(--b) - var(--rad) + var(--rcos-4));
}

.tooltip.corners-5 {
  --rcos-0: calc(var(--rad) * cos(90deg * 0 / 5));
  --rsin-0: calc(var(--rad) * sin(90deg * 0 / 5));
  --rcos-1: calc(var(--rad) * cos(90deg * 1 / 5));
  --rsin-1: calc(var(--rad) * sin(90deg * 1 / 5));
  --rcos-2: calc(var(--rad) * cos(90deg * 2 / 5));
  --rsin-2: calc(var(--rad) * sin(90deg * 2 / 5));
  --rcos-3: calc(var(--rad) * cos(90deg * 3 / 5));
  --rsin-3: calc(var(--rad) * sin(90deg * 3 / 5));
  --rcos-4: calc(var(--rad) * cos(90deg * 4 / 5));
  --rsin-4: calc(var(--rad) * sin(90deg * 4 / 5));
  --rcos-5: calc(var(--rad) * cos(90deg * 5 / 5));
  --rsin-5: calc(var(--rad) * sin(90deg * 5 / 5));

  --corner1:
    calc(var(--l) + var(--rad) - var(--rcos-0)) calc(var(--t) + var(--rad) - var(--rsin-0)),
    calc(var(--l) + var(--rad) - var(--rcos-1)) calc(var(--t) + var(--rad) - var(--rsin-1)),
    calc(var(--l) + var(--rad) - var(--rcos-2)) calc(var(--t) + var(--rad) - var(--rsin-2)),
    calc(var(--l) + var(--rad) - var(--rcos-3)) calc(var(--t) + var(--rad) - var(--rsin-3)),
    calc(var(--l) + var(--rad) - var(--rcos-4)) calc(var(--t) + var(--rad) - var(--rsin-4)),
    calc(var(--l) + var(--rad) - var(--rcos-5)) calc(var(--t) + var(--rad) - var(--rsin-5));
  --corner2:
    calc(100% - var(--r) - var(--rad) + var(--rsin-0)) calc(var(--t) + var(--rad) - var(--rcos-0)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-1)) calc(var(--t) + var(--rad) - var(--rcos-1)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-2)) calc(var(--t) + var(--rad) - var(--rcos-2)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-3)) calc(var(--t) + var(--rad) - var(--rcos-3)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-4)) calc(var(--t) + var(--rad) - var(--rcos-4)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-5)) calc(var(--t) + var(--rad) - var(--rcos-5));
  --corner3:
    calc(100% - var(--r) - var(--rad) + var(--rcos-0)) calc(100% - var(--b) - var(--rad) + var(--rsin-0)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-1)) calc(100% - var(--b) - var(--rad) + var(--rsin-1)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-2)) calc(100% - var(--b) - var(--rad) + var(--rsin-2)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-3)) calc(100% - var(--b) - var(--rad) + var(--rsin-3)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-4)) calc(100% - var(--b) - var(--rad) + var(--rsin-4)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-5)) calc(100% - var(--b) - var(--rad) + var(--rsin-5));
  --corner4:
    calc(var(--l) + var(--rad) - var(--rsin-0)) calc(100% - var(--b) - var(--rad) + var(--rcos-0)),
    calc(var(--l) + var(--rad) - var(--rsin-1)) calc(100% - var(--b) - var(--rad) + var(--rcos-1)),
    calc(var(--l) + var(--rad) - var(--rsin-2)) calc(100% - var(--b) - var(--rad) + var(--rcos-2)),
    calc(var(--l) + var(--rad) - var(--rsin-3)) calc(100% - var(--b) - var(--rad) + var(--rcos-3)),
    calc(var(--l) + var(--rad) - var(--rsin-4)) calc(100% - var(--b) - var(--rad) + var(--rcos-4)),
    calc(var(--l) + var(--rad) - var(--rsin-5)) calc(100% - var(--b) - var(--rad) + var(--rcos-5));
}

.tooltip.corners-6 {
  --rcos-0: calc(var(--rad) * cos(90deg * 0 / 6));
  --rsin-0: calc(var(--rad) * sin(90deg * 0 / 6));
  --rcos-1: calc(var(--rad) * cos(90deg * 1 / 6));
  --rsin-1: calc(var(--rad) * sin(90deg * 1 / 6));
  --rcos-2: calc(var(--rad) * cos(90deg * 2 / 6));
  --rsin-2: calc(var(--rad) * sin(90deg * 2 / 6));
  --rcos-3: calc(var(--rad) * cos(90deg * 3 / 6));
  --rsin-3: calc(var(--rad) * sin(90deg * 3 / 6));
  --rcos-4: calc(var(--rad) * cos(90deg * 4 / 6));
  --rsin-4: calc(var(--rad) * sin(90deg * 4 / 6));
  --rcos-5: calc(var(--rad) * cos(90deg * 5 / 6));
  --rsin-5: calc(var(--rad) * sin(90deg * 5 / 6));
  --rcos-6: calc(var(--rad) * cos(90deg * 6 / 6));
  --rsin-6: calc(var(--rad) * sin(90deg * 6 / 6));

  --corner1:
    calc(var(--l) + var(--rad) - var(--rcos-0)) calc(var(--t) + var(--rad) - var(--rsin-0)),
    calc(var(--l) + var(--rad) - var(--rcos-1)) calc(var(--t) + var(--rad) - var(--rsin-1)),
    calc(var(--l) + var(--rad) - var(--rcos-2)) calc(var(--t) + var(--rad) - var(--rsin-2)),
    calc(var(--l) + var(--rad) - var(--rcos-3)) calc(var(--t) + var(--rad) - var(--rsin-3)),
    calc(var(--l) + var(--rad) - var(--rcos-4)) calc(var(--t) + var(--rad) - var(--rsin-4)),
    calc(var(--l) + var(--rad) - var(--rcos-5)) calc(var(--t) + var(--rad) - var(--rsin-5)),
    calc(var(--l) + var(--rad) - var(--rcos-6)) calc(var(--t) + var(--rad) - var(--rsin-6));
  --corner2:
    calc(100% - var(--r) - var(--rad) + var(--rsin-0)) calc(var(--t) + var(--rad) - var(--rcos-0)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-1)) calc(var(--t) + var(--rad) - var(--rcos-1)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-2)) calc(var(--t) + var(--rad) - var(--rcos-2)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-3)) calc(var(--t) + var(--rad) - var(--rcos-3)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-4)) calc(var(--t) + var(--rad) - var(--rcos-4)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-5)) calc(var(--t) + var(--rad) - var(--rcos-5)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-6)) calc(var(--t) + var(--rad) - var(--rcos-6));
  --corner3:
    calc(100% - var(--r) - var(--rad) + var(--rcos-0)) calc(100% - var(--b) - var(--rad) + var(--rsin-0)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-1)) calc(100% - var(--b) - var(--rad) + var(--rsin-1)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-2)) calc(100% - var(--b) - var(--rad) + var(--rsin-2)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-3)) calc(100% - var(--b) - var(--rad) + var(--rsin-3)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-4)) calc(100% - var(--b) - var(--rad) + var(--rsin-4)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-5)) calc(100% - var(--b) - var(--rad) + var(--rsin-5)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-6)) calc(100% - var(--b) - var(--rad) + var(--rsin-6));
  --corner4:
    calc(var(--l) + var(--rad) - var(--rsin-0)) calc(100% - var(--b) - var(--rad) + var(--rcos-0)),
    calc(var(--l) + var(--rad) - var(--rsin-1)) calc(100% - var(--b) - var(--rad) + var(--rcos-1)),
    calc(var(--l) + var(--rad) - var(--rsin-2)) calc(100% - var(--b) - var(--rad) + var(--rcos-2)),
    calc(var(--l) + var(--rad) - var(--rsin-3)) calc(100% - var(--b) - var(--rad) + var(--rcos-3)),
    calc(var(--l) + var(--rad) - var(--rsin-4)) calc(100% - var(--b) - var(--rad) + var(--rcos-4)),
    calc(var(--l) + var(--rad) - var(--rsin-5)) calc(100% - var(--b) - var(--rad) + var(--rcos-5)),
    calc(var(--l) + var(--rad) - var(--rsin-6)) calc(100% - var(--b) - var(--rad) + var(--rcos-6));
}

.tooltip.corners-7 {
  --rcos-0: calc(var(--rad) * cos(90deg * 0 / 7));
  --rsin-0: calc(var(--rad) * sin(90deg * 0 / 7));
  --rcos-1: calc(var(--rad) * cos(90deg * 1 / 7));
  --rsin-1: calc(var(--rad) * sin(90deg * 1 / 7));
  --rcos-2: calc(var(--rad) * cos(90deg * 2 / 7));
  --rsin-2: calc(var(--rad) * sin(90deg * 2 / 7));
  --rcos-3: calc(var(--rad) * cos(90deg * 3 / 7));
  --rsin-3: calc(var(--rad) * sin(90deg * 3 / 7));
  --rcos-4: calc(var(--rad) * cos(90deg * 4 / 7));
  --rsin-4: calc(var(--rad) * sin(90deg * 4 / 7));
  --rcos-5: calc(var(--rad) * cos(90deg * 5 / 7));
  --rsin-5: calc(var(--rad) * sin(90deg * 5 / 7));
  --rcos-6: calc(var(--rad) * cos(90deg * 6 / 7));
  --rsin-6: calc(var(--rad) * sin(90deg * 6 / 7));
  --rcos-7: calc(var(--rad) * cos(90deg * 7 / 7));
  --rsin-7: calc(var(--rad) * sin(90deg * 7 / 7));

  --corner1:
    calc(var(--l) + var(--rad) - var(--rcos-0)) calc(var(--t) + var(--rad) - var(--rsin-0)),
    calc(var(--l) + var(--rad) - var(--rcos-1)) calc(var(--t) + var(--rad) - var(--rsin-1)),
    calc(var(--l) + var(--rad) - var(--rcos-2)) calc(var(--t) + var(--rad) - var(--rsin-2)),
    calc(var(--l) + var(--rad) - var(--rcos-3)) calc(var(--t) + var(--rad) - var(--rsin-3)),
    calc(var(--l) + var(--rad) - var(--rcos-4)) calc(var(--t) + var(--rad) - var(--rsin-4)),
    calc(var(--l) + var(--rad) - var(--rcos-5)) calc(var(--t) + var(--rad) - var(--rsin-5)),
    calc(var(--l) + var(--rad) - var(--rcos-6)) calc(var(--t) + var(--rad) - var(--rsin-6)),
    calc(var(--l) + var(--rad) - var(--rcos-7)) calc(var(--t) + var(--rad) - var(--rsin-7));
  --corner2:
    calc(100% - var(--r) - var(--rad) + var(--rsin-0)) calc(var(--t) + var(--rad) - var(--rcos-0)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-1)) calc(var(--t) + var(--rad) - var(--rcos-1)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-2)) calc(var(--t) + var(--rad) - var(--rcos-2)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-3)) calc(var(--t) + var(--rad) - var(--rcos-3)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-4)) calc(var(--t) + var(--rad) - var(--rcos-4)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-5)) calc(var(--t) + var(--rad) - var(--rcos-5)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-6)) calc(var(--t) + var(--rad) - var(--rcos-6)),
    calc(100% - var(--r) - var(--rad) + var(--rsin-7)) calc(var(--t) + var(--rad) - var(--rcos-7));
  --corner3:
    calc(100% - var(--r) - var(--rad) + var(--rcos-0)) calc(100% - var(--b) - var(--rad) + var(--rsin-0)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-1)) calc(100% - var(--b) - var(--rad) + var(--rsin-1)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-2)) calc(100% - var(--b) - var(--rad) + var(--rsin-2)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-3)) calc(100% - var(--b) - var(--rad) + var(--rsin-3)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-4)) calc(100% - var(--b) - var(--rad) + var(--rsin-4)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-5)) calc(100% - var(--b) - var(--rad) + var(--rsin-5)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-6)) calc(100% - var(--b) - var(--rad) + var(--rsin-6)),
    calc(100% - var(--r) - var(--rad) + var(--rcos-7)) calc(100% - var(--b) - var(--rad) + var(--rsin-7));
  --corner4:
    calc(var(--l) + var(--rad) - var(--rsin-0)) calc(100% - var(--b) - var(--rad) + var(--rcos-0)),
    calc(var(--l) + var(--rad) - var(--rsin-1)) calc(100% - var(--b) - var(--rad) + var(--rcos-1)),
    calc(var(--l) + var(--rad) - var(--rsin-2)) calc(100% - var(--b) - var(--rad) + var(--rcos-2)),
    calc(var(--l) + var(--rad) - var(--rsin-3)) calc(100% - var(--b) - var(--rad) + var(--rcos-3)),
    calc(var(--l) + var(--rad) - var(--rsin-4)) calc(100% - var(--b) - var(--rad) + var(--rcos-4)),
    calc(var(--l) + var(--rad) - var(--rsin-5)) calc(100% - var(--b) - var(--rad) + var(--rcos-5)),
    calc(var(--l) + var(--rad) - var(--rsin-6)) calc(100% - var(--b) - var(--rad) + var(--rcos-6)),
    calc(var(--l) + var(--rad) - var(--rsin-7)) calc(100% - var(--b) - var(--rad) + var(--rcos-7));
}

`,
};

export default css;
