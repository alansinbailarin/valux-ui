import { createContext, useContext } from "react";
import type { MutableRefObject } from "react";

import type { MorphPhase } from "../morph/useMorph";

export interface DialogContextValue {
  open: boolean;
  phase: MorphPhase;
  setOpen: (open: boolean) => void;
  setPhase: (phase: MorphPhase) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  dialogId: string;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(): DialogContextValue {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("Dialog parts must be used within <Dialog>.");
  }

  return context;
}
