import { useRef, useState, type MutableRefObject } from 'react';

export interface ControllableOpen {
  isOpen: boolean;
  // True when the parent owns `open`.
  isControlled: boolean;
  // Stable committer, read through a ref so handlers never see stale props.
  commitRef: MutableRefObject<(next: boolean) => void>;
}

// Controlled/uncontrolled open state: a provided `open` is owned by the parent
// (changes only reported via `onOpenChange`), otherwise seeded from defaultOpen.
export const useControllableOpen = (
  open: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange?: (open: boolean) => void
): ControllableOpen => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const openRef = useRef(isOpen);
  openRef.current = isOpen;
  const commitRef = useRef<(next: boolean) => void>(() => {});
  commitRef.current = (next: boolean) => {
    if (next === openRef.current) return;
    openRef.current = next;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return { isOpen, isControlled, commitRef };
};
