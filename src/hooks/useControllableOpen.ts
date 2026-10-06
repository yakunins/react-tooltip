import { useRef, useState } from 'react';

import { useLatestRef } from './useLatestRef';

export type SetOpen = (next: boolean) => void;

export interface ControllableOpen {
  isOpen: boolean;
  // True when the parent owns `open`.
  isControlled: boolean;
  // Requests an open-state change. Stable; reads the latest props via refs.
  setOpen: SetOpen;
}

// Open state: owned by the parent when `open` is given (changes are only
// reported), otherwise internal, seeded from defaultOpen.
export const useControllableOpen = (
  open: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange?: (open: boolean) => void
): ControllableOpen => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const openRef = useLatestRef(isOpen);
  const controlledRef = useLatestRef(isControlled);
  const onChangeRef = useLatestRef(onOpenChange);
  const setOpen = useRef<SetOpen>(next => {
    if (next === openRef.current) return;
    openRef.current = next;
    if (!controlledRef.current) setInternalOpen(next);
    onChangeRef.current?.(next);
  }).current;

  return { isOpen, isControlled, setOpen };
};
