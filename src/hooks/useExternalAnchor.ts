import type { ReactNode } from 'react';

import { addToken, setAttribute, setStyle } from '../utils/dom';
import { useIsoLayoutEffect } from './useIsoLayoutEffect';

export interface ExternalAnchorParams {
  // False in the title fallback.
  styled: boolean;
  // The consumer's anchorRef element; null in wrapping / by-name mode.
  anchor: HTMLElement | null;
  // Set when the consumer owns the CSS anchor name.
  anchorNameProp?: string;
  anchorName: string;
  content: ReactNode;
  tooltipId: string;
}

// Wires an `anchorRef` element: anchor-name and aria-describedby, or a native
// `title` in the fallback. Every write is undone on cleanup, including when
// the element is swapped for another.
export const useExternalAnchor = ({
  styled,
  anchor,
  anchorNameProp,
  anchorName,
  content,
  tooltipId,
}: ExternalAnchorParams): void => {
  // anchor-name, unless the consumer supplied their own.
  useIsoLayoutEffect(() => {
    if (!styled || !anchor || anchorNameProp) return;
    return setStyle(anchor, 'anchor-name', anchorName);
  }, [styled, anchor, anchorName, anchorNameProp]);

  // Fallback: string content as the native `title`.
  useIsoLayoutEffect(() => {
    if (styled || !anchor || typeof content !== 'string') return;
    return setAttribute(anchor, 'title', content);
  }, [styled, anchor, content]);

  // aria-describedby, keeping any existing ids.
  useIsoLayoutEffect(() => {
    if (!styled || !anchor) return;
    return addToken(anchor, 'aria-describedby', tooltipId);
  }, [styled, anchor, tooltipId]);
};
