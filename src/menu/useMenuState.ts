import { useCallback, useState } from "react";

export interface MenuStateOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useMenuState({
  open,
  defaultOpen = false,
  onOpenChange,
}: MenuStateOptions): readonly [boolean, (next: boolean) => void] {
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
