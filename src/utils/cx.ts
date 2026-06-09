/**
 * Minimal `clsx`-style class joiner: keeps the truthy string parts and joins
 * them with a space. Covers the only shape this library uses — positional
 * strings, some possibly `undefined` (e.g. a passed-through `className`) — so
 * the package can stay dependency-free.
 */
export const cx = (
  ...parts: Array<string | false | null | undefined>
): string => parts.filter(Boolean).join(' ');
