import { readFileSync } from 'fs';
import { join } from 'path';

import { cx } from '../src/utils/cx';
import { cssTimeToMs } from '../src/Tooltip/hooks/useFlipAnimation';
import tooltipCss from '../src/Tooltip/tooltip.css.generated.js';
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
    ['src/Tooltip/tooltip.css', tooltipCss],
    ['src/TooltipAnchor/tooltipAnchor.css', anchorCss],
    ['src/TooltipBubble/tooltipBubble.css', bubbleCss],
  ])('%s.generated.js is up to date', (src, generated) => {
    const source = readFileSync(join(__dirname, '..', src), 'utf-8');
    expect(generated.content.trim()).toBe(build(source));
  });
});
