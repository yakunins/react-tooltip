import { useEffect, useState, type RefObject } from 'react';

export interface AnchorVisibilityParams {
  anchorRef?: RefObject<HTMLElement>;
  internalAnchorRef: RefObject<HTMLElement>;
  isOpen: boolean;
  supported: boolean;
}

// True while the anchor is scrolled fully out of sight, set as the
// `anchor-hidden` class: fades the bubble instead of the browser's instant
// `position-visibility` hiding. A viewport-rooted observer sees the clipping
// of every scrolling ancestor.
export const useAnchorVisibility = ({
  anchorRef,
  internalAnchorRef,
  isOpen,
  supported,
}: AnchorVisibilityParams): boolean => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!isOpen || !supported) return;
    const anchor = anchorRef?.current ?? internalAnchorRef.current;
    if (!anchor || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1];
      if (entry) setHidden(!entry.isIntersecting);
    });
    io.observe(anchor);
    return () => {
      io.disconnect();
      setHidden(false);
    };
  }, [isOpen, supported, anchorRef, internalAnchorRef]);

  return hidden;
};
