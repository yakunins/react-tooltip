/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';

import type { Placement } from '../src';
import { useFlipPlacement } from '../src/hooks/useFlipPlacement';
import { useControllableOpen } from '../src/hooks/useControllableOpen';
import { useTooltipAnimations } from '../src/hooks/useTooltipAnimations';
import { useEscape } from '../src/hooks/useEscape';
import { useOutsideClick } from '../src/hooks/useOutsideClick';
import {
  detectSupport,
  useSupports,
  type Support,
} from '../src/hooks/useSupports';
import { usePopover } from '../src/hooks/usePopover';
import {
  animations,
  dom,
  installDom,
  mockAnimate,
  isPopoverOpen,
  MockIntersectionObserver,
  setRect,
  setViewport,
  uninstallDom,
} from './helpers/dom';

beforeEach(() => {
  installDom();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
  uninstallDom();
  document.body.innerHTML = '';
});

const element = () => document.body.appendChild(document.createElement('div'));

describe('useControllableOpen', () => {
  it('owns the state when uncontrolled', () => {
    const onOpenChange = jest.fn();
    const { result } = renderHook(() =>
      useControllableOpen(undefined, false, onOpenChange)
    );
    expect(result.current.isControlled).toBe(false);

    act(() => result.current.setOpen(true));
    expect(result.current.isOpen).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    act(() => result.current.setOpen(true)); // no-op
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('seeds from defaultOpen', () => {
    const { result } = renderHook(() => useControllableOpen(undefined, true));
    expect(result.current.isOpen).toBe(true);
  });

  it('only reports changes when controlled', () => {
    const onOpenChange = jest.fn();
    const { result } = renderHook(() =>
      useControllableOpen(false, true, onOpenChange)
    );
    expect(result.current.isControlled).toBe(true);
    expect(result.current.isOpen).toBe(false); // defaultOpen ignored

    act(() => result.current.setOpen(true));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(result.current.isOpen).toBe(false);
  });
});

describe('useEscape', () => {
  const escape = () => {
    const e = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    act(() => {
      document.dispatchEvent(e);
    });
    return e;
  };
  const layer = (topmostOnly?: boolean, enabled = true) => {
    const onEscape = jest.fn();
    const hook = renderHook(({ on }) => useEscape(on, onEscape, topmostOnly), {
      initialProps: { on: enabled },
    });
    return { ...hook, onEscape };
  };

  it('calls only the most recent layer by default, and stops the key', () => {
    const outer = jest.fn();
    document.addEventListener('keydown', outer);
    const first = layer();
    const second = layer();
    escape();
    expect(second.onEscape).toHaveBeenCalledTimes(1);
    expect(first.onEscape).not.toHaveBeenCalled();
    expect(outer).not.toHaveBeenCalled();
    document.removeEventListener('keydown', outer);
  });

  it('passes Escape to the next layer once the top one is gone', () => {
    const first = layer();
    const second = layer();
    second.unmount();
    escape();
    expect(first.onEscape).toHaveBeenCalledTimes(1);
  });

  it('with topmostOnly false, always calls it and lets the key through', () => {
    const outer = jest.fn();
    document.addEventListener('keydown', outer);
    const any = layer(false);
    const e = escape();
    expect(any.onEscape).toHaveBeenCalledTimes(1);
    expect(outer).toHaveBeenCalledTimes(1);
    expect(e.defaultPrevented).toBe(false);
    document.removeEventListener('keydown', outer);
  });

  it('calls topmostOnly false layers alongside the topmost one', () => {
    const any = layer(false);
    const first = layer();
    const second = layer();
    escape();
    expect(any.onEscape).toHaveBeenCalledTimes(1);
    expect(second.onEscape).toHaveBeenCalledTimes(1);
    expect(first.onEscape).not.toHaveBeenCalled();
  });

  it('ignores other keys and disabled layers', () => {
    const off = layer(true, false);
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      );
    });
    escape();
    expect(off.onEscape).not.toHaveBeenCalled();
  });

  it('holds one window listener while any layer is enabled', () => {
    const add = jest.spyOn(window, 'addEventListener');
    const remove = jest.spyOn(window, 'removeEventListener');
    const a = layer();
    const b = layer();
    expect(add.mock.calls.filter(([t]) => t === 'keydown')).toHaveLength(1);
    a.unmount();
    b.unmount();
    expect(remove.mock.calls.filter(([t]) => t === 'keydown')).toHaveLength(1);
    add.mockRestore();
    remove.mockRestore();
  });
});

