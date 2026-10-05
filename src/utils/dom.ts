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
