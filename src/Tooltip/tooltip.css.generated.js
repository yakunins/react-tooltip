/* This file is auto-generated */

const css = {
  src: `src/Tooltip/tooltip.css`,
  hash: `hscoz9tnml`,
  content: `
/* ============================================================
 * react-tooltip-contemporary - Tooltip popover layer
 *
 * The top-layer popover element: user-agent reset, positioning via
 * anchor(), the enter/exit transition, and the four placement variants.
 * The bubble inside it is styled by tooltipShape.css.
 * ============================================================ */

/* Distance from a bubble edge to the arrow tip, for arrow-start / arrow-end.
 * Registered as a <length> so its em units resolve once here, on the popover,
 * and inherit to the bubble as an absolute length. The bubble sets
 * font-size: 0.875em, so an unregistered custom property would re-resolve its
 * em against that smaller font and the arrow tip would drift off-center; this
 * keeps the popover's translate and the bubble's arrow offset identical. The
 * radius / arrow-size inputs are mirrored onto the popover by Tooltip. */
@property --tooltip-arrow-inset {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}

.tooltip-popover {
  /* reset user-agent popover styles */
  inset: auto;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  overflow: visible;
  width: max-content;
  height: max-content;

  /* --tooltip-radius / --tooltip-arrow-size / --tooltip-transition-duration are
   * set on the popover by Tooltip.tsx, resolved against DEFAULT_BUBBLE_STYLE
   * (the single source of defaults), so this sheet needs no fallbacks. */
  --tooltip-arrow-inset: calc(
    var(--tooltip-radius) + var(--tooltip-arrow-size) * 0.707
  );

  /* the popover is fixed and tracks its anchor */
  position: fixed;

  /* soft shadow that follows the clip-path silhouette */
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))
    drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));

  /* enter / exit transition - Popover API + @starting-style */
  opacity: 0;
  transition:
    opacity var(--tooltip-transition-duration) ease,
    overlay var(--tooltip-transition-duration) ease allow-discrete,
    display var(--tooltip-transition-duration) ease allow-discrete;
}

.tooltip-popover:popover-open {
  opacity: 1;
}
@starting-style {
  .tooltip-popover:popover-open {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tooltip-popover {
    transition-duration: 0.01ms;
  }
}

/* The flip animation lives in JS (useFlipAnimation, via the Web Animations
 * API). Its keyframes read --flip-from (set per placement below), so the
 * bubble emerges from the anchor side when it flips. */

/* ---------- placement: position the popover around its anchor ----------
 * anchor() resolves against the element named by position-anchor, which is
 * set inline, per instance.  --tooltip-offset is the gap.                */
.tooltip-popover.placement-top {
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0;
  margin-bottom: var(--tooltip-offset, 0.25em);
  --flip-from: translateY(8px);
}
.tooltip-popover.placement-bottom {
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 0;
  margin-top: var(--tooltip-offset, 0.25em);
  --flip-from: translateY(-8px);
}
.tooltip-popover.placement-left {
  right: anchor(left);
  top: anchor(center);
  translate: 0 -50%;
  margin-right: var(--tooltip-offset, 0.25em);
  --flip-from: translateX(8px);
}
.tooltip-popover.placement-right {
  left: anchor(right);
  top: anchor(center);
  translate: 0 -50%;
  margin-left: var(--tooltip-offset, 0.25em);
  --flip-from: translateX(-8px);
}

/* Hand the popover-resolved inset down to the bubble's arrow offset, so the
 * arrow tip and the popover's shift use the identical absolute length. This
 * descendant selector outranks the bubble's own '.tooltip' default, and only
 * applies inside a popover, leaving standalone TooltipShape on its local calc. */
.tooltip-popover .tooltip {
  --arrow-inset: var(--tooltip-arrow-inset);
}

/* ---------- arrow-placement: keep the arrow on the anchor center ----------
 * The base rules above anchor the cross-axis to anchor(center); the arrow tip
 * sits --tooltip-arrow-inset from whichever bubble edge it is near. To keep
 * that tip on the anchor center we shift the bubble so the arrow, not the
 * bubble's middle, lands on center:
 *   - 'center' (default, no class) keeps translate -50% (arrow at the middle).
 *   - 'start' slides the bubble so its near (start) edge sits one inset before
 *     center; the bubble body then extends toward the end side.
 *   - 'end' mirrors that; the body extends toward the start side.
 * Only translate changes — the anchor(center) base is untouched.            */
.tooltip-popover.placement-top.arrow-start,
.tooltip-popover.placement-bottom.arrow-start {
  translate: calc(-1 * var(--tooltip-arrow-inset)) 0;
}
.tooltip-popover.placement-top.arrow-end,
.tooltip-popover.placement-bottom.arrow-end {
  translate: calc(-100% + var(--tooltip-arrow-inset)) 0;
}
.tooltip-popover.placement-left.arrow-start,
.tooltip-popover.placement-right.arrow-start {
  translate: 0 calc(-1 * var(--tooltip-arrow-inset));
}
.tooltip-popover.placement-left.arrow-end,
.tooltip-popover.placement-right.arrow-end {
  translate: 0 calc(-100% + var(--tooltip-arrow-inset));
}
`,
};

export default css;
