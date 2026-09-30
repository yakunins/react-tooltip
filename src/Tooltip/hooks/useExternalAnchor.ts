import type { ReactNode, RefObject } from 'react';

import { useIsoLayoutEffect } from '../../hooks';

export interface ExternalAnchorParams {
  supported: boolean;
  anchorRef?: RefObject<HTMLElement>;
  // Set when the consumer owns the CSS anchor name.
  anchorNameProp?: string;
  anchorName: string;
  content: ReactNode;
  tooltipId: string;
}

// Wires an `anchorRef` element: anchor-name and aria-describedby, or a native
// `title` in the fallback. Every write restores the previous value on cleanup.
export const useExternalAnchor = ({
  supported,
  anchorRef,
  anchorNameProp,
  anchorName,
  content,
  tooltipId,
}: ExternalAnchorParams): void => {
  // anchor-name, unless the consumer supplied their own.
  useIsoLayoutEffect(() => {
    if (!supported || !anchorRef || anchorNameProp) return;
    const el = anchorRef.current;
    if (!el) return;
    const prev = el.style.getPropertyValue('anchor-name');
    el.style.setProperty('anchor-name', anchorName);
    return () => {
      if (prev) el.style.setProperty('anchor-name', prev);
      else el.style.removeProperty('anchor-name');
    };
  }, [supported, anchorRef, anchorName, anchorNameProp]);

  // Fallback: string content as the native `title`.
  useIsoLayoutEffect(() => {
    if (supported) return;
    const el = anchorRef?.current;
    if (!el || typeof content !== 'string') return;
    const prev = el.getAttribute('title');
    el.setAttribute('title', content);
    return () => {
      if (prev !== null) el.setAttribute('title', prev);
      else el.removeAttribute('title');
    };
  }, [supported, anchorRef, content]);

  // aria-describedby, keeping any existing ids.
  useIsoLayoutEffect(() => {
    if (!supported || !anchorRef) return;
    const el = anchorRef.current;
    if (!el) return;
    const prev = el.getAttribute('aria-describedby');
    const ids = prev ? prev.split(/\s+/).filter(Boolean) : [];
    if (!ids.includes(tooltipId)) {
      el.setAttribute('aria-describedby', [...ids, tooltipId].join(' '));
    }
    return () => {
      const cur = el.getAttribute('aria-describedby');
      if (!cur) return;
      const remaining = cur.split(/\s+/).filter(id => id && id !== tooltipId);
      if (remaining.length) {
        el.setAttribute('aria-describedby', remaining.join(' '));
      } else {
        el.removeAttribute('aria-describedby');
      }
    };
  }, [supported, anchorRef, tooltipId]);
};
