// Augments React's JSX attribute types with the Popover API attributes,
// which are not yet present in this @types/react release. The top-level
// `import` makes this file a module so the block *merges* into React's
// types instead of replacing them.
import 'react';

declare module 'react' {
  // `T` must match the type parameter of the declaration being merged into.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    popover?: 'auto' | 'manual' | '';
    popoverTarget?: string;
    popoverTargetAction?: 'toggle' | 'show' | 'hide';
  }
}
