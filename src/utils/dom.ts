interface TouchMouseEvent extends MouseEvent {
  sourceCapabilities?: { firesTouchEvents?: boolean };
}

// Mouse events synthesized after a touch would toggle the tooltip twice.
export const isSyntheticFromTouch = (e?: Event): boolean =>
  Boolean(
    (e as TouchMouseEvent | undefined)?.sourceCapabilities?.firesTouchEvents
  );

// Observe `target`; returns the disconnect.
export const observe = (
  target: Element,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): (() => void) => {
  const io = new IntersectionObserver(callback, options);
  io.observe(target);
  return () => io.disconnect();
};

// Sets an attribute and returns a restore of the previous value (or absence).
export const setAttribute = (
  el: Element,
  name: string,
  value: string
): (() => void) => {
  const prev = el.getAttribute(name);
  el.setAttribute(name, value);
  return () => {
    if (prev === null) el.removeAttribute(name);
    else el.setAttribute(name, prev);
  };
};

// Sets an inline style property and returns a restore of the previous value.
export const setStyle = (
  el: HTMLElement,
  property: string,
  value: string
): (() => void) => {
  const prev = el.style.getPropertyValue(property);
  el.style.setProperty(property, value);
  return () => {
    if (prev) el.style.setProperty(property, prev);
    else el.style.removeProperty(property);
  };
};

// Adds a token to a space-separated attribute (e.g. aria-describedby) and
// returns its removal. Only this token is removed, so other writers' tokens
// survive; the attribute goes away once empty.
export const addToken = (
  el: Element,
  name: string,
  token: string
): (() => void) => {
  const tokens = (el.getAttribute(name) ?? '').split(/\s+/).filter(Boolean);
  if (!tokens.includes(token))
    el.setAttribute(name, [...tokens, token].join(' '));
  return () => {
    const rest = (el.getAttribute(name) ?? '')
      .split(/\s+/)
      .filter(t => t && t !== token);
    if (rest.length) el.setAttribute(name, rest.join(' '));
    else el.removeAttribute(name);
  };
};