describe('useOutsideClick', () => {
  const setup = (enabled: boolean) => {
    const inside = element();
    const child = inside.appendChild(document.createElement('span'));
    const outside = element();
    const onOutside = jest.fn();
    const hook = renderHook(
      ({ on }) => useOutsideClick([inside], onOutside, on),
      { initialProps: { on: enabled } }
    );
    return { ...hook, child, outside, onOutside };
  };

  it('reports clicks outside the given elements', () => {
    const { outside, onOutside } = setup(true);
    outside.click();
    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  // Covers the opening click: in a browser the listener can already be attached
  // when the anchor click reaches the document.
  it('ignores clicks inside them, including descendants', () => {
    const { child, onOutside } = setup(true);
    child.click();
    expect(onOutside).not.toHaveBeenCalled();
  });

  it('listens only while enabled', () => {
    const { outside, onOutside, rerender } = setup(false);
    outside.click();
    rerender({ on: true });
    rerender({ on: false });
    outside.click();
    expect(onOutside).not.toHaveBeenCalled();
  });
});

describe('usePopover', () => {
  it('shows on open and leaves hiding to the returned hide()', () => {
    const ref = { current: element() };
    const { result, rerender } = renderHook(
      ({ open }) => usePopover(ref, open),
      { initialProps: { open: true } }
    );
    expect(isPopoverOpen(ref.current)).toBe(true);
    rerender({ open: true });
    expect(dom.showPopover).toHaveBeenCalledTimes(1);
    rerender({ open: false });
    expect(isPopoverOpen(ref.current)).toBe(true); // waits for the caller
    result.current();
    expect(isPopoverOpen(ref.current)).toBe(false);
  });

  it('swallows errors from the Popover API', () => {
    dom.showPopover.mockImplementation(() => {
      throw new Error('InvalidStateError');
    });
    const ref = { current: element() };
    expect(() => renderHook(() => usePopover(ref, true))).not.toThrow();
  });
});

describe('useFlipPlacement', () => {
  type Props = {
    placement?: Placement;
    enabled?: boolean;
    isOpen?: boolean;
    anchorPositioning?: boolean;
    keptOpen?: boolean;
    isControlled?: boolean;
  };

  const setup = (initial: Props = {}) => {
    // The fake clock starts at 0, which the throttle reads as "just evaluated".
    jest.advanceTimersByTime(1000);
    setViewport(800, 600);
    const anchor = element();
    const pop = element();
    const keptOpenRef = { current: false };
    const hook = renderHook(
      ({
        placement = 'top',
        enabled = true,
        isOpen = true,
        anchorPositioning = true,
        keptOpen = true,
        isControlled = false,
      }: Props) => {
        keptOpenRef.current = keptOpen;
        return useFlipPlacement({
          anchor,
          popoverRef: { current: pop },
          placement,
          enabled,
          isOpen,
          anchorPositioning,
          keptOpenRef,
          isControlled,
        });
      },
      { initialProps: initial }
    );
    const observer = () =>
      MockIntersectionObserver.instances[
        MockIntersectionObserver.instances.length - 1
      ];
    const fire = () => act(() => observer().trigger());
    return { ...hook, anchor, pop, observer, fire };
  };

  // Anchor near the top of the viewport: no room above for a 40px bubble.
  const nearTop = (anchor: Element, pop: Element) => {
    setRect(anchor, { top: 5, left: 100, width: 50, height: 20 });
    setRect(pop, { top: 0, left: 100, width: 80, height: 40 });
  };

  it('observes the popover while open', () => {
    const { observer, pop } = setup();
    expect(observer().observed).toEqual([pop]);
    expect(observer().options?.rootMargin).toBe('-10px');
  });

  it('flips to the opposite side when there is no room', () => {
    const { result, anchor, pop, fire } = setup();
    nearTop(anchor, pop);
    fire();
    expect(result.current).toBe('bottom');
  });

  it('never flips a tooltip shown purely by hover', () => {
    const { result, anchor, pop, fire } = setup({ keptOpen: false });
    nearTop(anchor, pop);
    fire();
    expect(result.current).toBe('top');
  });

  it('always flips a controlled tooltip', () => {
    const { result, anchor, pop, fire } = setup({
      keptOpen: false,
      isControlled: true,
    });
    nearTop(anchor, pop);
    fire();
    expect(result.current).toBe('bottom');
  });

  it('stays on the flipped side once room returns (sticky)', () => {
    const { result, anchor, pop, fire } = setup();
    nearTop(anchor, pop);
    fire();
    setRect(anchor, { top: 300, left: 100, width: 50, height: 20 });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    fire();
    expect(result.current).toBe('bottom');
  });

  it('throttles re-evaluation to one per 500ms (trailing call kept)', () => {
    const { result, anchor, pop, fire } = setup();
    setRect(anchor, { top: 300, left: 100, width: 50, height: 20 });
    setRect(pop, { top: 0, left: 100, width: 80, height: 40 });
    fire(); // leading: stays top
    nearTop(anchor, pop);
    fire(); // within the window: deferred
    expect(result.current).toBe('top');
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('bottom');
  });

  it('picks the side with more room when neither fits', () => {
    const { result, anchor, pop, fire } = setup();
    setViewport(800, 60);
    setRect(pop, { top: 0, left: 100, width: 80, height: 40 });
    setRect(anchor, { top: 10, left: 100, width: 50, height: 20 });
    fire(); // 10px above vs 30px below
    expect(result.current).toBe('bottom');
  });

  it('keeps the current side on a tie when neither fits', () => {
    const { result, anchor, pop, fire } = setup();
    setViewport(800, 60);
    setRect(pop, { top: 0, left: 100, width: 80, height: 40 });
    setRect(anchor, { top: 20, left: 100, width: 50, height: 20 });
    fire(); // 20px above vs 20px below
    expect(result.current).toBe('top');
  });

  it('skips a popover that is not laid out yet', () => {
    const { result, anchor, pop, fire } = setup();
    setRect(anchor, { top: 5, left: 100, width: 50, height: 20 });
    setRect(pop, { top: 0, left: 0, width: 0, height: 0 });
    fire();
    expect(result.current).toBe('top');
  });

  it('resets to the preferred side after closing', () => {
    const { result, anchor, pop, fire, rerender } = setup();
    nearTop(anchor, pop);
    fire();
    rerender({ isOpen: false }); // popover already hidden -> immediate
    expect(result.current).toBe('top');
  });

  it('waits for the fade-out before resetting', () => {
    const { result, anchor, pop, fire, rerender } = setup();
    nearTop(anchor, pop);
    fire();
    pop.showPopover(); // closed, but still shown while it fades out
    rerender({ isOpen: false });
    expect(result.current).toBe('bottom');

    const toggle = new Event('toggle');
    Object.defineProperty(toggle, 'newState', { value: 'closed' });
    act(() => {
      pop.dispatchEvent(toggle);
    });
    expect(result.current).toBe('top');
  });

  it('resets after a timeout if toggle never fires', () => {
    const { result, anchor, pop, fire, rerender } = setup();
    nearTop(anchor, pop);
    fire();
    pop.showPopover();
    rerender({ isOpen: false });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current).toBe('top');
  });

  it('follows a placement prop change immediately', () => {
    const { result, rerender } = setup();
    rerender({ placement: 'left' });
    expect(result.current).toBe('left');
  });

  it('returns the placement as-is when disabled', () => {
    const { result, rerender } = setup({ enabled: false });
    expect(MockIntersectionObserver.instances).toHaveLength(0);
    rerender({ enabled: false, placement: 'right' });
    expect(result.current).toBe('right');
  });

  it('does not observe while closed or without anchor positioning', () => {
    setup({ isOpen: false });
    setup({ anchorPositioning: false });
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('disconnects on close', () => {
    const { observer, rerender } = setup();
    const io = observer();
    rerender({ isOpen: false });
    expect(io.disconnected).toBe(true);
  });
});

describe('useFlipPlacement inside a scroll container', () => {
  // A 300x200 scrolling box at (100, 200) in an 800x600 viewport.
  const makeContainer = () => {
    const box = element();
    // jsdom doesn't expand the `overflow` shorthand into overflowX / overflowY
    box.style.overflowY = 'auto';
    setRect(box, { top: 200, left: 100, width: 300, height: 200 });
    Object.defineProperty(box, 'clientWidth', { value: 300 });
    Object.defineProperty(box, 'clientHeight', { value: 200 });
    return box;
  };

  const setupIn = (
    box: HTMLElement,
    { placement = 'top' as Placement, width = 80, height = 40 } = {}
  ) => {
    jest.advanceTimersByTime(1000);
    setViewport(800, 600);
    const anchor = box.appendChild(document.createElement('span'));
    const pop = element();
    setRect(pop, { top: 0, left: 0, width, height });
    const hook = renderHook(() =>
      useFlipPlacement({
        anchor,
        popoverRef: { current: pop },
        placement,
        enabled: true,
        isOpen: true,
        anchorPositioning: true,
        isControlled: true,
      })
    );
    act(() => {
      jest.advanceTimersByTime(20); // the setup frame
    });
    return { ...hook, anchor, pop };
  };

  it('watches the anchor against the container, inset by the bubble height', () => {
    const box = makeContainer();
    const { anchor } = setupIn(box);
    const io = MockIntersectionObserver.watching(anchor)!;
    expect(io.options?.root).toBe(box);
    expect(io.options?.rootMargin).toBe('-50px 0px');
  });

  it('insets only the side edges for left / right placements', () => {
    const { anchor } = setupIn(makeContainer(), { placement: 'left' });
    expect(MockIntersectionObserver.watching(anchor)!.options?.rootMargin).toBe(
      '0px -90px'
    );
  });

  // Regression: a wide bubble once collapsed the observer root to nothing.
  it('ignores a wide bubble for vertical placements', () => {
    const box = makeContainer(); // 300px wide
    const { result, anchor } = setupIn(box, { width: 215 });
    expect(MockIntersectionObserver.watching(anchor)!.options?.rootMargin).toBe(
      '-50px 0px'
    );
    setRect(anchor, { top: 210, left: 200, width: 50, height: 20 });
    act(() => MockIntersectionObserver.watching(anchor)!.trigger());
    expect(result.current).toBe('bottom');
  });

  it('caps the inset below half the container', () => {
    const { anchor } = setupIn(makeContainer(), { height: 150 }); // 200px tall box
    expect(MockIntersectionObserver.watching(anchor)!.options?.rootMargin).toBe(
      '-99px 0px'
    );
  });

  it('flips when the anchor nears the container edge, not the viewport', () => {
    const box = makeContainer();
    const { result, anchor } = setupIn(box);
    // room above in the viewport, but not in the box
    setRect(anchor, { top: 210, left: 200, width: 50, height: 20 });
    act(() => MockIntersectionObserver.watching(anchor)!.trigger());
    expect(result.current).toBe('bottom');
  });

  it('keeps the side while the anchor has room in the container', () => {
    const box = makeContainer();
    const { result, anchor } = setupIn(box);
    setRect(anchor, { top: 300, left: 200, width: 50, height: 20 });
    act(() => MockIntersectionObserver.watching(anchor)!.trigger());
    expect(result.current).toBe('top');
  });

  it('adds no anchor observer when the anchor scrolls with the page', () => {
    const { anchor } = setupIn(document.body);
    expect(MockIntersectionObserver.watching(anchor)).toBeUndefined();
  });
});

describe('useTooltipAnimations', () => {
  beforeEach(() => {
    dom.animate.mockImplementation(mockAnimate);
  });

  const setup = (durationMs = 200, animate = true) => {
    const el = element();
    const { result } = renderHook(() =>
      useTooltipAnimations({ current: el }, durationMs, { animate })
    );
    return { el, ...result.current };
  };

  it('without animations, sets the opacity instantly and skips the slide', () => {
    const { el, fade, slide } = setup(200, false);
    expect(fade(1)).toBeUndefined();
    expect(el.style.opacity).toBe('1');
    fade(0);
    expect(el.style.opacity).toBe('0');
    expect(slide()).toBeUndefined();
    expect(dom.animate).not.toHaveBeenCalled();
  });
  const frames = (i: number) => animations[i].keyframes;
  const duration = (i: number) => animations[i].options?.duration;

  it('fades from the current opacity, holding the end value', () => {
    const { el, fade } = setup();
    el.style.opacity = '0.4'; // mid-fade
    fade(0);
    expect(frames(0)).toEqual([{ opacity: 0.4 }, { opacity: 0 }]);
    expect(animations[0].options?.fill).toBe('forwards');
  });

  it('scales the fade duration by the distance', () => {
    const { el, fade } = setup(200);
    el.style.opacity = '0.4';
    fade(0);
    expect(duration(0)).toBeCloseTo(80);
  });

  it('fades from an explicit start', () => {
    const { fade } = setup(200);
    fade(1, 0);
    expect(frames(0)).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(duration(0)).toBe(200);
  });

  it('a new fade stops the previous fade only', () => {
    const { fade, slide } = setup();
    fade(1, 0);
    slide();
    fade(0);
    expect(animations[0].playState).toBe('idle'); // old fade cancelled
    expect(animations[1].playState).toBe('running'); // slide unaffected
    expect(animations[2].playState).toBe('running');
  });

  it('a new slide stops the previous slide only', () => {
    const { fade, slide } = setup();
    slide();
    fade(1, 0);
    slide();
    expect(animations[0].playState).toBe('idle');
    expect(animations[1].playState).toBe('running');
  });

  it('slides from --flip-from over twice the duration', () => {
    const { slide } = setup(200);
    slide();
    expect(frames(0)).toEqual([
      { transform: 'var(--flip-from, none)' },
      { transform: 'none' },
    ]);
    expect(duration(0)).toBe(400);
  });

  it('is instant under prefers-reduced-motion', () => {
    dom.reducedMotion = true;
    const { fade, slide } = setup(200);
    fade(1, 0);
    slide();
    expect(duration(0)).toBe(0);
    expect(duration(1)).toBe(0);
  });
});

describe('useSupports', () => {
  it('reports every flag', () => {
    const { result } = renderHook(() => useSupports());
    expect(result.current).toEqual({
      anchorPositioning: true,
      popover: true,
      webAnimations: true,
      intersectionObserver: true,
    });
  });

  it('returns the same object while nothing changes', () => {
    const { result, rerender } = renderHook(() => useSupports());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  const removers: Array<[keyof Support, () => void]> = [
    [
      'anchorPositioning',
      () => {
        dom.anchorPositioning = false;
      },
    ],
    ['popover', uninstallDom],
    ['webAnimations', uninstallDom],
    [
      'intersectionObserver',
      () => {
        delete (globalThis as Record<string, unknown>).IntersectionObserver;
      },
    ],
  ];
  it.each(removers)('detects a missing %s', (flag, remove) => {
    expect(detectSupport()[flag]).toBe(true);
    remove();
    expect(detectSupport()[flag]).toBe(false);
  });
});
