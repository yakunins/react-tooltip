/** @jest-environment jsdom */
import { act, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';

import { Tooltip, type TooltipProps } from '../src';
import {
  animations,
  dom,
  installDom,
  mockAnimate,
  isPopoverOpen,
  MockIntersectionObserver,
  uninstallDom,
} from './helpers/dom';

beforeEach(() => {
  installDom();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
  uninstallDom();
});

const advance = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

const popover = () => document.querySelector<HTMLElement>('[role="tooltip"]');
const anchor = () => document.querySelector<HTMLElement>('.tooltip-anchor')!;
const isOpen = () => isPopoverOpen(popover());

const renderTooltip = (props: Partial<TooltipProps> = {}) =>
  render(
    <Tooltip content="Tip" {...props}>
      {props.children ?? <span>anchor</span>}
    </Tooltip>
  );

describe('Tooltip rendering', () => {
  it('links the anchor to a manual popover with role tooltip', () => {
    renderTooltip({ className: 'mine' });
    const pop = popover()!;
    expect(pop.getAttribute('popover')).toBe('manual');
    expect(anchor().getAttribute('aria-describedby')).toBe(pop.id);
    expect(pop.className).toBe('tooltip placement-top arrow-center mine');
    expect(pop.querySelector('.tooltip-bubble')?.textContent).toBe('Tip');
  });

  it('passes placement and arrowPlacement to the popover and bubble', () => {
    renderTooltip({ placement: 'right', arrowPlacement: 'start' });
    expect(popover()!.className).toBe('tooltip placement-right arrow-start');
    expect(popover()!.querySelector('.placement-right.arrow-start')).not.toBe(
      null
    );
  });

  it('mirrors offset, radius and arrow size onto the popover', () => {
    renderTooltip({ offset: '4px', bubbleStyle: { radius: '2px' } });
    const style = popover()!.style;
    expect(style.getPropertyValue('--tooltip-offset')).toBe('4px');
    expect(style.getPropertyValue('--tooltip-radius')).toBe('2px');
    expect(style.getPropertyValue('--tooltip-arrow-size')).toBe('0.5rem');
  });

  it('makes the wrapper focusable only when needed for the focus trigger', () => {
    const { unmount } = renderTooltip();
    expect(anchor().tabIndex).toBe(0);
    unmount();

    renderTooltip({ children: <button>btn</button> });
    expect(anchor().hasAttribute('tabindex')).toBe(false);
  });

  it('does not make the wrapper focusable without the focus trigger', () => {
    renderTooltip({ triggers: ['hover'] });
    expect(anchor().hasAttribute('tabindex')).toBe(false);
  });

  it('opens on mount with defaultOpen', () => {
    renderTooltip({ defaultOpen: true });
    expect(isOpen()).toBe(true);
  });
});

describe('Tooltip hover trigger', () => {
  it('opens after showDelay', () => {
    renderTooltip();
    fireEvent.mouseEnter(anchor());
    advance(199);
    expect(isOpen()).toBe(false);
    advance(1);
    expect(isOpen()).toBe(true);
    expect(dom.showPopover).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending open when the pointer leaves first', () => {
    renderTooltip();
    fireEvent.mouseEnter(anchor());
    advance(100);
    fireEvent.mouseLeave(anchor());
    advance(2000);
    expect(isOpen()).toBe(false);
  });

  it('stays visible for minVisibleTime, then hides', () => {
    renderTooltip();
    fireEvent.mouseEnter(anchor());
    advance(200);
    fireEvent.mouseLeave(anchor());
    advance(999);
    expect(isOpen()).toBe(true);
    advance(1);
    expect(isOpen()).toBe(false);
  });

  it('hides after hideDelay once the minimum visible time has passed', () => {
    renderTooltip();
    fireEvent.mouseEnter(anchor());
    advance(200 + 5000);
    fireEvent.mouseLeave(anchor());
    advance(99);
    expect(isOpen()).toBe(true);
    advance(1);
    expect(isOpen()).toBe(false);
  });

  it('stays open while the pointer moves onto the bubble', () => {
    renderTooltip();
    fireEvent.mouseEnter(anchor());
    advance(5000);
    fireEvent.mouseLeave(anchor());
    fireEvent.mouseEnter(popover()!);
    advance(5000);
    expect(isOpen()).toBe(true);
  });

  it('honors partial timings', () => {
    renderTooltip({ timings: { showDelay: 0, hideDelay: undefined } });
    fireEvent.mouseEnter(anchor());
    advance(0);
    expect(isOpen()).toBe(true);
  });

  it('ignores mouse events synthesized from touch', () => {
    renderTooltip();
    const e = new MouseEvent('mouseenter');
    Object.defineProperty(e, 'sourceCapabilities', {
      value: { firesTouchEvents: true },
    });
    act(() => {
      anchor().dispatchEvent(e);
    });
    advance(1000);
    expect(isOpen()).toBe(false);
  });

  it('closes on Escape', () => {
    renderTooltip();
    fireEvent.mouseEnter(anchor());
    advance(200);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(isOpen()).toBe(false);
  });
});

describe('Tooltip focus trigger', () => {
  it('opens on focus and closes when focus leaves', () => {
    renderTooltip();
    fireEvent.focusIn(anchor());
    advance(200);
    expect(isOpen()).toBe(true);
    fireEvent.focusOut(anchor(), { relatedTarget: document.body });
    advance(1000);
    expect(isOpen()).toBe(false);
  });

  it('stays open while focus moves into the bubble', () => {
    renderTooltip({ content: <a href="#x">link</a> });
    fireEvent.focusIn(anchor());
    advance(200);
    fireEvent.focusOut(anchor(), {
      relatedTarget: popover()!.querySelector('a'),
    });
    advance(5000);
    expect(isOpen()).toBe(true);
  });

  it('holds open across a mouseleave while focused', () => {
    renderTooltip();
    fireEvent.mouseEnter(anchor());
    fireEvent.focusIn(anchor());
    advance(200);
    fireEvent.mouseLeave(anchor());
    advance(5000);
    expect(isOpen()).toBe(true);
  });

  it('stops keeping it open by focus on close, so a later hover-out still hides', () => {
    renderTooltip();
    fireEvent.focusIn(anchor());
    advance(200);
    fireEvent.keyDown(document, { key: 'Escape' }); // closes; anchor stays focused
    expect(isOpen()).toBe(false);

    fireEvent.mouseEnter(anchor());
    advance(200);
    expect(isOpen()).toBe(true);
    fireEvent.mouseLeave(anchor());
    advance(1000);
    expect(isOpen()).toBe(false);
  });
});

describe('Tooltip click trigger', () => {
  it('toggles immediately, without delays', () => {
    renderTooltip({ triggers: ['click'] });
    fireEvent.click(anchor());
    expect(isOpen()).toBe(true);
    fireEvent.click(anchor());
    expect(isOpen()).toBe(false);
  });

  it('is dismissed by a click anywhere else once pinned', () => {
    renderTooltip({ triggers: ['click'] });
    fireEvent.click(anchor());
    fireEvent.click(document.body);
    expect(isOpen()).toBe(false);
  });

  it('pins instead of closing right after a hover reveal', () => {
    renderTooltip({ triggers: ['hover', 'click'] });
    fireEvent.mouseEnter(anchor());
    advance(200);
    advance(100); // within clickGuard
    fireEvent.click(anchor());
    expect(isOpen()).toBe(true);
    fireEvent.mouseLeave(anchor());
    advance(5000);
    expect(isOpen()).toBe(true); // kept open: hover-out doesn't close it
  });

  it('closes on click after the guard window', () => {
    renderTooltip({ triggers: ['hover', 'click'] });
    fireEvent.mouseEnter(anchor());
    advance(200 + 1000);
    fireEvent.click(anchor());
    expect(isOpen()).toBe(false);
  });

  it('without the click trigger, an anchor click also dismisses defaultOpen', () => {
    renderTooltip({ defaultOpen: true, triggers: ['hover', 'focus'] });
    fireEvent.click(anchor());
    expect(isOpen()).toBe(false);
  });

  it('the opening click does not dismiss it', () => {
    renderTooltip({ triggers: ['click'] });
    fireEvent.click(anchor().firstChild as HTMLElement); // bubbles to document
    expect(isOpen()).toBe(true);
  });

  it('a defaultOpen tooltip is pinned: any click dismisses it', () => {
    renderTooltip({ defaultOpen: true });
    fireEvent.click(document.body);
    expect(isOpen()).toBe(false);
  });
});

describe('Tooltip controlled mode', () => {
  it('follows the open prop and only reports changes', () => {
    const onOpenChange = jest.fn();
    const { rerender } = render(
      <Tooltip content="Tip" open onOpenChange={onOpenChange}>
        x
      </Tooltip>
    );
    expect(isOpen()).toBe(true);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(isOpen()).toBe(true); // the parent hasn't changed `open`

    rerender(
      <Tooltip content="Tip" open={false} onOpenChange={onOpenChange}>
        x
      </Tooltip>
    );
    expect(isOpen()).toBe(false);
    expect(dom.hidePopover).toHaveBeenCalled();
  });
});

describe('Tooltip with an external anchor', () => {
  const makeTarget = () => {
    const el = document.createElement('button');
    el.setAttribute('aria-describedby', 'other');
    document.body.appendChild(el);
    return el;
  };

  it('wires anchor-name, aria-describedby and triggers onto anchorRef', () => {
    const el = makeTarget();
    const setProperty = jest.spyOn(el.style, 'setProperty');
    const removeProperty = jest.spyOn(el.style, 'removeProperty');
    const ref = { current: el };

    const { unmount } = render(<Tooltip content="Tip" anchorRef={ref} />);
    expect(document.querySelector('.tooltip-anchor')).toBeNull();
    const id = popover()!.id;
    expect(el.getAttribute('aria-describedby')).toBe(`other ${id}`);
    expect(setProperty).toHaveBeenCalledWith(
      'anchor-name',
      expect.stringMatching(/^--tooltip-/)
    );

    fireEvent.mouseEnter(el);
    advance(200);
    expect(isOpen()).toBe(true);

    unmount();
    expect(el.getAttribute('aria-describedby')).toBe('other');
    expect(removeProperty).toHaveBeenCalledWith('anchor-name');
    el.remove();
  });

  it('leaves anchor-name alone when anchorName is supplied', () => {
    const el = makeTarget();
    const setProperty = jest.spyOn(el.style, 'setProperty');
    render(
      <Tooltip content="Tip" anchorRef={{ current: el }} anchorName="--mine" />
    );
    expect(setProperty).not.toHaveBeenCalledWith(
      'anchor-name',
      expect.anything()
    );
    el.remove();
  });

  it('renders only the popover by anchorName, driven by open', () => {
    render(<Tooltip content="Tip" anchorName="--mine" open />);
    expect(document.querySelector('.tooltip-anchor')).toBeNull();
    expect(isOpen()).toBe(true);
  });
});

describe('Tooltip without CSS anchor positioning', () => {
  beforeEach(() => {
    dom.anchorPositioning = false;
  });

  it('also falls back without the Popover API', () => {
    dom.anchorPositioning = true;
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)
      .showPopover;
    const { container } = renderTooltip();
    expect(popover()).toBeNull();
    expect((container.firstChild as HTMLElement).title).toBe('Tip');
  });

  it('falls back to a native title in wrapping mode', () => {
    const { container } = renderTooltip();
    expect(popover()).toBeNull();
    const span = container.firstChild as HTMLElement;
    expect(span.tagName).toBe('SPAN');
    expect(span.title).toBe('Tip');
  });

  it('sets no title for non-string content', () => {
    const { container } = renderTooltip({ content: <b>rich</b> });
    expect((container.firstChild as HTMLElement).hasAttribute('title')).toBe(
      false
    );
  });

  it('mirrors string content onto anchorRef as title, then restores it', () => {
    const el = document.createElement('button');
    el.title = 'original';
    document.body.appendChild(el);
    const ref = createRef<HTMLElement>() as { current: HTMLElement };
    ref.current = el;

    const { container, unmount } = render(
      <Tooltip content="Tip" anchorRef={ref} />
    );
    expect(container.innerHTML).toBe('');
    expect(el.title).toBe('Tip');
    expect(el.hasAttribute('aria-describedby')).toBe(false);
    unmount();
    expect(el.title).toBe('original');
    el.remove();
  });

  it('renders nothing by anchorName', () => {
    const { container } = render(
      <Tooltip content="Tip" anchorName="--mine" open />
    );
    expect(container.innerHTML).toBe('');
  });
});

