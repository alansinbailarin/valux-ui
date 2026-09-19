import { createContext, useContext } from "react";
import type { MutableRefObject } from "react";

import type { MorphPhase } from "../morph/useMorph";

export interface PopoverContextValue {
  open: boolean;
  phase: MorphPhase;
  setOpen: (open: boolean) => void;
  setPhase: (phase: MorphPhase) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  popoverId: string;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(): PopoverContextValue {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error("Popover parts must be used within <Popover>.");
  }

  return context;
}
