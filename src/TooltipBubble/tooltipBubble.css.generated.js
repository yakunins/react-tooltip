/* This file is auto-generated */

const css = {
  src: `src/TooltipBubble/tooltipBubble.css`,
  hash: `24gwiti2meh`,
  content: `
.tooltip-bubble{
--py:var(--tooltip-padding-y);
--px:var(--tooltip-padding-x);
--rad:var(--tooltip-radius);
--arrow-size:var(--tooltip-arrow-size);
--arrow-inset:calc(var(--rad) + var(--arrow-size) * 0.707);
display:inline-block;
box-sizing:border-box;
width:max-content;
max-width:var(--tooltip-max-width);
background:var(--tooltip-background);
color:var(--tooltip-color);
*{
color:var(--tooltip-color);
}
font-size:var(--tooltip-font-size);
text-align:start;
text-wrap:pretty;
overflow-wrap:break-word;
word-break:break-word;
padding:var(--py) var(--px);
--t:0%;
--b:0%;
--l:0%;
--r:0%;
--arrow-t:calc(var(--l) + var(--rad)) var(--t);
--arrow-r:calc(100% - var(--r)) calc(var(--t) + var(--rad));
--arrow-b:calc(100% - var(--r) - var(--rad)) calc(100% - var(--b));
--arrow-l:var(--l) calc(100% - var(--b) - var(--rad));
clip-path:polygon(
var(--corner1),
var(--arrow-t),
var(--corner2),
var(--arrow-r),
var(--corner3),
var(--arrow-b),
var(--corner4),
var(--arrow-l)
);
}
.tooltip-bubble:empty{
display:none;
}
.tooltip-bubble.arrow-start{
--arrow-pos:var(--arrow-inset);
}
.tooltip-bubble.arrow-end{
--arrow-pos:calc(100% - var(--arrow-inset));
}
.tooltip-bubble.placement-top{
--b:var(--arrow-size);
--cx:var(--arrow-pos,50%);
--cy:calc(100% - var(--arrow-size));
--arrow-b:
calc(var(--cx) + var(--arrow-size) * 0.707) var(--cy),
var(--cx) calc(var(--cy) + var(--arrow-size) * 0.707),
calc(var(--cx) - var(--arrow-size) * 0.707) var(--cy);
padding-bottom:calc(var(--b) + var(--py));
}
.tooltip-bubble.placement-bottom{
--t:var(--arrow-size);
--cx:var(--arrow-pos,50%);
--cy:calc(0% + var(--arrow-size));
--arrow-t:
calc(var(--cx) - var(--arrow-size) * 0.707) var(--cy),
var(--cx) calc(var(--cy) - var(--arrow-size) * 0.707),
calc(var(--cx) + var(--arrow-size) * 0.707) var(--cy);
padding-top:calc(var(--t) + var(--py));
}
.tooltip-bubble.placement-left{
--r:var(--arrow-size);
--cx:calc(100% - var(--arrow-size));
--cy:var(--arrow-pos,50%);
--arrow-r:
var(--cx) calc(var(--cy) - var(--arrow-size) * 0.707),
calc(var(--cx) + var(--arrow-size) * 0.707) var(--cy),
var(--cx) calc(var(--cy) + var(--arrow-size) * 0.707);
padding-right:calc(var(--r) + var(--px));
}
.tooltip-bubble.placement-right{
--l:var(--arrow-size);
--cx:calc(0% + var(--arrow-size));
--cy:var(--arrow-pos,50%);
--arrow-l:
var(--cx) calc(var(--cy) + var(--arrow-size) * 0.707),
calc(var(--cx) - var(--arrow-size) * 0.707) var(--cy),
var(--cx) calc(var(--cy) - var(--arrow-size) * 0.707);
padding-left:calc(var(--l) + var(--px));
}
.tooltip-bubble,
.tooltip-bubble.corners-3{
--d1:calc(var(--rad) * 0.134);
--d2:calc(var(--rad) * 0.5);
--corner1:
var(--l) calc(var(--t) + var(--rad)),
calc(var(--l) + var(--d1)) calc(var(--t) + var(--d2)),
calc(var(--l) + var(--d2)) calc(var(--t) + var(--d1)),
calc(var(--l) + var(--rad)) var(--t);
--corner2:
calc(100% - var(--r) - var(--rad)) var(--t),
calc(100% - var(--r) - var(--d2)) calc(var(--t) + var(--d1)),
calc(100% - var(--r) - var(--d1)) calc(var(--t) + var(--d2)),
calc(100% - var(--r)) calc(var(--t) + var(--rad));
--corner3:
calc(100% - var(--r)) calc(100% - var(--b) - var(--rad)),
calc(100% - var(--r) - var(--d1)) calc(100% - var(--b) - var(--d2)),
calc(100% - var(--r) - var(--d2)) calc(100% - var(--b) - var(--d1)),
calc(100% - var(--r) - var(--rad)) calc(100% - var(--b));
--corner4:
calc(var(--l) + var(--rad)) calc(100% - var(--b)),
calc(var(--l) + var(--d2)) calc(100% - var(--b) - var(--d1)),
calc(var(--l) + var(--d1)) calc(100% - var(--b) - var(--d2)),
var(--l) calc(100% - var(--b) - var(--rad));
}
.tooltip-bubble.corners-5{
--d1:calc(var(--rad) * 0.0489);
--d2:calc(var(--rad) * 0.191);
--d3:calc(var(--rad) * 0.4122);
--d4:calc(var(--rad) * 0.691);
--corner1:
var(--l) calc(var(--t) + var(--rad)),
calc(var(--l) + var(--d1)) calc(var(--t) + var(--d4)),
calc(var(--l) + var(--d2)) calc(var(--t) + var(--d3)),
calc(var(--l) + var(--d3)) calc(var(--t) + var(--d2)),
calc(var(--l) + var(--d4)) calc(var(--t) + var(--d1)),
calc(var(--l) + var(--rad)) var(--t);
--corner2:
calc(100% - var(--r) - var(--rad)) var(--t),
calc(100% - var(--r) - var(--d4)) calc(var(--t) + var(--d1)),
calc(100% - var(--r) - var(--d3)) calc(var(--t) + var(--d2)),
calc(100% - var(--r) - var(--d2)) calc(var(--t) + var(--d3)),
calc(100% - var(--r) - var(--d1)) calc(var(--t) + var(--d4)),
calc(100% - var(--r)) calc(var(--t) + var(--rad));
--corner3:
calc(100% - var(--r)) calc(100% - var(--b) - var(--rad)),
calc(100% - var(--r) - var(--d1)) calc(100% - var(--b) - var(--d4)),
calc(100% - var(--r) - var(--d2)) calc(100% - var(--b) - var(--d3)),
calc(100% - var(--r) - var(--d3)) calc(100% - var(--b) - var(--d2)),
calc(100% - var(--r) - var(--d4)) calc(100% - var(--b) - var(--d1)),
calc(100% - var(--r) - var(--rad)) calc(100% - var(--b));
--corner4:
calc(var(--l) + var(--rad)) calc(100% - var(--b)),
calc(var(--l) + var(--d4)) calc(100% - var(--b) - var(--d1)),
calc(var(--l) + var(--d3)) calc(100% - var(--b) - var(--d2)),
calc(var(--l) + var(--d2)) calc(100% - var(--b) - var(--d3)),
calc(var(--l) + var(--d1)) calc(100% - var(--b) - var(--d4)),
var(--l) calc(100% - var(--b) - var(--rad));
}
.tooltip-bubble.corners-7{
--d1:calc(var(--rad) * 0.0251);
--d2:calc(var(--rad) * 0.099);
--d3:calc(var(--rad) * 0.2182);
--d4:calc(var(--rad) * 0.3765);
--d5:calc(var(--rad) * 0.5661);
--d6:calc(var(--rad) * 0.7775);
--corner1:
var(--l) calc(var(--t) + var(--rad)),
calc(var(--l) + var(--d1)) calc(var(--t) + var(--d6)),
calc(var(--l) + var(--d2)) calc(var(--t) + var(--d5)),
calc(var(--l) + var(--d3)) calc(var(--t) + var(--d4)),
calc(var(--l) + var(--d4)) calc(var(--t) + var(--d3)),
calc(var(--l) + var(--d5)) calc(var(--t) + var(--d2)),
calc(var(--l) + var(--d6)) calc(var(--t) + var(--d1)),
calc(var(--l) + var(--rad)) var(--t);
--corner2:
calc(100% - var(--r) - var(--rad)) var(--t),
calc(100% - var(--r) - var(--d6)) calc(var(--t) + var(--d1)),
calc(100% - var(--r) - var(--d5)) calc(var(--t) + var(--d2)),
calc(100% - var(--r) - var(--d4)) calc(var(--t) + var(--d3)),
calc(100% - var(--r) - var(--d3)) calc(var(--t) + var(--d4)),
calc(100% - var(--r) - var(--d2)) calc(var(--t) + var(--d5)),
calc(100% - var(--r) - var(--d1)) calc(var(--t) + var(--d6)),
calc(100% - var(--r)) calc(var(--t) + var(--rad));
--corner3:
calc(100% - var(--r)) calc(100% - var(--b) - var(--rad)),
calc(100% - var(--r) - var(--d1)) calc(100% - var(--b) - var(--d6)),
calc(100% - var(--r) - var(--d2)) calc(100% - var(--b) - var(--d5)),
calc(100% - var(--r) - var(--d3)) calc(100% - var(--b) - var(--d4)),
calc(100% - var(--r) - var(--d4)) calc(100% - var(--b) - var(--d3)),
calc(100% - var(--r) - var(--d5)) calc(100% - var(--b) - var(--d2)),
calc(100% - var(--r) - var(--d6)) calc(100% - var(--b) - var(--d1)),
calc(100% - var(--r) - var(--rad)) calc(100% - var(--b));
--corner4:
calc(var(--l) + var(--rad)) calc(100% - var(--b)),
calc(var(--l) + var(--d6)) calc(100% - var(--b) - var(--d1)),
calc(var(--l) + var(--d5)) calc(100% - var(--b) - var(--d2)),
calc(var(--l) + var(--d4)) calc(100% - var(--b) - var(--d3)),
calc(var(--l) + var(--d3)) calc(100% - var(--b) - var(--d4)),
calc(var(--l) + var(--d2)) calc(100% - var(--b) - var(--d5)),
calc(var(--l) + var(--d1)) calc(100% - var(--b) - var(--d6)),
var(--l) calc(100% - var(--b) - var(--rad));
}`,
};

export default css;
