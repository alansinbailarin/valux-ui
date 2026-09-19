"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { MorphPhase, PopoverProps } from "./Popover.types";
import { PopoverContext } from "./PopoverContext";
import { useDialogState } from "../dialog/useDialogState";

/** Anchored, NON-modal surface that morphs from its trigger — the Menu's
 * body with free-form content instead of menu semantics. */
export function Popover({ open, defaultOpen, onOpenChange, children }: PopoverProps) {
  const [isOpen, setOpen] = useDialogState({ open, defaultOpen, onOpenChange });
  const [phase, setPhase] = useState<MorphPhase>("closed");
  const triggerRef = useRef<HTMLElement | null>(null);
  const popoverId = useId();

  useEffect(() => {
    // Same self-healing reconciliation as Menu/Dialog: depending on BOTH
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
    <PopoverContext.Provider
      value={{ open: isOpen, phase, setOpen, setPhase, triggerRef, popoverId }}
    >
      {children}
    </PopoverContext.Provider>
  );
}
