import {
  forwardRef,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from './';
import { TooltipShape } from '../TooltipShape';
import { type ArrowPlacement, type Placement } from '../types';

const demoCss = `
  body { font-family: sans-serif; }
  .demo-btn {
    font: inherit;
    padding: 0.5em 1em;
    border-radius: 0.5em;
    border: 1px solid #cbd5e1;
    background: #fff;
    color: #0f172a;
    cursor: pointer;
  }
  .demo-btn:hover { background: #f1f5f9; }
  .demo-btn:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }

  /* dashed-underlined "help term" that serves as the tooltip anchor */
  .help-anchor {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    font: inherit;
    color: #0f172a;
    border-radius: 0.25em;
  }
  .help-anchor:hover { color: #2563eb; }
  .help-anchor:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
  .help-anchor-label {
    text-decoration: underline dashed;
    text-underline-offset: 0.2em;
    text-decoration-thickness: 1px;
  }
  .help-anchor-icon { flex: none; opacity: 0.7; }
  .tooltip pre { margin: 0; }
`;

/*
 * Colorful multi-layer gradient backgrounds, applied to the tooltip bubble
 * purely through demo CSS + the component's existing `className` prop — the
 * Tooltip component itself is untouched.
 *
 * `background-image` (many layers) + `background-blend-mode` cannot pass
 * through the single `background` shorthand that `bubbleStyle.background`
 * uses, so the gradients live here as classes instead.
 *
 * Each selector covers both placements of the class:
 *   `.grad-N .tooltip`  — on <Tooltip>, the class lands on the popover,
 *                         and the bubble (.tooltip) is its descendant.
 *   `.grad-N.tooltip`   — on <TooltipShape>, the class lands on the bubble.
 */
const gradientCss = `
  .grad-1 .tooltip,
  .grad-1.tooltip {
    background-color: transparent !important;
    background-image:
      linear-gradient(114.95deg, rgba(235, 0, 255, 0.5) 0%, rgba(0, 71, 255, 0) 34.35%),
      linear-gradient(180deg, #004b5b 0%, #ffa7a7 100%),
      linear-gradient(244.35deg, #ffb26a 0%, #3676b1 50.58%, #00a3ff 100%),
      linear-gradient(244.35deg, #ffffff 0%, #004a74 49.48%, #ff0000 100%),
      radial-gradient(100% 233.99% at 0% 100%, #b70000 0%, #ad00ff 100%),
      linear-gradient(307.27deg, #1dac92 0.37%, #2800c6 100%),
      radial-gradient(100% 140% at 100% 0%, #eaff6b 0%, #006c7a 57.29%, #2200aa 100%) !important;
    background-blend-mode: hard-light, overlay, overlay, overlay, difference, difference, normal !important;
  }

  .grad-2 .tooltip,
  .grad-2.tooltip {
    background-color: transparent !important;
    background-image:
      linear-gradient(120deg, #ff0000 0%, #2400ff 100%),
      linear-gradient(120deg, #fa00ff 0%, #208200 100%),
      linear-gradient(130deg, #00f0ff 0%, #000000 100%),
      radial-gradient(110% 140% at 15% 90%, #ffffff 0%, #1700a4 100%),
      radial-gradient(100% 100% at 50% 0%, #ad00ff 0%, #00ffe0 100%),
      radial-gradient(100% 100% at 50% 0%, #00ffe0 0%, #7300a9 80%),
      linear-gradient(30deg, #7ca304 0%, #2200aa 100%) !important;
    background-blend-mode: overlay, color, overlay, difference, color-dodge, difference, normal !important;
  }

  .grad-3 .tooltip,
  .grad-3.tooltip {
    background-color: transparent !important;
    background-image:
      linear-gradient(320.54deg, #00069f 0%, #120010 72.37%),
      linear-gradient(58.72deg, #69d200 0%, #970091 100%),
      linear-gradient(121.28deg, #8cff18 0%, #6c0075 100%),
      linear-gradient(121.28deg, #8000ff 0%, #000000 100%),
      linear-gradient(180deg, #00ff19 0%, #24ff00 0.01%, #2400ff 100%),
      linear-gradient(52.23deg, #0500ff 0%, #ff0000 100%),
      linear-gradient(121.28deg, #32003a 0%, #ff4040 100%),
      radial-gradient(50% 72.12% at 50% 50%, #eb00ff 0%, #110055 100%) !important;
    background-blend-mode: screen, color-dodge, color-burn, screen, overlay, difference, color-dodge, normal !important;
  }

  .grad-4 .tooltip,
  .grad-4.tooltip {
    background-color: transparent !important;
    background-image: radial-gradient(
      circle at 30% 110%,
      #ffdb8b 0%,
      #ee653d 25%,
      #d42e81 50%,
      #a237b6 75%,
      #3e5fbc 100%
    ) !important;
  }
`;

// Cycled across the demos so every tooltip gets a gradient.
const gradClasses = ['grad-1', 'grad-2', 'grad-3', 'grad-4'];

// A question-mark-in-circle, sized to the current font (1em) and inheriting
// `currentColor`.
const HelpIcon = () => (
  <svg
    className="help-anchor-icon"
    aria-hidden="true"
    focusable="false"
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
  >
    <circle
      cx="8"
      cy="8"
      r="7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M6.1 6.3c0-1.05.86-1.8 1.95-1.8s1.9.7 1.9 1.7c0 .8-.45 1.2-1.1 1.65-.62.43-.95.78-.95 1.55v.15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <circle cx="8" cy="11.5" r="0.95" fill="currentColor" />
  </svg>
);

// The dashed-underlined "help term" used as the tooltip anchor in place of a
// button: keeps its text label, appends the help icon, and is keyboard
// focusable (tabIndex=0) so focus/keyboard triggers still work. `forwardRef`
// and `...rest` let the external-anchor demos attach a ref / inline styles /
// handlers.
const HelpAnchor = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ children, className, ...rest }, ref) => (
    <span
      ref={ref}
      tabIndex={0}
      className={['help-anchor', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <span className="help-anchor-label">{children}</span>
      <HelpIcon />
    </span>
  )
);
HelpAnchor.displayName = 'HelpAnchor';

const meta = {
  title: 'Example/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placement: {
      control: 'radio',
      options: ['top', 'bottom', 'left', 'right'],
    },
    arrowPlacement: {
      control: 'radio',
      options: ['start', 'center', 'end'],
    },
    trigger: {
      control: 'check',
      options: ['hover', 'focus', 'click'],
    },
    autoFlip: { control: 'boolean' },
    offset: { control: 'text' },
    delayShow: { control: { type: 'range', min: 0, max: 1000, step: 50 } },
    delayHide: { control: { type: 'range', min: 0, max: 1000, step: 50 } },
  },
  decorators: [
    Story => (
      <>
        <style>{demoCss + gradientCss}</style>
        <Story />
      </>
    ),
  ],
  args: {
    content: 'A contemporary tooltip.',
    className: 'grad-1',
    children: <HelpAnchor>anchor</HelpAnchor>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const placements: Placement[] = ['top', 'bottom', 'left', 'right'];

const LoremIpsum = () => (
  <p>
    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    Lorem Ipsum has been the industry's standard dummy text ever since 1966,
    when designers at Letraset and James Mosley, the librarian at St Bride
    Printing Library, took a 1914 Cicero translation and scrambled it to make
    dummy text for Letraset's Body Type sheets. It has survived not only many
    decades, but also the leap into electronic typesetting, remaining
    essentially unchanged. It was popularised thanks to these sheets and more
    recently with desktop publishing software including versions of Lorem Ipsum.
  </p>
);

/* ----------------------------------------------------------------------- */

export const Playground: Story = {
  args: {
    content: (
      <span>
        Contemporary tooltip component: based on based on{' '}
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Popover_API">
          Popover API
        </a>
        ,{' '}
        <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning">
          anchor positioning
        </a>
        ,{' '}
        <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path">
          clip-path shape
        </a>
      </span>
    ),
    placement: 'top',
    trigger: ['hover', 'focus', 'click'],
    bubbleStyle: { radius: '1rem', arrowSize: '1rem' },
    delayShow: 200,
    delayHide: 100,
    offset: '0.25em',
    autoFlip: true,
    className: 'grad-1',
    children: <HelpAnchor>Click, hover, or focus me</HelpAnchor>,
  },
  render: args => (
    <div style={{ maxWidth: '36rem' }}>
      <LoremIpsum />
      <Tooltip {...args} />
      <LoremIpsum />
      <LoremIpsum />
      <LoremIpsum />
    </div>
  ),
};

/* ----------------------------------------------------------------------- */

const PlacementsDemo = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, auto)',
      gap: '4rem',
      placeItems: 'center',
      padding: '5rem',
    }}
  >
    {placements.map((p, i) => (
      <Tooltip
        key={p}
        placement={p}
        content={`placement = "${p}"`}
        className={gradClasses[i]}
      >
        <HelpAnchor>{p}</HelpAnchor>
      </Tooltip>
    ))}
  </div>
);

