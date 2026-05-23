# Contemporary React Tooltip 

A small, dependency-light React tooltip built on modern web-platform
features:

- **Native Popover API** — the bubble lives in the browser **top layer**, so
  it escapes `overflow: hidden` and `z-index` stacking with no portal.
- **CSS anchor positioning** — the bubble pins itself to its trigger with
  `anchor-name` / `position-anchor` / `anchor()`; no JS measuring on scroll.
  The [`@oddbird`](https://github.com/oddbird/css-anchor-positioning) polyfill
  is loaded **only** in browsers without native support (currently Firefox).
- **Pure-CSS shape** — the rounded bubble *and* its arrow are one
  `clip-path: polygon(...)` — no borders, pseudo-elements or SVG.
- **Zero-config styling** — each component injects its own stylesheet slice
  at runtime; no CSS import and no bundler CSS loader required.

```tsx
import { Tooltip } from 'react-tooltip-contemporary';

<Tooltip content="Saved to your library" placement="top">
  <button>Save</button>
</Tooltip>;
```

## Components

Each component injects its own stylesheet slice at runtime, so all three
work standalone with no CSS import.

| Export          | Role                                            |
| --------------- | ----------------------------------------------- |
| `Tooltip`       | The tooltip — behaviour, triggers, positioning. |
| `TooltipShape`  | The bubble: the clip-path shape + arrow.        |
| `TooltipAnchor` | The "anchor" half of CSS anchor positioning.    |

## `Tooltip` props

| Prop           | Type                                      | Default              | Notes                                              |
| -------------- | ----------------------------------------- | -------------------- | -------------------------------------------------- |
| `children`     | `ReactNode`                               | —                    | The trigger element (wrapping mode).               |
| `content`      | `ReactNode`                               | —                    | The bubble content.                                |
| `placement`    | `'top' \| 'bottom' \| 'left' \| 'right'`  | `'top'`              | Preferred side of the anchor.                      |
| `trigger`      | `('hover' \| 'focus' \| 'click')[]`       | `['hover', 'focus']` | Interactions that reveal the tooltip.              |
| `openDelay`    | `number`                                  | `200`                | ms before showing.                                 |
| `closeDelay`   | `number`                                  | `100`                | ms before hiding.                                  |
| `offset`       | `string`                                  | `'0.25em'`           | Gap between anchor and bubble (any CSS length).    |
| `autoFlip`     | `boolean`                                 | `true`               | Flip to the opposite side when it would overflow.  |
| `defaultOpen`  | `boolean`                                 | `false`              | Initial open state (uncontrolled).                 |
| `open`         | `boolean`                                 | —                    | Controlled open state; pair with `onOpenChange`.   |
| `onOpenChange` | `(open: boolean) => void`                 | —                    | Fires when the open state should change.           |
| `shapeStyle`   | `TooltipShapeStyle`                       | —                    | Bubble appearance (see below).                     |
| `className`    | `string`                                  | —                    | Applied to the popover element.                    |
| `style`        | `CSSProperties`                           | —                    | Applied to the popover element.                    |
| `anchorRef`    | `RefObject<HTMLElement>`                  | —                    | Attach to an existing element instead of wrapping `children`. See *External anchor* below. |
| `anchorName`   | `string`                                  | —                    | Use this CSS anchor name verbatim. See *External anchor* below.                            |

### `shapeStyle`

Every field maps to a CSS custom property; omitted fields use the stylesheet
default.

```tsx
<Tooltip
  content="Custom bubble"
  shapeStyle={{
    background: '#2563eb',
    color: '#fff',
    radius: '0.8em',
    arrowSize: '0.6em',
    paddingX: '1em',
    paddingY: '0.5em',
    maxWidth: '20rem',
    transitionDuration: '0.25s',
  }}
>
  <button>Hover me</button>
</Tooltip>
```

## Controlled usage

```tsx
const [open, setOpen] = useState(false);

<Tooltip open={open} onOpenChange={setOpen} content="Controlled">
  <button>Anchor</button>
</Tooltip>;
```

## External anchor (skip the wrapper)

When you'd rather attach the tooltip to an element you already render —
without `Tooltip` wrapping it in an extra `<div>` — pass `anchorRef` and
omit `children`. `Tooltip` writes `anchor-name` onto the referenced
element, wires the configured triggers to it, and mirrors
`aria-describedby` on it for accessibility:

```tsx
const btnRef = useRef<HTMLButtonElement>(null);

<>
  <button ref={btnRef}>Save</button>
  <Tooltip anchorRef={btnRef} content="Saved" />
</>;
```

If you'd rather own the CSS anchor name yourself, use `anchorName`. In
this mode `Tooltip` has no handle to your element, so it cannot wire
triggers — pair with controlled `open` / `onOpenChange`:

```tsx
const [open, setOpen] = useState(false);

<>
  <button
    style={{ anchorName: '--save-btn' } as CSSProperties}
    onMouseEnter={() => setOpen(true)}
    onMouseLeave={() => setOpen(false)}
  >
    Save
  </button>
  <Tooltip
    anchorName="--save-btn"
    open={open}
    onOpenChange={setOpen}
    content="Saved"
  />
</>;
```

## Browser support

Native Popover API, `@starting-style` and CSS anchor positioning are used.
Popover and `@starting-style` are supported across current Chrome, Safari and
Firefox; CSS anchor positioning is native in Chromium and Safari, and is
polyfilled on demand elsewhere.

## Development

```bash
npm install
npm run dev        # Storybook + css-to-js watcher
npm run build      # type-check, build to lib/, generate + copy CSS
npm test
```

Each component owns a `*.css` file; `css-to-js` regenerates the matching
`*.css.generated.js`, which the component injects at runtime.

## License

MIT © Sergey Yakunin
