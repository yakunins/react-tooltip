import { useEffect, useState } from 'react';

import { observe } from '../utils/dom';

// True while `element` is scrolled fully out of sight (a viewport-rooted
// observer sees every scrolling ancestor's clipping); false when disabled.
export const useElementHidden = (
  element: HTMLElement | null,
  { enabled }: { enabled: boolean }
): boolean => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled || !element) return;
    const stop = observe(element, entries => {
      const entry = entries[entries.length - 1];
      if (entry) setHidden(!entry.isIntersecting);
    });
    return () => {
      stop();
      setHidden(false);
    };
  }, [enabled, element]);

  return hidden;
};