describe('Tooltip when the anchor is scrolled out of sight', () => {
  const intersect = (isIntersecting: boolean) =>
    act(() => {
      MockIntersectionObserver.watching(anchor())!.trigger([
        { isIntersecting },
      ]);
    });

  it('fades out while the anchor is clipped and back in when it returns', () => {
    renderTooltip({ open: true });
    intersect(false);
    expect(popover()!.classList.contains('anchor-hidden')).toBe(true);
    expect(isOpen()).toBe(true); // still open, just faded
    intersect(true);
    expect(popover()!.classList.contains('anchor-hidden')).toBe(false);
  });

  it('only watches the anchor while open, and forgets on close', () => {
    const { rerender } = renderTooltip({ open: false });
    expect(MockIntersectionObserver.watching(anchor())).toBeUndefined();

    rerender(
      <Tooltip content="Tip" open>
        <span>anchor</span>
      </Tooltip>
    );
    intersect(false);
    rerender(
      <Tooltip content="Tip" open={false}>
        <span>anchor</span>
      </Tooltip>
    );
    expect(MockIntersectionObserver.watching(anchor())).toBeUndefined();
    expect(popover()!.classList.contains('anchor-hidden')).toBe(false);
  });

  it('watches an external anchorRef element', () => {
    const el = document.body.appendChild(document.createElement('button'));
    render(<Tooltip content="Tip" anchorRef={{ current: el }} open />);
    act(() => {
      MockIntersectionObserver.watching(el)!.trigger([
        { isIntersecting: false },
      ]);
    });
    expect(popover()!.classList.contains('anchor-hidden')).toBe(true);
    el.remove();
  });
});

