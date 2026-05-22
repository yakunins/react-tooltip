import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip, TooltipShape } from './';
import { type Placement } from './types';
import { default as css } from './tooltip.css.generated.js';

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
        <style>{demoCss}</style>
        <Story />
      </>
    ),
  ],
  args: {
    content: 'A contemporary tooltip.',
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
    {placements.map(p => (
      <Tooltip key={p} placement={p} content={`placement = "${p}"`}>
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

const TriggersDemo = () => (
  <div style={{ display: 'flex', gap: '2rem', padding: '5rem' }}>
    <Tooltip trigger={['hover']} content="Shown on hover only">
      <button type="button" className="demo-btn">
        hover
      </button>
    </Tooltip>
    <Tooltip trigger={['focus']} content="Shown on keyboard / focus only">
      <button type="button" className="demo-btn">
        focus
      </button>
    </Tooltip>
    <Tooltip trigger={['click']} content="Click to toggle — Esc to close">
      <button type="button" className="demo-btn">
        click
      </button>
    </Tooltip>
    <Tooltip trigger={['hover', 'focus', 'click']} content="All triggers">
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
      content="Blue, roomy, slow fade"
      placement="top"
      shapeStyle={{
        background: '#2563eb',
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
      content="Light theme with a hairline-thin arrow"
      placement="bottom"
      shapeStyle={{
        background: '#f8fafc',
        color: '#0f172a',
        radius: '0.3em',
        arrowSize: '0.35em',
      }}
    >
      <button type="button" className="demo-btn">
        light theme
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

// `TooltipShape` is purely visual — it does not inject the stylesheet, so
// this story injects `tooltip.css` itself to render the bare bubbles.
const ShapeDemo = () => (
  <>
    <style>{css.content}</style>
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2.5rem',
        padding: '3rem',
        placeItems: 'center',
      }}
    >
      {placements.map(p => (
        <TooltipShape key={p} placement={p}>
          {`<TooltipShape placement="${p}" />`}
        </TooltipShape>
      ))}
      <TooltipShape
        placement="top"
        shapeStyle={{ background: '#16a34a', radius: '0.9em', arrowSize: '0.8em' }}
      >
        Custom shapeStyle on a standalone TooltipShape
      </TooltipShape>
    </div>
  </>
);

export const Shape: Story = {
  render: () => <ShapeDemo />,
  parameters: { layout: 'fullscreen' },
};
