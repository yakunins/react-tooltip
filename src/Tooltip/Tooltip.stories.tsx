import { useRef, useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from './';
import { TooltipShape } from '../TooltipShape';
import { type ArrowPlacement, type Placement } from '../types';

const demoCss = `
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
    openDelay: { control: { type: 'range', min: 0, max: 1000, step: 50 } },
    closeDelay: { control: { type: 'range', min: 0, max: 1000, step: 50 } },
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
    children: (
      <button type="button" className="demo-btn">
        anchor
      </button>
    ),
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const placements: Placement[] = ['top', 'bottom', 'left', 'right'];

/* ----------------------------------------------------------------------- */

export const Playground: Story = {
  args: {
    content: 'A contemporary tooltip — Popover API + CSS anchor positioning.',
    placement: 'top',
    trigger: ['hover', 'focus'],
    openDelay: 200,
    closeDelay: 100,
    offset: '0.25em',
    autoFlip: true,
    className: 'grad-1',
    children: (
      <button type="button" className="demo-btn">
        Hover or focus me
      </button>
    ),
  },
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
        <button type="button" className="demo-btn">
          {p}
        </button>
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
        <button type="button" className="demo-btn">
          {p}
        </button>
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
        <button type="button" className="demo-btn">
          {ap}
        </button>
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
      <button type="button" className="demo-btn">
        hover
      </button>
    </Tooltip>
    <Tooltip
      trigger={['focus']}
      content="Shown on keyboard / focus only"
      className="grad-2"
    >
      <button type="button" className="demo-btn">
        focus
      </button>
    </Tooltip>
    <Tooltip
      trigger={['click']}
      content="Click to toggle — Esc to close"
      className="grad-3"
    >
      <button type="button" className="demo-btn">
        click
      </button>
    </Tooltip>
    <Tooltip
      trigger={['hover', 'focus', 'click']}
      content="All triggers"
      className="grad-4"
    >
      <button type="button" className="demo-btn">
        all
      </button>
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
      <button type="button" className="demo-btn">
        custom bubble
      </button>
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
      <button type="button" className="demo-btn">
        thin arrow
      </button>
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
        <button type="button" className="demo-btn">
          anchored button
        </button>
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
  const btnRef = useRef<HTMLButtonElement>(null);
  return (
    <div
      style={{
        display: 'flex',
        gap: '2rem',
        padding: '5rem',
        alignItems: 'center',
      }}
    >
      <button ref={btnRef} type="button" className="demo-btn">
        external trigger (anchorRef)
      </button>
      <Tooltip
        anchorRef={btnRef}
        content="anchorRef — no wrapping div; Tooltip writes anchor-name onto the button"
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
      <button
        type="button"
        className="demo-btn"
        style={{ anchorName: '--external-by-name' } as CSSProperties}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        external trigger (anchorName, controlled)
      </button>
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
