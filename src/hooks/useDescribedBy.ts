import { useState } from 'react';

import { addToken, findFocusable } from '../utils/dom';
import { useIsoLayoutEffect } from './useIsoLayoutEffect';

// Adds `id` to aria-describedby on what actually receives focus inside
// `wrapper`: its first focusable descendant, else the wrapper itself. Screen
// readers announce the focused element's description, not its ancestors'.
// Re-checked every render, as the children can change.
export const useDescribedBy = (wrapper: HTMLElement | null, id: string) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useIsoLayoutEffect(() => {
    const next = wrapper ? (findFocusable(wrapper) ?? wrapper) : null;
    if (next !== target) setTarget(next);
  });
  useIsoLayoutEffect(() => {
    if (target) return addToken(target, 'aria-describedby', id);
  }, [target, id]);
};
