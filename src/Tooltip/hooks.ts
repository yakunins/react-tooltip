import { useEffect, useState, type RefObject } from 'react';

/** True when the browser positions elements with native CSS anchor positioning. */
export const supportsAnchorPositioning = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('anchor-name: --probe');

// Module-level: the polyfill is a singleton, requested at most once per page.
let polyfillRequested = false;

/**
 * Loads the `@oddbird/css-anchor-positioning` polyfill — but only in
 * browsers without native support, and only once. The polyfill module is
 * `import()`-ed lazily so supporting browsers never download it.
 *
 * Passing `true` runs it in animation-frame mode, so anchored popovers
 * keep tracking their anchors through scroll and resize.
 */
export const useAnchorPolyfill = (): void => {
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR
    if (polyfillRequested) return;
    if (supportsAnchorPositioning()) return;

    polyfillRequested = true;
    import(
      // @ts-ignore — runtime-only dependency; type declarations are optional
      '@oddbird/css-anchor-positioning/fn'
    )
      .then((mod: { default?: unknown; polyfill?: unknown }) => {
        const polyfill = mod.default ?? mod.polyfill;
        if (typeof polyfill === 'function') {
          (polyfill as (useAnimationFrame?: boolean) => unknown)(true);
        }
      })
      .catch(() => {
        polyfillRequested = false; // allow a later retry
      });
  }, []);
};

const FOCUSABLE_SELECTOR =
  'a[href],area[href],button,input,select,textarea,iframe,' +
  '[tabindex],[contenteditable="true"]';

/**
 * Reports whether `ref` already contains a natively focusable element.
 *
 * When it does not, the tooltip's anchor wrapper must itself become
 * focusable (`tabIndex={0}`) so the `focus` trigger can fire.
 */
export const useHasFocusable = (ref: RefObject<HTMLElement>): boolean => {
  const [hasFocusable, setHasFocusable] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setHasFocusable(el.querySelector(FOCUSABLE_SELECTOR) !== null);
  });
  return hasFocusable;
};
