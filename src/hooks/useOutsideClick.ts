import { useDocumentEvent } from './useDocumentEvent';

// Calls `onOutside` for document clicks outside `inside` while enabled.
export const useOutsideClick = (
  inside: Array<Element | null>,
  onOutside: (e: MouseEvent) => void,
  enabled: boolean
): void =>
  useDocumentEvent(
    'click',
    e => {
      const target = e.target as Node | null;
      if (target && inside.some(el => el?.contains(target))) return;
      onOutside(e);
    },
    enabled
  );
