import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` fires before paint (no positioning flash) but warns on the
 * server; fall back to `useEffect` when there's no DOM.
 */
export const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
