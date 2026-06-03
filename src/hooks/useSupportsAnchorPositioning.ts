import { useEffect, useState } from 'react';

/** True when the browser positions elements with native CSS anchor positioning. */
export const supportsAnchorPositioning = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('anchor-name: --probe');

/**
 * SSR-safe support check for native CSS anchor positioning.
 *
 * Starts optimistic (`true`) so the server markup and the first client render
 * agree — no hydration mismatch — and supporting browsers never reflow. After
 * mount it settles to the real value, flipping to `false` only on browsers
 * that lack native anchor positioning, where the caller degrades to a plain
 * `title` tooltip.
 */
export const useSupportsAnchorPositioning = (): boolean => {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    setSupported(supportsAnchorPositioning());
  }, []);
  return supported;
};
