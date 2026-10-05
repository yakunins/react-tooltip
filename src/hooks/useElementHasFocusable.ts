import { useEffect, useState } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href],area[href],button,input,select,textarea,iframe,' +
  '[tabindex],[contenteditable="true"]';

// Whether `element` contains a focusable descendant; if not, the anchor wrapper
// needs tabIndex={0} for the focus trigger to fire. Re-checked after every
// render, since the wrapped children can change.
export const useElementHasFocusable = (
  element: HTMLElement | null
): boolean => {
  const [hasFocusable, setHasFocusable] = useState(false);
  useEffect(() => {
    if (!element) return;
    setHasFocusable(element.querySelector(FOCUSABLE_SELECTOR) !== null);
  });
  return hasFocusable;
};
