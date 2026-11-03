// CSS <time> ('0.2s' | '160ms', or a bare number) to ms; 0 if unparsable.
export const cssTimeToMs = (value: string): number => {
  const v = value.trim();
  const ms = v.endsWith('ms')
    ? parseFloat(v)
    : v.endsWith('s')
      ? parseFloat(v) * 1000
      : parseFloat(v);
  return Number.isFinite(ms) ? ms : 0;
};
