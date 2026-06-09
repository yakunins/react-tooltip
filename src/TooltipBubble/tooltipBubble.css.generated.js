/* This file is auto-generated */

const css = {
  src: `src/TooltipBubble/tooltipBubble.css`,
  hash: `23o4qpe1hd5`,
  content: `
.tooltip-bubble {
  --py: var(--tooltip-padding-y);
  --px: var(--tooltip-padding-x);
  --rad: var(--tooltip-radius);
  --arrow-size: var(--tooltip-arrow-size);
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
  --t: 0%;
  --b: 0%;
  --l: 0%;
  --r: 0%;
  clip-path: polygon(
    var(--corner1),
    var(--corner2),
    var(--corner3),
    var(--corner4)
  );
}
.tooltip-bubble:empty {
  display: none;
}
.tooltip-bubble.arrow-start {
  --arrow-pos: var(--arrow-inset);
}
.tooltip-bubble.arrow-end {
  --arrow-pos: calc(100% - var(--arrow-inset));
}
.tooltip-bubble.placement-top {
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
.tooltip-bubble.placement-bottom {
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
.tooltip-bubble.placement-left {
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
.tooltip-bubble.placement-right {
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
