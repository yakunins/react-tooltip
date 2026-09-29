// jsdom's CSS parser doesn't understand modern syntax (nesting, @starting-style,
// anchor()), so every injected stylesheet logs "Could not parse CSS
// stylesheet". The styles aren't applied in jsdom anyway — silence just that.
const originalError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const first = args[0];
  const message = first instanceof Error ? first.message : String(first);
  if (message.includes('Could not parse CSS stylesheet')) return;
  originalError(...args);
};
