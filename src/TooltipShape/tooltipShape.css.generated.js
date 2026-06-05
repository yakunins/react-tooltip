/* This file is auto-generated */

const css = {
  src: `src/TooltipShape/tooltipShape.css`,
  hash: `1vov51k8ofh`,
  content: `
/* ============================================================
 * react-tooltip-contemporary - TooltipShape layer
 *
 * The bubble: its rounded box and its arrow are drawn as a single
 * clip-path: polygon(...) - no borders, pseudo-elements or SVG, so the
 * arrow inherits the bubble background, shadow and corner radius.
 * ============================================================ */

.tooltip {
  /* Inputs: the public --tooltip-* custom properties. The component always
   * sets them (DEFAULT_BUBBLE_STYLE in TooltipShape.tsx is the single source of
   * defaults), so this sheet carries no --default-* fallbacks. */
  --py: var(--tooltip-padding-y);
  --px: var(--tooltip-padding-x);
  --rad: var(--tooltip-radius);
  --arrow-size: var(--tooltip-arrow-size);

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
  max-width: var(--tooltip-max-width);

  background: var(--tooltip-background);
  color: var(--tooltip-color);

  * {
    color: var(--tooltip-color);
  }

  font-size: var(--tooltip-font-size);
  text-align: start;
  text-wrap: pretty;
  overflow-wrap: break-word;
  word-break: break-word;

  padding: var(--py) var(--px);

  /* arrow-side insets - set per placement below. Consumed (with --rad) by
   * roundedCorners.css, which builds the four rounded corners. */
  --t: 0%;
  --b: 0%;
  --l: 0%;
  --r: 0%;

  /* The rounded corners --corner1..4 are defined in roundedCorners.css, as a
   * true quarter-circle approximated by N segments (the .corners-N class). The
   * placement rules below splice the arrow points between them. */

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
