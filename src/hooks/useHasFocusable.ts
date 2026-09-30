import { useEffect, useState, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href],area[href],button,input,select,textarea,iframe,' +
  '[tabindex],[contenteditable="true"]';

// Whether `ref` contains a focusable element; if not, the anchor wrapper needs
// tabIndex={0} for the focus trigger to fire.
export const useHasFocusable = (ref: RefObject<HTMLElement>): boolean => {
  const [hasFocusable, setHasFocusable] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setHasFocusable(el.querySelector(FOCUSABLE_SELECTOR) !== null);
  });
  return hasFocusable;
};
