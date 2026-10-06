// CSS <time> ('0.2s' | '160ms', or a bare number) to ms; NaN if unparsable.
export const cssTimeToMs = (value: string): number => {
  const v = value.trim();
  if (v.endsWith('ms')) return parseFloat(v);
  if (v.endsWith('s')) return parseFloat(v) * 1000;
  return parseFloat(v);
};