describe('Tooltip anchor element changes', () => {
  const button = () =>
    document.body.appendChild(document.createElement('button'));

  it('wires an anchorRef element that mounts after the tooltip', () => {
    const ref: { current: HTMLElement | null } = { current: null };
    const { rerender } = render(<Tooltip content="Tip" anchorRef={ref} />);
    const el = button();
    ref.current = el;
    rerender(<Tooltip content="Tip" anchorRef={ref} />);

    expect(el.getAttribute('aria-describedby')).toBe(popover()!.id);
    fireEvent.mouseEnter(el);
    advance(200);
    expect(isOpen()).toBe(true);
    el.remove();
  });

  it('moves everything to a swapped anchorRef element', () => {
    const a = button();
    const b = button();
    const ref: { current: HTMLElement | null } = { current: a };
    const { rerender } = render(<Tooltip content="Tip" anchorRef={ref} />);
    ref.current = b;
    rerender(<Tooltip content="Tip" anchorRef={ref} />);

    expect(a.hasAttribute('aria-describedby')).toBe(false);
    expect(b.getAttribute('aria-describedby')).toBe(popover()!.id);
    fireEvent.mouseEnter(a);
    advance(1000);
    expect(isOpen()).toBe(false);
    fireEvent.mouseEnter(b);
    advance(200);
    expect(isOpen()).toBe(true);
    a.remove();
    b.remove();
  });
});

