/** @jest-environment jsdom */
import { render } from '@testing-library/react';

import { TooltipProvider } from '../src';
import { useStyleInjector, type GeneratedCss } from '../src/hooks';

const styleTags = () => Array.from(document.head.querySelectorAll('style'));

afterEach(() => {
  document.head.innerHTML = '';
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

  it('applies a CSP nonce from TooltipProvider', () => {
    render(
      <TooltipProvider nonce="abc123">
        <Styled css={a} />
      </TooltipProvider>
    );
    expect(styleTags()[0].nonce).toBe('abc123');
  });

  it('sets no nonce without a provider', () => {
    render(<Styled css={a} />);
    expect(styleTags()[0].hasAttribute('nonce')).toBe(false);
  });
});
