import { createContext, useContext, useInsertionEffect } from 'react';

// A css-to-js module; `hash` identifies the stylesheet.
export type GeneratedCss = { hash: string; content: string };

// CSP nonce for the injected <style> tags; set through TooltipProvider.
export const StyleNonceContext = createContext<string | undefined>(undefined);

// One <style> per stylesheet, counted by the components using it.
const tags = new Map<string, { el: HTMLStyleElement; users: number }>();

// Injects a stylesheet into <head> while mounted; components using the same
// one share a single <style>, removed after the last unmounts.
export const useStyleInjector = ({ hash, content }: GeneratedCss): void => {
  const nonce = useContext(StyleNonceContext);
  useInsertionEffect(() => {
    let entry = tags.get(hash);
    if (!entry) {
      const el = document.createElement('style');
      el.id = `css_id__${hash}`;
      if (nonce) el.nonce = nonce;
      el.textContent = content;
      document.head.appendChild(el);
      entry = { el, users: 0 };
      tags.set(hash, entry);
    }
    const used = entry;
    used.users++;
    return () => {
      if (--used.users > 0) return;
      used.el.remove();
      tags.delete(hash);
    };
  }, [hash, content, nonce]);
};
