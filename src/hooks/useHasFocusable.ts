import { useEffect, useState, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href],area[href],button,input,select,textarea,iframe,' +
  '[tabindex],[contenteditable="true"]';

/**
 * Reports whether `ref` already contains a natively focusable element.
 *
 * When it does not, the tooltip's anchor wrapper must itself become
 * focusable (`tabIndex={0}`) so the `focus` trigger can fire.
 */
export const useHasFocusable = (ref: RefObject<HTMLElement>): boolean => {
  const [hasFocusable, setHasFocusable] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setHasFocusable(el.querySelector(FOCUSABLE_SELECTOR) !== null);
  });
  return hasFocusable;
};
