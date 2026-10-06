import { useEffect, useState } from 'react';

import { findFocusable } from '../utils/dom';

// Whether `element` contains a focusable descendant (else the wrapper needs
// a tab stop). Re-checked every render, as the children can change.
export const useElementHasFocusable = (
  element: HTMLElement | null
): boolean => {
  const [hasFocusable, setHasFocusable] = useState(false);
  useEffect(() => {
    if (!element) return;
    setHasFocusable(findFocusable(element) !== null);
  });
  return hasFocusable;
};
