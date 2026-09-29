import { useEffect, useState, type RefObject } from 'react';

export interface AnchorVisibilityParams {
  /** External anchor element (anchorRef mode), if any. */
  anchorRef?: RefObject<HTMLElement>;
  /** The wrapper element rendered in wrapping mode. */
  internalAnchorRef: RefObject<HTMLElement>;
  /** Only observe while open. */
  isOpen: boolean;
  /** No popover to hide in the title fallback. */
  supported: boolean;
}

/**
 * Reports whether the anchor is currently scrolled fully out of sight.
 *
 * The popover lives in the top layer, so a scroll container around the anchor
 * can't clip it. Browsers handle that with `position-visibility:
 * anchors-visible` (the default), which hides the bubble once its anchor is
 * clipped — but instantly, with no transition. tooltip.css switches that off
 * (`position-visibility: always`) and fades the bubble instead, while this
 * hook's result is set as the `anchor-hidden` class.
 *
 * An IntersectionObserver on the anchor (root = viewport) sees the clipping of
 * every scrolling ancestor, so `isIntersecting` is false exactly when no part
 * of the anchor is visible. Always false in external-by-name mode (no
 * element to observe).
 */
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