export const Placements: Story = {
  render: () => <PlacementsDemo />,
  parameters: { layout: 'fullscreen' },
};

/* ----------------------------------------------------------------------- */

// Every placement forced open at once — no hover/focus needed. Each tooltip
// is controlled with `open` pinned to `true`, and `autoFlip` is disabled so a
// bubble never flips away from the side it is meant to demonstrate. Generous
// horizontal gaps and padding leave room for the `left`/`right` bubbles, which
// extend sideways past their anchors.
const AllPlacementsDemo = () => (
  <div
    style={{
      display: 'flex',
      gap: '9rem',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6rem',
    }}
  >
    {placements.map((p, i) => (
      <Tooltip
        key={p}
        placement={p}
        open
        autoFlip={false}
        content={<pre>{`placement:\n"${p}"`}</pre>}
        className={gradClasses[i]}
      >
        <HelpAnchor>{p}</HelpAnchor>
      </Tooltip>
    ))}
  </div>
);

export const AllPlacements: Story = {
  render: () => <AllPlacementsDemo />,
  parameters: { layout: 'fullscreen' },
};

/* ----------------------------------------------------------------------- */

// arrowPlacement = start | center | end. Every variant is forced open so the
// effect is visible without interaction. The arrow always points at the
// anchor's center; arrowPlacement just chooses which way the bubble body
// extends — `start` puts the arrow near the bubble's leading edge (body grows
// toward the end), `end` mirrors it, `center` (the default) is symmetric.
// Shown for a horizontal placement (top) and a vertical one (left) so both
// axes are clear.
const arrowPlacements: ArrowPlacement[] = ['start', 'center', 'end'];

