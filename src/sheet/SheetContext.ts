import { createContext, useContext } from "react";
import type { MutableRefObject } from "react";

import type { MorphPhase } from "../morph/useMorph";

export interface SheetContextValue {
  open: boolean;
  phase: MorphPhase;
  setOpen: (open: boolean) => void;
  setPhase: (phase: MorphPhase) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  sheetId: string;
}

export const SheetContext = createContext<SheetContextValue | null>(null);

export function useSheetContext(): SheetContextValue {
  const context = useContext(SheetContext);

  if (!context) {
    throw new Error("Sheet parts must be used within <Sheet>.");
  }

  return context;
}
