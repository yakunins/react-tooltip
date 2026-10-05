import type { ReactNode } from 'react';

import { StyleNonceContext } from '../hooks';

export type TooltipProviderProps = {
  /** CSP nonce for the `<style>` tags the tooltips inject. */
  nonce?: string;
  children?: ReactNode;
};

/** Optional app-wide settings for the tooltips below it. */
export const TooltipProvider = ({ nonce, children }: TooltipProviderProps) => (
  <StyleNonceContext.Provider value={nonce}>
    {children}
  </StyleNonceContext.Provider>
);
