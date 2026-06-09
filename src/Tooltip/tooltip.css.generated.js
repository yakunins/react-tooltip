/* This file is auto-generated */

const css = {
  src: `src/Tooltip/tooltip.css`,
  hash: `vhm6uik9rv`,
  content: `
@property --tooltip-arrow-inset {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}
.tooltip {
  inset: auto;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  overflow: visible;
  width: max-content;
  height: max-content;
  --tooltip-arrow-inset: calc(
    var(--tooltip-radius) + var(--tooltip-arrow-size) * 0.707
  );
  --tooltip-outline-color: rgba(255, 255, 255, 1);
  --tooltip-outline-size: 0px;
  --tooltip-outline-blur: 0.5px;
  --o-c: var(--tooltip-outline-color);
  --o-s: var(--tooltip-outline-size);
  --o--s: calc(var(--o-s) * -1);
  --o-b: var(--tooltip-outline-blur);
  --tooltip-outline: drop-shadow(var(--o-s) 0 var(--o-b) var(--o-c))
    drop-shadow(var(--o--s) 0 var(--o-b) var(--o-c))
    drop-shadow(0 var(--o-s) var(--o-b) var(--o-c))
    drop-shadow(0 var(--o--s) var(--o-b) var(--o-c));
  position: fixed;
  opacity: 0;
  transition:
    opacity var(--tooltip-transition-duration) ease,
    overlay var(--tooltip-transition-duration) ease allow-discrete,
    display var(--tooltip-transition-duration) ease allow-discrete;
}
.tooltip:popover-open {
  opacity: 1;
  filter: var(--tooltip-outline);
}
@starting-style {
  .tooltip:popover-open {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tooltip {
    transition-duration: 0.01ms;
  }
}
.tooltip.placement-top {
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0;
  margin-bottom: var(--tooltip-offset, 0.25em);
  --flip-from: translateY(8px);
}
.tooltip.placement-bottom {
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 0;
  margin-top: var(--tooltip-offset, 0.25em);
  --flip-from: translateY(-8px);
}
.tooltip.placement-left {
  right: anchor(left);
  top: anchor(center);
  translate: 0 -50%;
  margin-right: var(--tooltip-offset, 0.25em);
  --flip-from: translateX(8px);
}
.tooltip.placement-right {
  left: anchor(right);
  top: anchor(center);
  translate: 0 -50%;
  margin-left: var(--tooltip-offset, 0.25em);
  --flip-from: translateX(-8px);
}
.tooltip .tooltip-bubble {
  --arrow-inset: var(--tooltip-arrow-inset);
}
.tooltip.placement-top.arrow-start,
.tooltip.placement-bottom.arrow-start {
  translate: calc(-1 * var(--tooltip-arrow-inset)) 0;
}
.tooltip.placement-top.arrow-end,
.tooltip.placement-bottom.arrow-end {
  translate: calc(-100% + var(--tooltip-arrow-inset)) 0;
}
.tooltip.placement-left.arrow-start,
.tooltip.placement-right.arrow-start {
  translate: 0 calc(-1 * var(--tooltip-arrow-inset));
}
.tooltip.placement-left.arrow-end,
.tooltip.placement-right.arrow-end {
  translate: 0 calc(-100% + var(--tooltip-arrow-inset));
}
`,
};

export default css;
