/** @jest-environment jsdom */
import { render } from '@testing-library/react';
import { createRef } from 'react';

import {
  DEFAULT_BUBBLE_STYLE,
  TooltipAnchor,
  TooltipBubble,
  type TooltipBubbleStyle,
} from '../src';

afterEach(() => {
  document.head.innerHTML = '';
});

const bubbleOf = (container: HTMLElement) =>
  container.querySelector('.tooltip-bubble') as HTMLElement;

describe('TooltipBubble', () => {
  it('renders the default classes', () => {
    const { container } = render(<TooltipBubble>hi</TooltipBubble>);
    expect(bubbleOf(container).className).toBe(
      'tooltip-bubble placement-top arrow-center corners-5'
    );
  });

  it('reflects placement, arrowPlacement and className', () => {
    const { container } = render(
      <TooltipBubble placement="left" arrowPlacement="end" className="mine">
        hi
      </TooltipBubble>
    );
    expect(bubbleOf(container).className).toBe(
      'tooltip-bubble placement-left arrow-end corners-5 mine'
    );
  });

  it('applies every default as a --tooltip-* property', () => {
    const { container } = render(<TooltipBubble>hi</TooltipBubble>);
    const style = bubbleOf(container).style;
    expect(style.getPropertyValue('--tooltip-background')).toBe(
      DEFAULT_BUBBLE_STYLE.background
    );
    expect(style.getPropertyValue('--tooltip-radius')).toBe(
      DEFAULT_BUBBLE_STYLE.radius
    );
    expect(style.getPropertyValue('--tooltip-max-width')).toBe(
      DEFAULT_BUBBLE_STYLE.maxWidth
    );
  });

  it('layers bubbleStyle over the defaults, ignoring explicit undefined', () => {
    const { container } = render(
      <TooltipBubble
        bubbleStyle={{ background: 'tomato', color: undefined, radius: '0' }}
      >
        hi
      </TooltipBubble>
    );
    const style = bubbleOf(container).style;
    expect(style.getPropertyValue('--tooltip-background')).toBe('tomato');
    expect(style.getPropertyValue('--tooltip-color')).toBe(
      DEFAULT_BUBBLE_STYLE.color
    );
    expect(style.getPropertyValue('--tooltip-radius')).toBe('0');
  });

  it('lets an inline style override the variables', () => {
    const { container } = render(
      <TooltipBubble
        style={{ ['--tooltip-background' as string]: 'navy', margin: 4 }}
      >
        hi
      </TooltipBubble>
    );
    const style = bubbleOf(container).style;
    expect(style.getPropertyValue('--tooltip-background')).toBe('navy');
    expect(style.margin).toBe('4px');
  });

  it.each([
    [3, 'corners-3'],
    [7, 'corners-7'],
    [4, 'corners-5'], // unsupported -> default
  ])('cornerSegments %p -> %s', (n, cls) => {
    const { container } = render(
      <TooltipBubble
        bubbleStyle={{ cornerSegments: n } as unknown as TooltipBubbleStyle}
      >
        hi
      </TooltipBubble>
    );
    expect(bubbleOf(container).classList.contains(cls)).toBe(true);
  });

  it('passes other props through', () => {
    const { getByRole } = render(
      <TooltipBubble role="note" aria-label="info">
        hi
      </TooltipBubble>
    );
    expect(getByRole('note').getAttribute('aria-label')).toBe('info');
  });

  it('injects its stylesheet while mounted', () => {
    const { unmount } = render(<TooltipBubble>hi</TooltipBubble>);
    const css = () => document.head.textContent ?? '';
    expect(css()).toContain('.tooltip-bubble{');
    expect(css()).toContain('.tooltip-bubble.corners-7{');
    unmount();
    expect(css()).toBe('');
  });
});

describe('TooltipAnchor', () => {
  it('forwards the ref to its wrapper and merges className', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <TooltipAnchor ref={ref} anchorName="--a" className="x" id="anchor">
        <button>go</button>
      </TooltipAnchor>
    );
    expect(ref.current).toBe(container.firstChild);
    expect(ref.current?.className).toBe('tooltip-anchor x');
    expect(ref.current?.id).toBe('anchor');
    expect(ref.current?.querySelector('button')).not.toBeNull();
  });

  it('injects its stylesheet', () => {
    render(<TooltipAnchor anchorName="--a">x</TooltipAnchor>);
    expect(document.head.textContent).toContain('.tooltip-anchor');
  });
});
