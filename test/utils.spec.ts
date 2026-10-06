import { readFileSync } from 'fs';
import { join } from 'path';

import { cx } from '../src/utils/cx';
import { addToken, setAttribute, setStyle } from '../src/utils/dom';
import { withDefaults } from '../src/utils/withDefaults';
import { cssTimeToMs } from '../src/utils/cssTime';
import popoverCss from '../src/TooltipPopover/tooltipPopover.css.generated.js';
import anchorCss from '../src/TooltipAnchor/tooltipAnchor.css.generated.js';
import bubbleCss from '../src/TooltipBubble/tooltipBubble.css.generated.js';

// css-to-js.js is a plain CommonJS build script
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { stripCssComments, minifyCss } = require('../css-to-js.js') as {
  stripCssComments: (css: string) => string;
  minifyCss: (css: string) => string;
};

describe('cx', () => {
  it('joins the truthy parts with a space', () => {
    expect(cx('a', undefined, 'b', false, null, '', 'c')).toBe('a b c');
  });

  it('returns an empty string when nothing is truthy', () => {
    expect(cx(undefined, false)).toBe('');
  });
});

describe('DOM restore helpers', () => {
  // A minimal Element stand-in: these tests run in the node environment.
  const fakeElement = (attrs: Record<string, string> = {}) => {
    const map = new Map(Object.entries(attrs));
    const style = new Map<string, string>();
    return {
      getAttribute: (n: string) => map.get(n) ?? null,
      setAttribute: (n: string, v: string) => void map.set(n, v),
      removeAttribute: (n: string) => void map.delete(n),
      style: {
        getPropertyValue: (p: string) => style.get(p) ?? '',
        setProperty: (p: string, v: string) => void style.set(p, v),
        removeProperty: (p: string) => void style.delete(p),
      },
      attrs: map,
      styles: style,
    };
  };
  type Fake = ReturnType<typeof fakeElement>;
  const asEl = (f: Fake) => f as unknown as HTMLElement;

  it('setAttribute restores a previous value, or removes it', () => {
    const withTitle = fakeElement({ title: 'old' });
    const restore = setAttribute(asEl(withTitle), 'title', 'new');
    expect(withTitle.attrs.get('title')).toBe('new');
    restore();
    expect(withTitle.attrs.get('title')).toBe('old');

    const bare = fakeElement();
    setAttribute(asEl(bare), 'title', 'new')();
    expect(bare.attrs.has('title')).toBe(false);
  });

  it('setStyle restores a previous value, or removes it', () => {
    const el = fakeElement();
    const restore = setStyle(asEl(el), 'anchor-name', '--a');
    expect(el.styles.get('anchor-name')).toBe('--a');
    restore();
    expect(el.styles.has('anchor-name')).toBe(false);
  });

  it('addToken adds once and removes only its own token', () => {
    const el = fakeElement({ 'aria-describedby': 'other' });
    const remove = addToken(asEl(el), 'aria-describedby', 'tip');
    addToken(asEl(el), 'aria-describedby', 'tip'); // no duplicate
    expect(el.attrs.get('aria-describedby')).toBe('other tip');
    el.attrs.set('aria-describedby', 'other tip later'); // another writer
    remove();
    expect(el.attrs.get('aria-describedby')).toBe('other later');
  });

  it('addToken removes the attribute once empty', () => {
    const el = fakeElement();
    addToken(asEl(el), 'aria-describedby', 'tip')();
    expect(el.attrs.has('aria-describedby')).toBe(false);
  });
});

describe('withDefaults', () => {
  const defaults = { a: 1, b: 'x' };

  it('layers the overrides over the defaults', () => {
    expect(withDefaults(defaults, { b: 'y' })).toEqual({ a: 1, b: 'y' });
  });

  it('keeps the default for an explicit undefined', () => {
    expect(withDefaults(defaults, { a: undefined })).toEqual(defaults);
  });

  it('returns the defaults without overrides', () => {
    expect(withDefaults(defaults)).toEqual(defaults);
  });
});

describe('cssTimeToMs', () => {
  it.each([
    ['0.48s', 480],
    ['160ms', 160],
    [' 2s ', 2000],
    ['250', 250],
  ])('parses %p as %p ms', (input, ms) => {
    expect(cssTimeToMs(input)).toBe(ms);
  });

  it('returns NaN for an unresolved expression', () => {
    expect(cssTimeToMs('calc(var(--t) * 2)')).toBeNaN();
  });
});

describe('css-to-js', () => {
  const build = (css: string) => minifyCss(stripCssComments(css));

  it('drops comments, including ones containing backticks', () => {
    expect(build('/* `x` */\n.a {\n  color: red; /* note */\n}\n')).toBe(
      '.a{\ncolor:red;\n}'
    );
  });

  it('drops indentation but keeps one declaration per line', () => {
    expect(build('.a {\n    --x: 1px;\n    --y: 2px;\n}')).toBe(
      '.a{\n--x:1px;\n--y:2px;\n}'
    );
  });

  it('keeps the spaces calc() operators need', () => {
    expect(build('.a { --x: calc(100% - var(--r)  +  1px); }')).toBe(
      '.a{--x:calc(100% - var(--r) + 1px);}'
    );
  });

  it('keeps the descendant combinator', () => {
    expect(build('.tooltip .tooltip-bubble { color: red; }')).toBe(
      '.tooltip .tooltip-bubble{color:red;}'
    );
  });

  it('normalizes CRLF line endings', () => {
    expect(build('.a {\r\n  color: red;\r\n}\r\n')).toBe('.a{\ncolor:red;\n}');
  });

  it('drops spaces after commas in selector lists and values', () => {
    expect(build('.a,\n.b { --p: 1px 2px, 3px 4px; }')).toBe(
      '.a,\n.b{--p:1px 2px,3px 4px;}'
    );
  });

  // Guards against editing a .css file without re-running `npm run css-to-js`.
  it.each([
    ['src/TooltipPopover/tooltipPopover.css', popoverCss],
    ['src/TooltipAnchor/tooltipAnchor.css', anchorCss],
    ['src/TooltipBubble/tooltipBubble.css', bubbleCss],
  ])('%s.generated.js is up to date', (src, generated) => {
    const source = readFileSync(join(__dirname, '..', src), 'utf-8');
    expect(generated.content.trim()).toBe(build(source));
  });
});
