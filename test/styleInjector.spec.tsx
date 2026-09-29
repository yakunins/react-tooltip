/** @jest-environment jsdom */
import { render } from '@testing-library/react';

import { StyleInjector, useStyleInjector } from '../src/hooks';

const styleTags = () => Array.from(document.head.querySelectorAll('style'));

afterEach(() => {
  document.head.innerHTML = '';
});

describe('StyleInjector', () => {
  it('is a singleton', () => {
    expect(new StyleInjector()).toBe(new StyleInjector());
  });

  it('adds a <style> on first use and removes it after the last', () => {
    const injector = new StyleInjector();
    const style = { id: 'css_id__refcount', content: '.a{color:red}' };

    injector.increase(style);
    injector.increase(style);
    expect(styleTags()).toHaveLength(1);
    expect(document.getElementById('css_id__refcount')?.innerHTML).toBe(
      '.a{color:red}'
    );

    injector.reduce(style);
    expect(styleTags()).toHaveLength(1);
    injector.reduce(style);
    expect(styleTags()).toHaveLength(0);

    injector.reduce(style); // extra reduce stays at zero
    expect(injector.count(style)).toBe(0);
  });

  it('derives the same id from the same CSS', () => {
    const injector = new StyleInjector();
    expect(injector.generateID('.a{}')).toBe(injector.generateID('.a{}'));
    expect(injector.generateID('.a{}')).not.toBe(injector.generateID('.b{}'));
  });
});

describe('useStyleInjector', () => {
  const Styled = ({ css, scopeID }: { css: string; scopeID?: string }) => {
    const attrs = useStyleInjector(css, [], { scopeID });
    return <div data-testid="el" {...attrs} />;
  };

  it('injects one shared <style> for many users of the same CSS', () => {
    const { unmount } = render(
      <>
        <Styled css=".shared{}" />
        <Styled css=".shared{}" />
      </>
    );
    expect(styleTags()).toHaveLength(1);
    unmount();
    expect(styleTags()).toHaveLength(0);
  });

  it('wraps scoped CSS in an attribute selector and marks the element', () => {
    const { getByTestId } = render(<Styled css=".x{}" scopeID="demo" />);
    expect(getByTestId('el').hasAttribute('data-style-scope-demo')).toBe(true);
    expect(styleTags()[0].innerHTML).toBe(
      '[data-style-scope-demo] { display: contents; }' +
        '[data-style-scope-demo] {.x{}}'
    );
  });
});
