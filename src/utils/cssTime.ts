// CSS <time> ('0.2s' | '160ms') to ms. A bare number is taken as ms; NaN if
// it doesn't start with a number.
export const cssTimeToMs = (value: string): number => {
  const v = value.trim();
  if (v.endsWith('ms')) return parseFloat(v);
  if (v.endsWith('s')) return parseFloat(v) * 1000;
  return parseFloat(v);
};
