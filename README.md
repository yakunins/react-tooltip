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
- **Zero-config styling** — `tooltip.css` is injected at runtime; no CSS
  import and no bundler CSS loader required.

```tsx
import { Tooltip } from 'react-tooltip-contemporary';

<Tooltip content="Saved to your library" placement="top">
  <button>Save</button>
</Tooltip>;
```

## Components

| Export            | Role                                                              |
| ----------------- | ----------------------------------------------------------------- |
| `Tooltip`         | The component to use — behaviour **plus** the injected stylesheet. |
| `UnstyledTooltip` | Same behaviour, no stylesheet — bring your own `tooltip.css`.      |
| `TooltipShape`    | The bubble only: the clip-path shape + arrow.                     |
| `TooltipAnchor`   | The "anchor" half of CSS anchor positioning.                      |

## `Tooltip` props

| Prop           | Type                                      | Default              | Notes                                              |
| -------------- | ----------------------------------------- | -------------------- | -------------------------------------------------- |
| `children`     | `ReactNode`                               | —                    | The trigger element.                               |
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

`tooltip.css` is the source of truth; `css-to-js` regenerates
`tooltip.css.generated.js`, which the runtime injects.

## License

MIT © Sergey Yakunin