describe('Tooltip Escape handling', () => {
  const pops = () =>
    Array.from(document.querySelectorAll<HTMLElement>('[role="tooltip"]'));

  it('closes only the most recently opened tooltip per press', () => {
    render(
      <>
        <Tooltip content="A" defaultOpen>
          a
        </Tooltip>
        <Tooltip content="B" defaultOpen>
          b
        </Tooltip>
      </>
    );
    const [a, b] = pops();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect([isPopoverOpen(a), isPopoverOpen(b)]).toEqual([true, false]);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect([isPopoverOpen(a), isPopoverOpen(b)]).toEqual([false, false]);
  });

  it('keeps the Escape that closes it from other handlers (e.g. a dialog)', () => {
    const dialogEscape = jest.fn();
    document.addEventListener('keydown', dialogEscape);
    renderTooltip({ defaultOpen: true });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(isOpen()).toBe(false);
    expect(dialogEscape).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Escape' }); // nothing open now
    expect(dialogEscape).toHaveBeenCalledTimes(1);
    document.removeEventListener('keydown', dialogEscape);
  });
});

describe('Tooltip lazy content', () => {
  it('renders rich content from the first open on, and keeps it', () => {
    renderTooltip({ content: <b>rich</b>, triggers: ['click'] });
    expect(popover()!.querySelector('b')).toBeNull();
    fireEvent.click(anchor());
    expect(popover()!.querySelector('b')).not.toBeNull();
    fireEvent.click(anchor());
    expect(isOpen()).toBe(false);
    expect(popover()!.querySelector('b')).not.toBeNull();
  });

  it('always renders plain-text content (the aria description)', () => {
    renderTooltip();
    expect(popover()!.textContent).toBe('Tip');
  });
});

