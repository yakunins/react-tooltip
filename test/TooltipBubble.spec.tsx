/** @jest-environment jsdom */
import { render } from '@testing-library/react';
import { createRef } from 'react';

import {
  DEFAULT_BUBBLE_STYLE,
  TooltipAnchor,
  TooltipBubble,
  TooltipPopover,
  type TooltipBubbleStyle,
} from '../src';

afterEach(() => {
  document.head.innerHTML = '';
});

const bubbleOf = (container: HTMLElement) =>
  container.querySelector('.tooltip-bubble') as HTMLElement;

describe('TooltipBubble', () => {
  it('renders the defaults as data attributes', () => {
    const { container } = render(<TooltipBubble>hi</TooltipBubble>);
    const el = bubbleOf(container);
    expect(el.className).toBe('tooltip-bubble');
    expect(el.dataset).toMatchObject({
      placement: 'top',
      arrow: 'center',
      corners: '5',
    });
  });

  it('reflects placement, arrowPlacement and className', () => {
    const { container } = render(
      <TooltipBubble placement="left" arrowPlacement="end" className="mine">
        hi
      </TooltipBubble>
    );
    const el = bubbleOf(container);
    expect(el.className).toBe('tooltip-bubble mine');
    expect(el.dataset).toMatchObject({ placement: 'left', arrow: 'end' });
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
    [3, '3'],
    [7, '7'],
    [4, '5'], // unsupported -> default
  ])('cornerSegments %p -> data-corners %s', (n, corners) => {
    const { container } = render(
      <TooltipBubble
        bubbleStyle={{ cornerSegments: n } as unknown as TooltipBubbleStyle}
      >
        hi
      </TooltipBubble>
    );
    expect(bubbleOf(container).dataset.corners).toBe(corners);
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
    expect(css()).toContain(".tooltip-bubble[data-corners='7']{");
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

describe('TooltipPopover', () => {
  it('renders a manual popover with role tooltip and placement classes', () => {
    const { getByRole } = render(
      <TooltipPopover
        id="p"
        placement="left"
        arrowPlacement="end"
        className="x"
      >
        hi
      </TooltipPopover>
    );
    const el = getByRole('tooltip', { hidden: true });
    expect(el.getAttribute('popover')).toBe('manual');
    expect(el.id).toBe('p');
    expect(el.className).toBe('tooltip-popover x');
    expect(el.dataset.placement).toBe('left');
    expect(el.dataset.arrow).toBe('end');
  });

  it('marks a hidden anchor', () => {
    const { getByRole } = render(
      <TooltipPopover placement="top" anchorHidden>
        hi
      </TooltipPopover>
    );
    expect(
      getByRole('tooltip', { hidden: true }).hasAttribute('data-anchor-hidden')
    ).toBe(true);
  });

  it('forwards the ref and injects its stylesheet', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <TooltipPopover ref={ref} placement="top">
        hi
      </TooltipPopover>
    );
    expect(ref.current?.getAttribute('role')).toBe('tooltip');
    expect(document.head.textContent).toContain('.tooltip-popover{');
  });
});
