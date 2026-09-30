// Adds the Popover API attributes missing from this @types/react release.
// The import makes this a module, so the block merges instead of replacing.
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
