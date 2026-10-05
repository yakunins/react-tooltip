import type { ReactNode } from 'react';

import { useIsoLayoutEffect } from './useIsoLayoutEffect';

export interface ExternalAnchorParams {
  anchorPositioning: boolean;
  // The consumer's anchorRef element; null in wrapping / by-name mode.
  anchor: HTMLElement | null;
  // Set when the consumer owns the CSS anchor name.
  anchorNameProp?: string;
  anchorName: string;
  content: ReactNode;
  tooltipId: string;
}

// Wires an `anchorRef` element: anchor-name and aria-describedby, or a native
// `title` in the fallback. Every write restores the previous value on cleanup,
// including when the element is swapped for another.
export const useExternalAnchor = ({
  anchorPositioning,
  anchor,
  anchorNameProp,
  anchorName,
  content,
  tooltipId,
}: ExternalAnchorParams): void => {
  // anchor-name, unless the consumer supplied their own.
  useIsoLayoutEffect(() => {
    if (!anchorPositioning || !anchor || anchorNameProp) return;
    const prev = anchor.style.getPropertyValue('anchor-name');
    anchor.style.setProperty('anchor-name', anchorName);
    return () => {
      if (prev) anchor.style.setProperty('anchor-name', prev);
      else anchor.style.removeProperty('anchor-name');
    };
  }, [anchorPositioning, anchor, anchorName, anchorNameProp]);

  // Fallback: string content as the native `title`.
  useIsoLayoutEffect(() => {
    if (anchorPositioning || !anchor || typeof content !== 'string') return;
    const prev = anchor.getAttribute('title');
    anchor.setAttribute('title', content);
    return () => {
      if (prev !== null) anchor.setAttribute('title', prev);
      else anchor.removeAttribute('title');
    };
  }, [anchorPositioning, anchor, content]);

  // aria-describedby, keeping any existing ids.
  useIsoLayoutEffect(() => {
    if (!anchorPositioning || !anchor) return;
    const prev = anchor.getAttribute('aria-describedby');
    const ids = prev ? prev.split(/\s+/).filter(Boolean) : [];
    if (!ids.includes(tooltipId)) {
      anchor.setAttribute('aria-describedby', [...ids, tooltipId].join(' '));
    }
    return () => {
      const cur = anchor.getAttribute('aria-describedby');
      if (!cur) return;
      const remaining = cur.split(/\s+/).filter(id => id && id !== tooltipId);
      if (remaining.length) {
        anchor.setAttribute('aria-describedby', remaining.join(' '));
      } else {
        anchor.removeAttribute('aria-describedby');
      }
    };
  }, [anchorPositioning, anchor, tooltipId]);
};
