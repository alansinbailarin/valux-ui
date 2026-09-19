"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { MenuProps, MorphPhase } from "./Menu.types";
import { MenuContext } from "./MenuContext";
import { useMenuState } from "./useMenuState";

export function Menu({ open, defaultOpen, onOpenChange, children }: MenuProps) {
  const [isOpen, setOpen] = useMenuState({ open, defaultOpen, onOpenChange });
  const [phase, setPhase] = useState<MorphPhase>("closed");
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    // Reconcile the (possibly controlled) open state with the animation
    // phase. Depending on BOTH values makes the machine self-healing: a
    // toggle that lands mid-animation (e.g. re-open while the close morph is
    // in flight) re-enters the right phase instead of wedging.
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
    <MenuContext.Provider
      value={{ open: isOpen, phase, setOpen, setPhase, triggerRef, menuId }}
    >
      {children}
    </MenuContext.Provider>
  );
}
