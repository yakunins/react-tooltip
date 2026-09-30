// jsdom can't parse modern CSS (nesting, @starting-style, anchor()) and logs
// an error per injected stylesheet; styles aren't applied in jsdom anyway.
const originalError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const first = args[0];
  const message = first instanceof Error ? first.message : String(first);
  if (message.includes('Could not parse CSS stylesheet')) return;
  originalError(...args);
};
