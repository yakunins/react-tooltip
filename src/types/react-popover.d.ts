// Augments React's JSX attribute types with the Popover API attributes,
// which are not yet present in this @types/react release. The top-level
// `import` makes this file a module so the block *merges* into React's
// types instead of replacing them.
import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    popover?: 'auto' | 'manual' | '';
    popoverTarget?: string;
    popoverTargetAction?: 'toggle' | 'show' | 'hide';
  }
}
