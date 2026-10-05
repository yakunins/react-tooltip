// Layers `overrides` over `defaults`; an explicit `undefined` keeps the default.
export const withDefaults = <T extends object>(
  defaults: Required<T>,
  overrides?: Partial<T>
): Required<T> => {
  const defined = Object.fromEntries(
    Object.entries(overrides ?? {}).filter(([, v]) => v !== undefined)
  );
  return { ...defaults, ...defined } as Required<T>;
};
