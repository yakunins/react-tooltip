import { UnstyledTooltip, type TooltipProps } from './UnstyledTooltip';
import useStyleInjector from './useStyleInjector';
import { default as css } from './tooltip.css.generated.js';

export type { TooltipProps } from './UnstyledTooltip';

/**
 * Tooltip — `UnstyledTooltip` plus its stylesheet.
 *
 * `tooltip.css` is injected into `<head>` at runtime (scoped by a hashed
 * attribute), so consumers need no CSS import and no bundler CSS loader.
 * The injected rules are reference-counted: the `<style>` element is added
 * once and removed when the last `Tooltip` unmounts.
 */
export const Tooltip = ({ ...rest }: TooltipProps) => {
  const scopeAttribute = useStyleInjector(css.content, [], {
    scopeID: css.hash,
  });

  if (Object.values(scopeAttribute).some(v => v === true))
    return (
      <div {...scopeAttribute} style={{ display: 'contents' }}>
        <UnstyledTooltip {...rest} />
      </div>
    );

  return <UnstyledTooltip {...rest} />;
};
