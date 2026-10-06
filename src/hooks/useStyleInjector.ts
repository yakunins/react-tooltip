import { useInsertionEffect } from 'react';

// A css-to-js module; `hash` identifies the stylesheet.
export type GeneratedCss = { hash: string; content: string };

// The page's CSP nonce, if any: Vite's <meta property="csp-nonce">, else any
// <script nonce>. Read through `.nonce` first, since browsers hide the
// attribute's value once the page has loaded.
const findNonce = (): string | undefined => {
  const source =
    document.querySelector<HTMLElement>('meta[property="csp-nonce"]') ??
    document.querySelector<HTMLElement>('script[nonce]');
  return source?.nonce || source?.getAttribute('nonce') || undefined;
};

// One <style> per stylesheet, counted by the components using it.
const tags = new Map<string, { el: HTMLStyleElement; users: number }>();

// Injects a stylesheet into <head> while mounted; components using the same
// one share a single <style>, removed after the last unmounts. Under a strict
// CSP the tag gets the page's nonce automatically.
export const useStyleInjector = ({ hash, content }: GeneratedCss): void => {
  useInsertionEffect(() => {
    let entry = tags.get(hash);
    if (!entry) {
      const el = document.createElement('style');
      el.id = `css_id__${hash}`;
      const nonce = findNonce();
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
  }, [hash, content]);
};
