import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';

export type KeepOpenReason = 'focus' | 'click';

export interface KeepOpen {
  // Kept open by focus or a click: survives hover-out, and enables flipping.
  ref: MutableRefObject<boolean>;
  focusRef: MutableRefObject<boolean>;
  clickRef: MutableRefObject<boolean>;
  // Kept open by a click, as state, for enabling outside-click dismissal.
  byClick: boolean;
  set: (reason: KeepOpenReason, on: boolean) => void;
}

// What keeps the tooltip open besides hover: focus (from focusin until it
// leaves, so a hover-shown tooltip still hides on mouseleave) or a click.
// An uncontrolled defaultOpen starts as kept open by a click. Both release on
// close.
export const useKeepOpen = ({
  isOpen,
  isControlled,
}: {
  isOpen: boolean;
  isControlled: boolean;
}): KeepOpen => {
  const initial = !isControlled && isOpen;
  const focusRef = useRef(false);
  const clickRef = useRef(initial);
  const ref = useRef(initial);
  const [byClick, setByClick] = useState(initial);

  const set = useCallback((reason: KeepOpenReason, on: boolean) => {
    if (reason === 'focus') focusRef.current = on;
    else {
      clickRef.current = on;
      setByClick(on);
    }
    ref.current = focusRef.current || clickRef.current;
  }, []);

  // Falling edge only, so a focusin during the open delay isn't clobbered.
  const prevOpenRef = useRef(isOpen);
  useEffect(() => {
    if (prevOpenRef.current && !isOpen) {
      set('focus', false);
      set('click', false);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, set]);

  return useMemo(
    () => ({ ref, focusRef, clickRef, byClick, set }),
    [byClick, set]
  );
};
