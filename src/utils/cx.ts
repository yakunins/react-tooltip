// Minimal clsx: joins the truthy parts, keeping the package dependency-free.
export const cx = (
  ...parts: Array<string | false | null | undefined>
): string => parts.filter(Boolean).join(' ');
