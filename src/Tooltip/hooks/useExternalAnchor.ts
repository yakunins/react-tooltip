import type { ReactNode, RefObject } from 'react';

import { useIsoLayoutEffect } from '../../hooks';

export interface ExternalAnchorParams {
  /** False when degraded to the native `title` fallback. */
  supported: boolean;
  /** The consumer's element (external-by-ref / by-name modes). */
  anchorRef?: RefObject<HTMLElement>;
  /** Set when the consumer owns the CSS anchor name (external-by-name). */
  anchorNameProp?: string;
  /** The resolved anchor name written onto the element. */
  anchorName: string;
  /** Tooltip content — mirrored as `title` in the fallback when a string. */
  content: ReactNode;
  /** The popover id, mirrored via `aria-describedby`. */
  tooltipId: string;
}

/**
 * Wires up an external anchor element (the `anchorRef` mode): writes
 * `anchor-name` and mirrors `aria-describedby` for accessibility while native
 * anchor positioning is available, and surfaces string content through the
 * element's native `title` when it is not. A no-op in wrapping mode (no
 * `anchorRef`). All writes preserve and restore any pre-existing values.
 */
export const useExternalAnchor = ({
  supported,
  anchorRef,
  anchorNameProp,
  anchorName,
  content,
  tooltipId,
}: ExternalAnchorParams): void => {
  // --- external-by-ref: write `anchor-name` onto the consumer's element ---
  // Skipped when `anchorNameProp` is supplied — then the consumer owns it —
  // and when native anchor positioning is missing (the title fallback runs
  // instead of the styled bubble).
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

  // --- external-by-ref fallback: mirror string content onto the consumer's
  // element as a native `title` when anchor positioning is unsupported ---
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

  // --- external-by-ref: mirror aria-describedby for accessibility ---
  // Preserves any pre-existing tokens; restored on unmount. Skipped without
  // anchor positioning, where there is no popover for the id to reference.
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
