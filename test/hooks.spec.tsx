/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';

import type { Placement } from '../src';
import { useAutoFlip } from '../src/Tooltip/hooks/useAutoFlip';
import { useControllableOpen } from '../src/Tooltip/hooks/useControllableOpen';
import {
  useFlipAnimation,
  type FlipAnimation,
} from '../src/Tooltip/hooks/useFlipAnimation';
import { usePopover } from '../src/Tooltip/hooks/usePopover';
import {
  dom,
  installDom,
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

    act(() => result.current.commitRef.current(true));
    expect(result.current.isOpen).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    act(() => result.current.commitRef.current(true)); // no-op
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

    act(() => result.current.commitRef.current(true));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(result.current.isOpen).toBe(false);
  });
});

describe('usePopover', () => {
  it('shows and hides the popover with isOpen', () => {
    const ref = { current: element() };
    const { rerender } = renderHook(({ open }) => usePopover(ref, open), {
      initialProps: { open: true },
    });
    expect(isPopoverOpen(ref.current)).toBe(true);
    rerender({ open: true });
    expect(dom.showPopover).toHaveBeenCalledTimes(1);
    rerender({ open: false });
    expect(isPopoverOpen(ref.current)).toBe(false);
  });

  it('swallows errors from the Popover API', () => {
    dom.showPopover.mockImplementation(() => {
      throw new Error('InvalidStateError');
    });
    const ref = { current: element() };
    expect(() => renderHook(() => usePopover(ref, true))).not.toThrow();
  });

  it('does nothing without Popover API support', () => {
    uninstallDom();
    const ref = { current: element() };
    expect(() => renderHook(() => usePopover(ref, true))).not.toThrow();
  });
});

describe('useAutoFlip', () => {
  type Props = {
    placement?: Placement;
    autoFlip?: boolean;
    isOpen?: boolean;
    supported?: boolean;
    held?: boolean;
    isControlled?: boolean;
  };

  const setup = (initial: Props = {}) => {
    // The fake clock starts at 0, which the throttle would read as "just
    // evaluated"; move past the window so the first check runs immediately.
    jest.advanceTimersByTime(1000);
    setViewport(800, 600);
    const anchor = element();
    const pop = element();
    const heldRef = { current: false };
    const hook = renderHook(
      ({
        placement = 'top',
        autoFlip = true,
        isOpen = true,
        supported = true,
        held = true,
        isControlled = false,
      }: Props) => {
        heldRef.current = held;
        return useAutoFlip({
          internalAnchorRef: { current: anchor },
          popoverRef: { current: pop },
          placement,
          autoFlip,
          isOpen,
          supported,
          heldRef,
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
    const { result, anchor, pop, fire } = setup({ held: false });
    nearTop(anchor, pop);
    fire();
    expect(result.current).toBe('top');
  });

  it('always flips a controlled tooltip', () => {
    const { result, anchor, pop, fire } = setup({
      held: false,
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
    pop.showPopover(); // still visible, fading out
    rerender({ isOpen: false });
    expect(result.current).toBe('bottom');

    const end = new Event('transitionend') as TransitionEvent;
    Object.defineProperty(end, 'propertyName', { value: 'opacity' });
    act(() => {
      pop.dispatchEvent(end);
    });
    expect(result.current).toBe('top');
  });

  it('resets after a timeout if transitionend never fires', () => {
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

  it('returns the placement as-is with autoFlip off', () => {
    const { result, rerender } = setup({ autoFlip: false });
    expect(MockIntersectionObserver.instances).toHaveLength(0);
    rerender({ autoFlip: false, placement: 'right' });
    expect(result.current).toBe('right');
  });

  it('does not observe while closed or unsupported', () => {
    setup({ isOpen: false });
    setup({ supported: false });
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('disconnects on close', () => {
    const { observer, rerender } = setup();
    const io = observer();
    rerender({ isOpen: false });
    expect(io.disconnected).toBe(true);
  });
});

describe('useAutoFlip inside a scroll container', () => {
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
      useAutoFlip({
        internalAnchorRef: { current: anchor },
        popoverRef: { current: pop },
        placement,
        autoFlip: true,
        isOpen: true,
        supported: true,
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

  // Regression: a bubble wider than half the box used to inset the side edges
  // past each other, leaving an empty root that never fired.
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
    // 10px below the box top: plenty of room above in the viewport, not in the box
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

describe('useFlipAnimation', () => {
  const animation = (duration?: number | string): FlipAnimation => ({
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    options: { duration, easing: 'ease' } as KeyframeAnimationOptions,
  });

  const setup = (anim: FlipAnimation, isOpen = true) => {
    const ref = { current: element() };
    return renderHook(
      ({ placement, open }: { placement: Placement; open: boolean }) =>
        useFlipAnimation(ref, placement, open, anim),
      { initialProps: { placement: 'top' as Placement, open: isOpen } }
    );
  };

  it('animates when the placement changes while open', () => {
    const anim = animation(300);
    const { rerender } = setup(anim);
    rerender({ placement: 'bottom', open: true });
    expect(dom.animate).toHaveBeenCalledWith(anim.keyframes, anim.options);
  });

  it('resolves a CSS <time> duration to ms', () => {
    const { rerender } = setup(animation('0.4s'));
    rerender({ placement: 'bottom', open: true });
    expect(dom.animate.mock.calls[0][1]).toMatchObject({ duration: 400 });
  });

  it('keeps an unresolvable duration as given', () => {
    const { rerender } = setup(animation('calc(var(--missing) * 2)'));
    rerender({ placement: 'bottom', open: true });
    expect(dom.animate.mock.calls[0][1]).toMatchObject({
      duration: 'calc(var(--missing) * 2)',
    });
  });

  it('does not animate on the opening render', () => {
    const { rerender } = setup(animation(300), false);
    rerender({ placement: 'bottom', open: true });
    expect(dom.animate).not.toHaveBeenCalled();
  });

  it('does not animate while closed', () => {
    const { rerender } = setup(animation(300), false);
    rerender({ placement: 'bottom', open: false });
    expect(dom.animate).not.toHaveBeenCalled();
  });

  it('respects prefers-reduced-motion', () => {
    dom.reducedMotion = true;
    const { rerender } = setup(animation(300));
    rerender({ placement: 'bottom', open: true });
    expect(dom.animate).not.toHaveBeenCalled();
  });
});
