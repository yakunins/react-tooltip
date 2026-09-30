import { useEffect, useLayoutEffect } from 'react';

// useLayoutEffect avoids a pre-paint flash but warns on the server.
export const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
