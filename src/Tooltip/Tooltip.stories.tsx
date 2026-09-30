import {
  forwardRef,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from './';
import { TooltipBubble } from '../TooltipBubble';
import { type ArrowPlacement, type Placement } from '../types';

const demoCss = `
  body { font-family: 'Segoe UI', sans-serif; }
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
    font: inherit;
    color: #0f172a;
    border-radius: 0.25em;
    text-decoration: underline dashed;
    text-underline-offset: 0.2em;
    text-decoration-thickness: 1px;
  }
  .help-anchor:hover { color: #2563eb; }
  .help-anchor:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
  .tooltip-bubble pre { margin: 0; }
`;

// Demo gradients via className: multi-layer backgrounds with blend modes
// can't pass through the single `bubbleStyle.background` shorthand.
const gradientCss = `
  .grad-1 .tooltip-bubble,
  .grad-1.tooltip-bubble {
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

  .grad-2 .tooltip-bubble,
  .grad-2.tooltip-bubble {
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

  .grad-3 .tooltip-bubble,
  .grad-3.tooltip-bubble {
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

  .grad-4 .tooltip-bubble,
  .grad-4.tooltip-bubble {
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

// Focusable "help term" anchor; forwardRef + ...rest let external-anchor
// demos attach refs, styles and handlers.
const HelpAnchor = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ children, className, ...rest }, ref) => (
    <span
      ref={ref}
      tabIndex={0}
      className={['help-anchor', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
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
    timings: { control: 'object' },
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
  <p className="lorem-ipsum">
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

// ---------------------------------------------------------------------------

export const Playground: Story = {
  args: {
    content: (
      <span>
        Contemporary tooltip component: based on{' '}
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Popover_API">
          Popover API
        </a>
        ,{' '}
        <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning">
          anchor positioning
        </a>
        , and{' '}
        <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path">
          clip-path shape
        </a>
      </span>
    ),
    bubbleStyle: { radius: '1.5rem', arrowSize: '1rem', cornerSegments: 5 },
    className: 'grad-2',
    children: <HelpAnchor>Click, hover, or focus me</HelpAnchor>,
    defaultOpen: true,
    offset: '-0.25em',
    style: { '--tooltip-outline-color': 'transparent' } as CSSProperties,
  },
  render: args => (
    <div style={{ maxWidth: '36rem' }}>
      <style>
        {
          'body { background-color: rgba(127,127,127, .25); } .lorem-ipsum { color: rgba(127,127,127, .25); }'
        }
      </style>
      <LoremIpsum />
      <Tooltip {...args} />
      <LoremIpsum />
      <LoremIpsum />
      <LoremIpsum />
    </div>
  ),
};

// ---------------------------------------------------------------------------

// Playground with every prop at its default and no gradient: the stock look.
export const NoStylePlayground: Story = {
  args: {
    content: (
      <span>
        Contemporary tooltip component: based on{' '}
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
    className: undefined,
    children: <HelpAnchor>Click, hover, or focus me</HelpAnchor>,
    defaultOpen: true,
  },
  render: args => (
    <div style={{ maxWidth: '36rem' }}>
      <style>
        {
          'body { background-color: rgba(127,127,127, .25); } .lorem-ipsum { color: rgba(127,127,127, .25); }'
        }
      </style>
      <LoremIpsum />
      <Tooltip {...args} />
      <LoremIpsum />
      <LoremIpsum />
      <LoremIpsum />
    </div>
  ),
};

// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------

// All placements forced open, autoFlip off so each stays on its side.
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

// ---------------------------------------------------------------------------

// arrowPlacement start / center / end, forced open, on top and left to show
// both axes.
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

// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------

// `TooltipBubble` injects its own stylesheet, so it renders standalone.
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
      <TooltipBubble key={p} placement={p} className={gradClasses[i]}>
        {`<TooltipBubble placement="${p}" />`}
      </TooltipBubble>
    ))}
    <TooltipBubble
      placement="top"
      className="grad-1"
      bubbleStyle={{
        radius: '0.9em',
        arrowSize: '0.8em',
      }}
    >
      Custom bubbleStyle on a standalone TooltipBubble
    </TooltipBubble>
  </div>
);

export const Shape: Story = {
  render: () => <ShapeDemo />,
  parameters: { layout: 'fullscreen' },
};

// ---------------------------------------------------------------------------

// Draggable, forced-open anchors: drag one toward its edge and the bubble
// flips live (autoFlip is a no-op until the bubble would overflow).

// Faint grid so the dragging is visible against the empty canvas.
const gridBg =
  'repeating-linear-gradient(0deg, #f1f5f9 0 1px, transparent 1px 64px),' +
  'repeating-linear-gradient(90deg, #f1f5f9 0 1px, transparent 1px 64px)';

// Viewport-fixed drag wrapper, clamped to the window, matching the autoFlip math.
const DraggableAnchor = ({
  children,
  initial,
}: {
  children: ReactNode;
  initial: CSSProperties;
}) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef({ active: false, offX: 0, offY: 0 });

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = {
      active: true,
      offX: e.clientX - r.left,
      offY: e.clientY - r.top,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const w = e.currentTarget.offsetWidth;
    const h = e.currentTarget.offsetHeight;
    const x = Math.max(
      0,
      Math.min(e.clientX - drag.current.offX, window.innerWidth - w)
    );
    const y = Math.max(
      0,
      Math.min(e.clientY - drag.current.offY, window.innerHeight - h)
    );
    setPos({ x, y });
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current.active = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const placed: CSSProperties = pos
    ? { left: pos.x, top: pos.y }
    : { ...initial };

  return (
    <div
      style={{
        position: 'fixed',
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
        ...placed,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children}
    </div>
  );
};

// Start near the centre, offset toward the edge each one demonstrates.
const initialSpots: Record<Placement, CSSProperties> = {
  top: { left: 'calc(50% - 1.5rem)', top: 'calc(50% - 6rem)' },
  bottom: { left: 'calc(50% - 1.5rem)', top: 'calc(50% + 5rem)' },
  left: { left: 'calc(50% - 11rem)', top: '50%' },
  right: { left: 'calc(50% + 7rem)', top: '50%' },
};

const AutoFlipDemo = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: gridBg,
    }}
  >
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '0.75rem 1rem',
        pointerEvents: 'none',
        maxWidth: '40rem',
        textAlign: 'center',
      }}
    >
      Drag an anchor toward the matching viewport edge (up for <code>top</code>,
      down for <code>bottom</code>, left for <code>left</code>, right for{' '}
      <code>right</code>) — its bubble flips to the opposite side live as it
      nears the edge, and flips back when there's room again.
    </div>

    {placements.map((p, i) => (
      <DraggableAnchor key={p} initial={initialSpots[p]}>
        <Tooltip
          placement={p}
          autoFlip
          open
          content={<pre>{`placement="${p}"\ndrag me to the ${p} edge`}</pre>}
          className={gradClasses[i]}
        >
          <HelpAnchor>{p}</HelpAnchor>
        </Tooltip>
      </DraggableAnchor>
    ))}
  </div>
);

export const AutoFlip: Story = {
  render: () => <AutoFlipDemo />,
  parameters: { layout: 'fullscreen' },
};

// Anchor inside a scroll container: the bubble fades when the anchor is
// clipped (useAnchorVisibility) and flips at the container edges.
const ScrollContainerDemo = () => (
  <div style={{ padding: '2rem', background: gridBg, minHeight: '100vh' }}>
    <p style={{ maxWidth: '40rem', marginTop: 0 }}>
      Scroll the box below until the anchor leaves it: the bubble (drawn in the
      top layer, above the box) fades out once its anchor is fully clipped.
      Scroll back and it fades back in. Near the box&apos;s top edge the bubble
      flips below the anchor, to stay inside the box.
    </p>
    <div
      ref={el => {
        if (!el) return;
        el.scrollTo({
          left: (el.scrollWidth - el.clientWidth) / 2,
          top: (el.scrollHeight - el.clientHeight) / 2,
        });
      }}
      style={{
        width: '24rem',
        height: '16rem',
        overflow: 'auto',
        border: '1px solid #cbd5e1',
        borderRadius: '0.5rem',
        background: '#eee',
      }}
    >
      <div
        style={{
          width: '72rem',
          height: '48rem',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Tooltip open content="scroll my anchor out of the box">
          <HelpAnchor>anchor</HelpAnchor>
        </Tooltip>
      </div>
    </div>
  </div>
);

export const ScrollContainer: Story = {
  render: () => <ScrollContainerDemo />,
  parameters: { layout: 'fullscreen' },
};
