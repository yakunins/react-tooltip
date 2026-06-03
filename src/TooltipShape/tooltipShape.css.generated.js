/* This file is auto-generated */

const css = {
  src: `src/TooltipShape/tooltipShape.css`,
  hash: `17agacooa8m`,
  content: `
/* ============================================================
 * react-tooltip-contemporary - TooltipShape layer
 *
 * The bubble: its rounded box and its arrow are drawn as a single
 * clip-path: polygon(...) - no borders, pseudo-elements or SVG, so the
 * arrow inherits the bubble background, shadow and corner radius.
 * ============================================================ */

.tooltip {
  /* default tokens (private - the library baseline). Edit a value here to
   * change the default; override per instance via the bubbleStyle prop, i.e.
   * the public --tooltip-* custom properties. */
  --default-padding-y: 0.4em;
  --default-padding-x: 0.7em;
  --default-radius: 0.4em;
  --default-arrow-size: 0.5em;
  --default-background: #000;
  --default-color: #fff;
  --default-font-size: 0.875em;
  --default-max-width: 16rem;

  /* customizable inputs: the public --tooltip-* var wins, else the default */
  --py: var(--tooltip-padding-y, var(--default-padding-y));
  --px: var(--tooltip-padding-x, var(--default-padding-x));
  --rad: var(--tooltip-radius, var(--default-radius));
  --arrow-size: var(--tooltip-arrow-size, var(--default-arrow-size));

  /* Distance from a bubble edge to the arrow tip, for arrow-start / arrow-end:
   * far enough that the arrow's near foot clears the rounded corner. Inside a
   * Tooltip the popover overrides this (see '.tooltip-popover .tooltip' in
   * tooltipShape's sibling sheet) with an absolute length resolved in the
   * popover's font context, so the bubble's arrow and the popover's shift line
   * up to the pixel. */
  --arrow-inset: calc(var(--rad) + var(--arrow-size) * 0.707);

  display: inline-block;
  box-sizing: border-box;
  width: max-content;
  max-width: var(--tooltip-max-width, var(--default-max-width));
  background: var(--tooltip-background, var(--default-background));
  color: var(--tooltip-color, var(--default-color));
  font-size: var(--tooltip-font-size, var(--default-font-size));
  line-height: 1.35;
  text-align: start;
  text-wrap: pretty;
  overflow-wrap: break-word;
  word-break: break-word;

  padding: var(--py) var(--px);

  /* arrow-side insets - set per placement below */
  --t: 0%;
  --b: 0%;
  --l: 0%;
  --r: 0%;

  /* rounded-corner control points (cheap bezier approximation) */
  --crn1: calc(var(--rad) / 2);
  --crn2: calc(var(--rad) / 7.5);

  --d1xs: calc(0% + var(--rad) + var(--l)) calc(0% + var(--t));
  --d15sX: calc(0% + var(--crn1) + var(--l)) calc(0% + var(--crn2) + var(--t));
  --d15sY: calc(0% + var(--crn2) + var(--l)) calc(0% + var(--crn1) + var(--t));
  --d1ys: calc(0% + var(--l)) calc(0% + var(--rad) + var(--t));
  --d2xs: calc(100% - var(--rad) - var(--r)) calc(0% + var(--t));
  --d25sX: calc(100% - var(--crn1) - var(--r)) calc(0% + var(--crn2) + var(--t));
  --d25sY: calc(100% - var(--crn2) - var(--r)) calc(0% + var(--crn1) + var(--t));
  --d2ys: calc(100% - var(--r)) calc(0% + var(--rad) + var(--t));
  --d3xs: calc(100% - var(--rad) - var(--r)) calc(100% - var(--b));
  --d35sX: calc(100% - var(--crn1) - var(--r))
    calc(100% - var(--crn2) - var(--b));
  --d35sY: calc(100% - var(--crn2) - var(--r))
    calc(100% - var(--crn1) - var(--b));
  --d3ys: calc(100% - var(--r)) calc(100% - var(--rad) - var(--b));
  --d4xs: calc(0% + var(--rad) + var(--l)) calc(100% - var(--b));
  --d45sX: calc(0% + var(--crn1) + var(--l)) calc(100% - var(--crn2) - var(--b));
  --d45sY: calc(0% + var(--crn2) + var(--l)) calc(100% - var(--crn1) - var(--b));
  --d4ys: calc(0% + var(--l)) calc(100% - var(--rad) - var(--b));

  --corner1: var(--d1ys), var(--d15sY), var(--d15sX), var(--d1xs);
  --corner2: var(--d2xs), var(--d25sX), var(--d25sY), var(--d2ys);
  --corner3: var(--d3ys), var(--d35sY), var(--d35sX), var(--d3xs);
  --corner4: var(--d4xs), var(--d45sX), var(--d45sY), var(--d4ys);

  clip-path: polygon(
    var(--corner1),
    var(--corner2),
    var(--corner3),
    var(--corner4)
  );
}
.tooltip:empty {
  display: none;
}

/* arrow-placement: slide the arrow along the bubble edge.
 * '--arrow-pos' is the along-edge coordinate the placement rules below read
 * for whichever axis is relevant (--cx for top/bottom, --cy for left/right).
 * 'center' is the default (no class), so --arrow-pos falls back to 50%. */
.tooltip.arrow-start {
  --arrow-pos: var(--arrow-inset);
}
.tooltip.arrow-end {
  --arrow-pos: calc(100% - var(--arrow-inset));
}

/* placement-top: bubble above the anchor, arrow points down */
.tooltip.placement-top {
  --b: var(--arrow-size);
  --cx: var(--arrow-pos, 50%);
  --cy: calc(100% - var(--arrow-size));
  --a1: calc(var(--cx) - var(--arrow-size) * 0.707) var(--cy);
  --a2: var(--cx) calc(var(--cy) + var(--arrow-size) * 0.707);
  --a3: calc(var(--cx) + var(--arrow-size) * 0.707) var(--cy);
  padding-bottom: calc(var(--b) + var(--py));
  clip-path: polygon(
    var(--corner1),
    var(--corner2),
    var(--corner3),
    var(--a1),
    var(--a2),
    var(--a3),
    var(--corner4)
  );
}

/* placement-bottom: bubble below the anchor, arrow points up */
.tooltip.placement-bottom {
  --t: var(--arrow-size);
  --cx: var(--arrow-pos, 50%);
  --cy: calc(0% + var(--arrow-size));
  --a1: calc(var(--cx) - var(--arrow-size) * 0.707) var(--cy);
  --a2: var(--cx) calc(var(--cy) - var(--arrow-size) * 0.707);
  --a3: calc(var(--cx) + var(--arrow-size) * 0.707) var(--cy);
  padding-top: calc(var(--t) + var(--py));
  clip-path: polygon(
    var(--corner1),
    var(--a1),
    var(--a2),
    var(--a3),
    var(--corner2),
    var(--corner3),
    var(--corner4)
  );
}

/* placement-left: bubble left of the anchor, arrow points right */
.tooltip.placement-left {
  --r: var(--arrow-size);
  --cx: calc(100% - var(--arrow-size));
  --cy: var(--arrow-pos, 50%);
  --a1: var(--cx) calc(var(--cy) - var(--arrow-size) * 0.707);
  --a2: calc(var(--cx) + var(--arrow-size) * 0.707) var(--cy);
  --a3: var(--cx) calc(var(--cy) + var(--arrow-size) * 0.707);
  padding-right: calc(var(--r) + var(--px));
  clip-path: polygon(
    var(--corner1),
    var(--corner2),
    var(--a1),
    var(--a2),
    var(--a3),
    var(--corner3),
    var(--corner4)
  );
}

/* placement-right: bubble right of the anchor, arrow points left */
.tooltip.placement-right {
  --l: var(--arrow-size);
  --cx: calc(0% + var(--arrow-size));
  --cy: var(--arrow-pos, 50%);
  --a1: var(--cx) calc(var(--cy) + var(--arrow-size) * 0.707);
  --a2: calc(var(--cx) - var(--arrow-size) * 0.707) var(--cy);
  --a3: var(--cx) calc(var(--cy) - var(--arrow-size) * 0.707);
  padding-left: calc(var(--l) + var(--px));
  clip-path: polygon(
    var(--a1),
    var(--a2),
    var(--a3),
    var(--corner1),
    var(--corner2),
    var(--corner3),
    var(--corner4)
  );
}
`,
};

export default css;
