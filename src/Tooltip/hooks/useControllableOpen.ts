import { useRef, useState, type MutableRefObject } from 'react';

export interface ControllableOpen {
  /** The resolved open state (the `open` prop if controlled, else internal). */
  isOpen: boolean;
  /** True when the parent owns `open` (the `open` prop was provided). */
  isControlled: boolean;
  /**
   * Stable committer that requests an open-state change. Reads/writes through
   * a ref so event handlers stay free of stale props; a no-op when the next
   * value already matches the current one.
   */
  commitRef: MutableRefObject<(next: boolean) => void>;
}

/**
 * Controlled/uncontrolled open state. When `open` is provided the parent owns
 * it (changes are only reported via `onOpenChange`); otherwise the state is
 * internal, seeded from `defaultOpen`.
 */
export const useControllableOpen = (
  open: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange?: (open: boolean) => void
): ControllableOpen => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? (open as boolean) : internalOpen;

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
