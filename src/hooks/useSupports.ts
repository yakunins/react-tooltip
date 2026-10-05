import { useSyncExternalStore } from 'react';

export interface Support {
  anchorPositioning: boolean;
  popover: boolean;
  webAnimations: boolean;
  intersectionObserver: boolean;
}

// What the browser supports right now.
export const detectSupport = (): Support => ({
  anchorPositioning:
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('anchor-name: --probe'),
  popover:
    typeof HTMLElement !== 'undefined' &&
    'showPopover' in HTMLElement.prototype,
  webAnimations:
    typeof HTMLElement !== 'undefined' && 'animate' in HTMLElement.prototype,
  intersectionObserver: typeof IntersectionObserver !== 'undefined',
});

// Assumed on the server, so hydration matches supporting browsers.
const SERVER: Support = {
  anchorPositioning: true,
  popover: true,
  webAnimations: true,
  intersectionObserver: true,
};

// useSyncExternalStore needs a stable snapshot: keep the last object until a
// flag actually changes.
let last: Support = SERVER;
const getSnapshot = (): Support => {
  const next = detectSupport();
  const same = (Object.keys(next) as Array<keyof Support>).every(
    key => next[key] === last[key]
  );
  if (!same) last = next;
  return last;
};

// Support never changes, so there is nothing to subscribe to.
const subscribe = () => () => {};

// The browser's feature support, correct on the first client render.
export const useSupports = (): Support =>
  useSyncExternalStore(subscribe, getSnapshot, () => SERVER);
