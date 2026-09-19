"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { MorphPhase, SheetProps } from "./Sheet.types";
import { SheetContext } from "./SheetContext";
import { useDialogState } from "../dialog/useDialogState";

/** Bottom sheet root. Unlike the Dialog it does NOT morph from its trigger:
 * the panel slides up from the bottom edge (and slides / drags back down). */
export function Sheet({ open, defaultOpen, onOpenChange, children }: SheetProps) {
  const [isOpen, setOpen] = useDialogState({ open, defaultOpen, onOpenChange });
  const [phase, setPhase] = useState<MorphPhase>("closed");
  const triggerRef = useRef<HTMLElement | null>(null);
  const sheetId = useId();

  useEffect(() => {
    // Same self-healing reconciliation as the Dialog: depending on BOTH
    // values re-enters the right phase after mid-animation toggles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase((current) => {
      if (isOpen && (current === "closed" || current === "closing")) {
        return "opening";
      }
      if (!isOpen && (current === "open" || current === "opening")) {
        return "closing";
      }
      return current;
    });
  }, [isOpen, phase]);

  return (
    <SheetContext.Provider
      value={{ open: isOpen, phase, setOpen, setPhase, triggerRef, sheetId }}
    >
      {children}
    </SheetContext.Provider>
  );
}
