/* This file is auto-generated */

const css = {
  src: `src/Tooltip/tooltip.css`,
  hash: `12jbpd29wj8`,
  content: `
/* ============================================================
 * react-tooltip-contemporary - Tooltip popover layer
 *
 * The top-layer popover element: user-agent reset, positioning via
 * anchor(), the enter/exit transition, and the four placement variants.
 * The bubble inside it is styled by tooltipShape.css.
 * ============================================================ */

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

  /* the popover is fixed and tracks its anchor */
  position: fixed;

  /* soft shadow that follows the clip-path silhouette */
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));

  /* enter / exit transition - Popover API + @starting-style */
  opacity: 0;
  transition:
    opacity var(--tooltip-transition-duration, 0.16s) ease,
    overlay var(--tooltip-transition-duration, 0.16s) ease allow-discrete,
    display var(--tooltip-transition-duration, 0.16s) ease allow-discrete;
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

/* ---------- placement: position the popover around its anchor ----------
 * anchor() resolves against the element named by position-anchor, which is
 * set inline, per instance.  --tooltip-offset is the gap.                */
.tooltip-popover.placement-top {
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0;
  margin-bottom: var(--tooltip-offset, 0.25em);
}
.tooltip-popover.placement-bottom {
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 0;
  margin-top: var(--tooltip-offset, 0.25em);
}
.tooltip-popover.placement-left {
  right: anchor(left);
  top: anchor(center);
  translate: 0 -50%;
  margin-right: var(--tooltip-offset, 0.25em);
}
.tooltip-popover.placement-right {
  left: anchor(right);
  top: anchor(center);
  translate: 0 -50%;
  margin-left: var(--tooltip-offset, 0.25em);
}
`,
};

export default css;
