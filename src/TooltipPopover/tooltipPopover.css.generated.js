/* This file is auto-generated */

const css = {
  src: `src/TooltipPopover/tooltipPopover.css`,
  hash: `14cj2jhz36q`,
  content: `
@property --tooltip-arrow-inset{
syntax:'<length>';
inherits:true;
initial-value:0px;
}
.tooltip-popover{
inset:auto;
margin:0;
padding:0;
border:0;
background:transparent;
color:inherit;
overflow:visible;
width:max-content;
height:max-content;
--tooltip-arrow-inset:calc(
var(--tooltip-radius) + var(--tooltip-arrow-size) * 0.707
);
--tooltip-outline-color:rgba(255,255,255,1);
--tooltip-outline-size:0px;
--tooltip-outline-blur:0.5px;
--o-c:var(--tooltip-outline-color);
--o-s:var(--tooltip-outline-size);
--o--s:calc(var(--o-s) * -1);
--o-b:var(--tooltip-outline-blur);
--tooltip-outline:drop-shadow(var(--o-s) 0 var(--o-b) var(--o-c))
drop-shadow(var(--o--s) 0 var(--o-b) var(--o-c))
drop-shadow(0 var(--o-s) var(--o-b) var(--o-c))
drop-shadow(0 var(--o--s) var(--o-b) var(--o-c));
position:fixed;
position-visibility:always;
opacity:0;
}
.tooltip-popover:popover-open{
opacity:1;
filter:var(--tooltip-outline);
}
.tooltip-popover[data-anchor-hidden]{
pointer-events:none;
}
.tooltip-popover[data-placement='top']{
bottom:anchor(top);
left:anchor(center);
translate:-50% 0;
margin-bottom:var(--tooltip-offset,0.25em);
--flip-from:translateY(8px);
}
.tooltip-popover[data-placement='bottom']{
top:anchor(bottom);
left:anchor(center);
translate:-50% 0;
margin-top:var(--tooltip-offset,0.25em);
--flip-from:translateY(-8px);
}
.tooltip-popover[data-placement='left']{
right:anchor(left);
top:anchor(center);
translate:0 -50%;
margin-right:var(--tooltip-offset,0.25em);
--flip-from:translateX(8px);
}
.tooltip-popover[data-placement='right']{
left:anchor(right);
top:anchor(center);
translate:0 -50%;
margin-left:var(--tooltip-offset,0.25em);
--flip-from:translateX(-8px);
}
.tooltip-popover .tooltip-bubble{
--arrow-inset:var(--tooltip-arrow-inset);
}
.tooltip-popover[data-placement='top'][data-arrow='start'],
.tooltip-popover[data-placement='bottom'][data-arrow='start']{
translate:calc(-1 * var(--tooltip-arrow-inset)) 0;
}
.tooltip-popover[data-placement='top'][data-arrow='end'],
.tooltip-popover[data-placement='bottom'][data-arrow='end']{
translate:calc(-100% + var(--tooltip-arrow-inset)) 0;
}
.tooltip-popover[data-placement='left'][data-arrow='start'],
.tooltip-popover[data-placement='right'][data-arrow='start']{
translate:0 calc(-1 * var(--tooltip-arrow-inset));
}
.tooltip-popover[data-placement='left'][data-arrow='end'],
.tooltip-popover[data-placement='right'][data-arrow='end']{
translate:0 calc(-100% + var(--tooltip-arrow-inset));
}`,
};

export default css;