const ArrowPlacementRow = ({ placement }: { placement: Placement }) => (
  <div
    style={{
      display: 'flex',
      gap: '7rem',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {arrowPlacements.map((ap, i) => (
      <Tooltip
        key={ap}
        placement={placement}
        arrowPlacement={ap}
        open
        autoFlip={false}
        content={<pre>{`arrowPlacement:\n"${ap}"`}</pre>}
        className={gradClasses[i]}
      >
        <HelpAnchor>{ap}</HelpAnchor>
      </Tooltip>
    ))}
  </div>
);

const ArrowPlacementsDemo = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8rem',
      padding: '6rem',
    }}
  >
    <ArrowPlacementRow placement="top" />
    <ArrowPlacementRow placement="left" />
  </div>
);

export const ArrowPlacements: Story = {
  render: () => <ArrowPlacementsDemo />,
  parameters: { layout: 'fullscreen' },
};

/* ----------------------------------------------------------------------- */

const TriggersDemo = () => (
  <div style={{ display: 'flex', gap: '2rem', padding: '5rem' }}>
    <Tooltip
      trigger={['hover']}
      content="Shown on hover only"
      className="grad-1"
    >
      <HelpAnchor>hover</HelpAnchor>
    </Tooltip>
    <Tooltip
      trigger={['focus']}
      content="Shown on keyboard / focus only"
      className="grad-2"
    >
      <HelpAnchor>focus</HelpAnchor>
    </Tooltip>
    <Tooltip
      trigger={['click']}
      content="Click to toggle — Esc to close"
      className="grad-3"
    >
      <HelpAnchor>click</HelpAnchor>
    </Tooltip>
    <Tooltip
      trigger={['hover', 'focus', 'click']}
      content="All triggers"
      className="grad-4"
    >
      <HelpAnchor>all</HelpAnchor>
    </Tooltip>
  </div>
);

export const Triggers: Story = {
  render: () => <TriggersDemo />,
  parameters: { layout: 'fullscreen' },
};

/* ----------------------------------------------------------------------- */

const CustomShapeDemo = () => (
  <div style={{ display: 'flex', gap: '2.5rem', padding: '5rem' }}>
    <Tooltip
      content="Roomy bubble, slow fade, vivid gradient"
      placement="top"
      className="grad-3"
      bubbleStyle={{
        radius: '0.8em',
        arrowSize: '0.7em',
        paddingX: '1em',
        paddingY: '0.55em',
        transitionDuration: '0.3s',
      }}
    >
      <HelpAnchor>custom bubble</HelpAnchor>
    </Tooltip>
    <Tooltip
      content="Tight corners and a hairline-thin arrow"
      placement="bottom"
      className="grad-2"
      bubbleStyle={{
        radius: '0.3em',
        arrowSize: '0.35em',
      }}
    >
      <HelpAnchor>thin arrow</HelpAnchor>
    </Tooltip>
  </div>
);

export const CustomShape: Story = {
  render: () => <CustomShapeDemo />,
  parameters: { layout: 'fullscreen' },
};

/* ----------------------------------------------------------------------- */

const ControlledDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        padding: '5rem',
      }}
    >
      <button
        type="button"
        className="demo-btn"
        onClick={() => setOpen(o => !o)}
      >
        {open ? 'Hide' : 'Show'} from outside
      </button>
      <Tooltip
        open={open}
        onOpenChange={setOpen}
        placement="bottom"
        content="open is owned by the parent — hover still works too"
        className="grad-4"
      >
        <HelpAnchor>anchored button</HelpAnchor>
      </Tooltip>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledDemo />,
  parameters: { layout: 'fullscreen' },
};

