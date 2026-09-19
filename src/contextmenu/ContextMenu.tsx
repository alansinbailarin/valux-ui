/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { MenuContext } from "../menu/MenuContext";
import type { MorphPreset } from "../morph/morphKeyframes";
import type { MorphPhase } from "../morph/useMorph";

const CONTEXT_PRESET: MorphPreset = {
  openMs: 420,
  closeMs: 340,
  streak: 1,
  blur: 4,
};

export interface ContextMenuProps {
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function ContextMenu({ onOpenChange, children }: ContextMenuProps) {
  const [isOpen, setOpenState] = useState(false);
  const [phase, setPhase] = useState<MorphPhase>("closed");
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement | null>(null);
  const themeRef = useRef<HTMLElement | null>(null);
  const menuId = useId();

  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    setPhase((current) => {
      if (isOpen && (current === "closed" || current === "closing")) return "opening";
      if (!isOpen && (current === "open" || current === "opening")) return "closing";
      return current;
    });
  }, [isOpen, phase]);

  return (
    <MenuContext.Provider
      value={{
        open: isOpen,
        phase,
        setOpen,
        setPhase,
        triggerRef,
        themeRef,
        menuId,
        preset: CONTEXT_PRESET,
        pointBloom: true,
      }}
    >
      <span ref={themeRef as React.RefObject<HTMLSpanElement>} hidden aria-hidden />
      
      {phase !== "closed" && typeof document !== "undefined"
        ? createPortal(
            <span
              aria-hidden="true"
              data-vx-context-anchor=""
              ref={triggerRef as React.RefObject<HTMLSpanElement>}
              style={{
                position: "fixed",
                left: point.x - 12,
                top: point.y - 12,
                width: 24,
                borderRadius: "50%",
                height: 24,
                pointerEvents: "none",
                zIndex: 99999,
              }}
            />,
            document.body
          )
        : null}
      <ContextMenuPointContext.Provider value={setPoint}>
        {children}
      </ContextMenuPointContext.Provider>
    </MenuContext.Provider>
  );
}

const ContextMenuPointContext = createContext<((p: { x: number; y: number }) => void) | null>(null);

export function useContextMenuPoint() {
  const setPoint = useContext(ContextMenuPointContext);
  if (!setPoint) throw new Error("ContextMenu parts must live inside <ContextMenu>");
  return setPoint;
}
