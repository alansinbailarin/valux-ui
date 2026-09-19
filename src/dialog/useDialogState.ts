import { useCallback, useState } from "react";

export interface DialogStateOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useDialogState({
  open,
  defaultOpen = false,
  onOpenChange,
}: DialogStateOptions): readonly [boolean, (next: boolean) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolled;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return [isOpen, setOpen] as const;
}