/* ----------------------------------------------------------------------- */

const ExternalAnchorRefDemo = () => {
  const termRef = useRef<HTMLSpanElement>(null);
  return (
    <div
      style={{
        display: 'flex',
        gap: '2rem',
        padding: '5rem',
        alignItems: 'center',
      }}
    >
      <HelpAnchor ref={termRef}>external trigger (anchorRef)</HelpAnchor>
      <Tooltip
        anchorRef={termRef}
        content="anchorRef — no wrapping div; Tooltip writes anchor-name onto the element"
        className="grad-1"
      />
    </div>
  );
};

const ExternalAnchorNameDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        gap: '2rem',
        padding: '5rem',
        alignItems: 'center',
      }}
    >
      <HelpAnchor
        style={{ anchorName: '--external-by-name' } as CSSProperties}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        external trigger (anchorName, controlled)
      </HelpAnchor>
      <Tooltip
        anchorName="--external-by-name"
        open={open}
        onOpenChange={setOpen}
        content="anchorName-only — no triggers wired; parent owns open state"
        className="grad-2"
      />
    </div>
  );
};

export const ExternalAnchor: Story = {
  render: () => (
    <div>
      <ExternalAnchorRefDemo />
      <ExternalAnchorNameDemo />
    </div>
  ),
  parameters: { layout: 'fullscreen' },
};

/* ----------------------------------------------------------------------- */

// `TooltipShape` injects its own stylesheet, so it renders standalone.
const ShapeDemo = () => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2.5rem',
      padding: '3rem',
      placeItems: 'center',
    }}
  >
    {placements.map((p, i) => (
      <TooltipShape key={p} placement={p} className={gradClasses[i]}>
        {`<TooltipShape placement="${p}" />`}
      </TooltipShape>
    ))}
    <TooltipShape
      placement="top"
      className="grad-1"
      bubbleStyle={{
        radius: '0.9em',
        arrowSize: '0.8em',
      }}
    >
      Custom bubbleStyle on a standalone TooltipShape
    </TooltipShape>
  </div>
);

export const Shape: Story = {
  render: () => <ShapeDemo />,
  parameters: { layout: 'fullscreen' },
};

/* ----------------------------------------------------------------------- */

// autoFlip only does something when the bubble would overflow the viewport on
// its preferred side — then it flips to the opposite side. Centered demos
// never reach an edge, so autoFlip is a silent no-op there (which is why it
// looks like "nothing happens").
//
// This story is a big scrollable canvas with the four anchors clustered in the
// dead centre. HOVER an anchor to open its tooltip, then scroll: an
// IntersectionObserver tracks the bubble and flips it live (throttled, ~0.5s)
// as it nears the matching viewport edge, flipping back when there's room
// again. It also evaluates on open, so scrolling first then hovering works too.
//
// Note: the styled bubble needs native CSS anchor positioning (Chromium /
// Safari). In Firefox the tooltip degrades to a native `title`, so there is no
// bubble to flip.

// Faint grid so the scrolling is visible against the empty canvas.
const gridBg =
  'repeating-linear-gradient(0deg, #f1f5f9 0 1px, transparent 1px 64px),' +
  'repeating-linear-gradient(90deg, #f1f5f9 0 1px, transparent 1px 64px)';

const AutoFlipDemo = () => (
  <div
    style={{
      minWidth: '200vw',
      minHeight: '200vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: gridBg,
    }}
  >
    {/* fixed so it stays put while you scroll the canvas underneath */}
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 'calc(50% - 18rem)',
        padding: '0.75rem 1rem',
        pointerEvents: 'none',
        maxWidth: '36rem',
      }}
    >
      Hover an anchor to open it, then scroll the canvas toward the matching
      edge (down for <code>top</code>, up for <code>bottom</code>, right for{' '}
      <code>left</code>, left for <code>right</code>) — it flips to the opposite
      side live as it nears the edge, and flips back when there's room again.
    </div>

    <div style={{ display: 'flex', gap: '20dvw' }}>
      {placements.map((p, i) => (
        <Tooltip
          key={p}
          placement={p}
          autoFlip
          open
          content={
            <pre>{`placement="${p}"\nscroll to its edge,\nthen hover`}</pre>
          }
          className={gradClasses[i]}
        >
          <HelpAnchor>{p}</HelpAnchor>
        </Tooltip>
      ))}
    </div>
  </div>
);

export const AutoFlip: Story = {
  render: () => <AutoFlipDemo />,
  parameters: { layout: 'fullscreen' },
};
