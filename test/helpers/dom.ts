// Stand-ins for the browser features jsdom lacks: the Popover API, CSS.supports
// (native anchor positioning), IntersectionObserver, matchMedia and
// Element.animate. Call `installDom()` in a `beforeEach` of a jsdom spec and
// `uninstallDom()` in the matching `afterEach`.

type Anyish = Record<string, unknown>;
type AnimateMock = jest.Mock<
  Animation | undefined,
  [Keyframe[], KeyframeAnimationOptions?]
>;

const OPEN = Symbol('popover-open');
type PopoverEl = HTMLElement & { [OPEN]?: boolean };

// Called back with an explicit `this` (see the override below).
// eslint-disable-next-line @typescript-eslint/unbound-method
const originalMatches = Element.prototype.matches;

export class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {
    MockIntersectionObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  takeRecords() {
    return [];
  }
  /** Fire the observer callback, as the browser would on an intersection change. */
  trigger(entries: Partial<IntersectionObserverEntry>[] = []) {
    this.callback(
      entries as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver
    );
  }
  /** The live observer watching `el`, if any. */
  static watching(el: Element): MockIntersectionObserver | undefined {
    return MockIntersectionObserver.instances.find(
      io => !io.disconnected && io.observed.includes(el)
    );
  }
}

export const dom = {
  /** What `CSS.supports('anchor-name: ...')` reports. */
  anchorPositioning: true,
  /** What `matchMedia('(prefers-reduced-motion: reduce)')` reports. */
  reducedMotion: false,
  animate: jest.fn() as AnimateMock,
  showPopover: jest.fn(),
  hidePopover: jest.fn(),
};

export const isPopoverOpen = (el: Element | null): boolean =>
  Boolean(el && (el as PopoverEl)[OPEN]);

export const installDom = () => {
  dom.anchorPositioning = true;
  dom.reducedMotion = false;
  dom.animate = jest.fn() as AnimateMock;
  dom.showPopover = jest.fn(function (this: PopoverEl) {
    this[OPEN] = true;
  });
  dom.hidePopover = jest.fn(function (this: PopoverEl) {
    this[OPEN] = false;
  });
  MockIntersectionObserver.instances = [];

  (globalThis as Anyish).CSS = {
    supports: (q: string) =>
      q.startsWith('anchor-name') ? dom.anchorPositioning : false,
  };
  (globalThis as Anyish).IntersectionObserver = MockIntersectionObserver;
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') && dom.reducedMotion,
    media: query,
  })) as unknown as typeof window.matchMedia;

  const proto = HTMLElement.prototype as unknown as Anyish;
  proto.showPopover = function (this: PopoverEl) {
    dom.showPopover.call(this);
  };
  proto.hidePopover = function (this: PopoverEl) {
    dom.hidePopover.call(this);
  };
  proto.animate = function (this: HTMLElement, ...args: unknown[]) {
    const result: Animation | undefined = dom.animate.apply(
      this,
      args as Parameters<AnimateMock>
    );
    return result;
  };
  Element.prototype.matches = function (this: Element, selector: string) {
    if (selector === ':popover-open') return isPopoverOpen(this);
    return originalMatches.call(this, selector);
  };
};

export const uninstallDom = () => {
  const g = globalThis as Anyish;
  delete g.CSS;
  delete g.IntersectionObserver;
  const proto = HTMLElement.prototype as unknown as Anyish;
  delete proto.showPopover;
  delete proto.hidePopover;
  delete proto.animate;
  Element.prototype.matches = originalMatches;
  document.head.innerHTML = '';
};

/** Stub an element's box, as getBoundingClientRect would report it. */
export const setRect = (
  el: Element,
  r: { top: number; left: number; width: number; height: number }
) => {
  el.getBoundingClientRect = () =>
    ({
      ...r,
      x: r.left,
      y: r.top,
      right: r.left + r.width,
      bottom: r.top + r.height,
      toJSON: () => r,
    }) as DOMRect;
};

/** Set the viewport size used by useAutoFlip. */
export const setViewport = (width: number, height: number) => {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    configurable: true,
    value: height,
  });
};
