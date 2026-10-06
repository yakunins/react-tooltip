/** @jest-environment jsdom */
import { render } from '@testing-library/react';

import { useStyleInjector, type GeneratedCss } from '../src/hooks';

const styleTags = () => Array.from(document.head.querySelectorAll('style'));

afterEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

const Styled = ({ css }: { css: GeneratedCss }) => {
  useStyleInjector(css);
  return null;
};
const a: GeneratedCss = { hash: 'a', content: '.a{}' };
const b: GeneratedCss = { hash: 'b', content: '.b{}' };

describe('useStyleInjector', () => {
  it('injects the stylesheet into <head>, keyed by its hash', () => {
    render(<Styled css={a} />);
    const tag = document.getElementById('css_id__a');
    expect(tag?.parentNode).toBe(document.head);
    expect(tag?.textContent).toBe('.a{}');
  });

  it('shares one <style> between users, removed after the last', () => {
    const { rerender, unmount } = render(
      <>
        <Styled css={a} />
        <Styled css={a} />
      </>
    );
    expect(styleTags()).toHaveLength(1);
    rerender(<Styled css={a} />);
    expect(styleTags()).toHaveLength(1);
    unmount();
    expect(styleTags()).toHaveLength(0);
  });

  it('keeps different stylesheets apart', () => {
    render(
      <>
        <Styled css={a} />
        <Styled css={b} />
      </>
    );
    expect(styleTags().map(t => t.textContent)).toEqual(['.a{}', '.b{}']);
  });

  it('swaps the stylesheet when the module changes', () => {
    const { rerender } = render(<Styled css={a} />);
    rerender(<Styled css={b} />);
    expect(styleTags().map(t => t.textContent)).toEqual(['.b{}']);
  });
});

describe('useStyleInjector CSP nonce', () => {
  const addNonceTag = (tag: 'meta' | 'script', nonce: string) => {
    const el = document.createElement(tag);
    if (tag === 'meta') el.setAttribute('property', 'csp-nonce');
    el.setAttribute('nonce', nonce);
    (tag === 'meta' ? document.head : document.body).appendChild(el);
  };

  it('takes the nonce from <meta property="csp-nonce">', () => {
    addNonceTag('meta', 'from-meta');
    render(<Styled css={a} />);
    expect(styleTags()[0].nonce).toBe('from-meta');
  });

  it('falls back to a <script nonce>', () => {
    addNonceTag('script', 'from-script');
    render(<Styled css={a} />);
    expect(styleTags()[0].nonce).toBe('from-script');
  });

  it('prefers the meta over a script', () => {
    addNonceTag('script', 'from-script');
    addNonceTag('meta', 'from-meta');
    render(<Styled css={a} />);
    expect(styleTags()[0].nonce).toBe('from-meta');
  });

  it('sets no nonce when the page has none', () => {
    render(<Styled css={a} />);
    expect(styleTags()[0].hasAttribute('nonce')).toBe(false);
  });
});
