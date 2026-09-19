"use client";

import { useEffect, useId, useRef, useState } from "react";

import { DrawerContext } from "./DrawerContext";
import type { DrawerProps, MorphPhase } from "./Drawer.types";
import { useDialogState } from "../dialog/useDialogState";

/** The Sheet's sibling for the SIDES: a floating panel that slides in
 * from the left or right edge — navigation, carts, filter rails. */
export function Drawer({ open, defaultOpen, onOpenChange, children }: DrawerProps) {
  const [isOpen, setOpen] = useDialogState({ open, defaultOpen, onOpenChange });
  const [phase, setPhase] = useState<MorphPhase>("closed");
  const triggerRef = useRef<HTMLElement | null>(null);
  const drawerId = useId();

  useEffect(() => {
    // Same self-healing phase reconciliation as Sheet/Dialog.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase((current) => {
      if (isOpen && (current === "closed" || current === "closing")) return "opening";
      if (!isOpen && (current === "open" || current === "opening")) return "closing";
      return current;
    });
  }, [isOpen, phase]);

  return (
    <DrawerContext.Provider
      value={{ open: isOpen, phase, setOpen, setPhase, triggerRef, drawerId }}
    >
      {children}
    </DrawerContext.Provider>
  );
}
