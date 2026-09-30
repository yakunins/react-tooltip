import { useEffect, useState } from 'react';

// True when the browser supports native CSS anchor positioning.
export const supportsAnchorPositioning = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('anchor-name: --probe');

// SSR-safe: starts `true` so server and first client render agree, then
// settles after mount (false only where support is missing).
export const useSupportsAnchorPositioning = (): boolean => {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    setSupported(supportsAnchorPositioning());
  }, []);
  return supported;
};
