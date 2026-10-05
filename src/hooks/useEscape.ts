import { useEffect } from 'react';

import { useLatestRef } from './useLatestRef';

interface Entry {
  handler: () => void;
  topmostOnly: boolean;
}

// Enabled handlers, most recent last; one window listener while any exist.
const stack: Entry[] = [];

// Escape runs every `topmostOnly: false` handler and lets the key through, and
// only the most recent `topmostOnly` handler, stopping the key there (window
// capture runs first) so a surrounding dialog closes on the next press.
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return;
  const entries = [...stack];
  const top = entries.reverse().find(entry => entry.topmostOnly);
  entries.filter(entry => !entry.topmostOnly).forEach(entry => entry.handler());
  if (!top) return;
  e.preventDefault();
  e.stopPropagation();
  top.handler();
};

// Calls `onEscape` on Escape while enabled.
export const useEscape = (
  enabled: boolean,
  onEscape: () => void,
  topmostOnly = true
): void => {
  const onEscapeRef = useLatestRef(onEscape);
  useEffect(() => {
    if (!enabled) return;
    const entry: Entry = { handler: () => onEscapeRef.current(), topmostOnly };
    if (!stack.length) window.addEventListener('keydown', onKeyDown, true);
    stack.push(entry);
    return () => {
      stack.splice(stack.indexOf(entry), 1);
      if (!stack.length) window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [enabled, topmostOnly, onEscapeRef]);
};