describe('Tooltip fades (Web Animations)', () => {
  beforeEach(() => {
    dom.animate.mockImplementation(mockAnimate);
  });
  const fades = () => animations.filter(a => 'opacity' in a.keyframes[0]);
  const slides = () => animations.filter(a => 'transform' in a.keyframes[0]);
  const lastFade = () => fades()[fades().length - 1];
  const opacity = (value: string) => {
    popover()!.style.opacity = value; // the current (mid-fade) opacity
  };
  const tip = (props: Partial<TooltipProps>) => (
    <Tooltip content="Tip" {...props}>
      <span>anchor</span>
    </Tooltip>
  );
  const flip = () => {
    const { rerender } = render(tip({ open: true, placement: 'top' }));
    rerender(tip({ open: true, placement: 'bottom' }));
    return rerender;
  };

  it('uses animationDuration for the fade and twice it for the slide', () => {
    const { rerender } = render(
      tip({ open: true, placement: 'top', animationDuration: '300ms' })
    );
    expect(fades()[0].options?.duration).toBe(300);
    rerender(
      tip({ open: true, placement: 'bottom', animationDuration: '300ms' })
    );
    expect(slides()[0].options?.duration).toBe(600);
  });

  it('fades in on open', () => {
    renderTooltip({ defaultOpen: true });
    expect(lastFade().keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
  });

  it('keeps the popover shown until the fade-out finishes', async () => {
    renderTooltip({ defaultOpen: true });
    opacity('1');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(fades()[0].playState).toBe('idle'); // fade-in stopped
    expect(lastFade().keyframes).toEqual([{ opacity: 1 }, { opacity: 0 }]);
    expect(isOpen()).toBe(true);
    await act(() => Promise.resolve(lastFade().finish()));
    expect(isOpen()).toBe(false);
  });

  it('reopening mid-fade stops the fade-out and stays shown', async () => {
    const { rerender } = render(tip({ open: true }));
    opacity('0.5');
    rerender(tip({ open: false }));
    const fadeOut = lastFade();
    rerender(tip({ open: true }));
    expect(fadeOut.playState).toBe('idle');
    expect(lastFade().keyframes).toEqual([{ opacity: 0.5 }, { opacity: 1 }]);
    await act(() => Promise.resolve());
    expect(isOpen()).toBe(true);
  });

  it('a flip fades in from 0 and slides', () => {
    flip();
    expect(fades()).toHaveLength(2); // the open fade, then the flip's own
    expect(fades()[0].playState).toBe('idle');
    expect(lastFade().keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(slides()).toHaveLength(1);
  });

  it('anchor scrolling out mid-flip stops the fade only; the slide runs on', () => {
    flip();
    const flipFade = lastFade();
    opacity('0.6');
    act(() => {
      MockIntersectionObserver.watching(anchor())!.trigger([
        { isIntersecting: false },
      ]);
    });
    expect(flipFade.playState).toBe('idle');
    expect(lastFade().keyframes).toEqual([{ opacity: 0.6 }, { opacity: 0 }]);
    expect(lastFade().options?.duration).toBeCloseTo(120); // 0.6 of 200ms
    expect(slides()[0].playState).toBe('running');
    expect(isOpen()).toBe(true); // a hidden anchor fades, it doesn't close
  });

  it('closing mid-flip fades out from the current opacity, then hides', async () => {
    const rerender = flip();
    opacity('0.6');
    rerender(tip({ open: false, placement: 'bottom' }));
    expect(lastFade().keyframes).toEqual([{ opacity: 0.6 }, { opacity: 0 }]);
    expect(slides()[0].playState).toBe('running');
    expect(isOpen()).toBe(true);
    await act(() => Promise.resolve(lastFade().finish()));
    expect(isOpen()).toBe(false);
  });
});

describe('Tooltip with optional features missing', () => {
  it('without Web Animations: still styled, shows and hides instantly', () => {
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)
      .animate;
    renderTooltip({ triggers: ['click'] });
    expect(popover()).not.toBeNull(); // no title fallback
    fireEvent.click(anchor());
    expect(isOpen()).toBe(true);
    expect(popover()!.style.opacity).toBe('1');
    fireEvent.click(anchor());
    expect(isOpen()).toBe(false); // hidden right away, no fade to wait for
  });

  it('without IntersectionObserver: still styled, no flip or hidden-anchor fade', () => {
    delete (globalThis as Record<string, unknown>).IntersectionObserver;
    MockIntersectionObserver.instances = [];
    renderTooltip({ defaultOpen: true, placement: 'top' });
    expect(popover()).not.toBeNull();
    expect(isOpen()).toBe(true);
    expect(popover()!.className).toContain('placement-top');
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });
});
