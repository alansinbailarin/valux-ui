"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import type { MorphPhase, TooltipProps } from "./Tooltip.types";
import { TooltipContext } from "./TooltipContext";
import { markTooltipHidden, tooltipsAreWarm } from "./tooltipWarmth";
import { useDialogState } from "../dialog/useDialogState";

/** A label that buds out of its control on hover/focus. Unlike the other
 * morphing surfaces the trigger NEVER hides — you are pointing at it. */
export function Tooltip({
  open,
  defaultOpen,
  onOpenChange,
  delay = 400,
  children,
}: TooltipProps) {
  const [isOpen, setOpen] = useDialogState({ open, defaultOpen, onOpenChange });
  const [phase, setPhase] = useState<MorphPhase>("closed");
  const triggerRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tooltipId = useId();

  useEffect(() => {
    // Same self-healing phase reconciliation as every surface in the kit.
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
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const show = useCallback(() => {
    clearTimeout(timerRef.current);
    setOpen(true);
  }, [setOpen]);
  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    markTooltipHidden();
    setOpen(false);
  }, [setOpen]);
  const scheduleShow = useCallback(() => {
    clearTimeout(timerRef.current);
    // Warm group: a neighbor just showed — no second wait.
    if (tooltipsAreWarm()) return setOpen(true);
    timerRef.current = setTimeout(() => setOpen(true), delay);
  }, [setOpen, delay]);

  return (
    <TooltipContext.Provider
      value={{ phase, setPhase, scheduleShow, show, hide, triggerRef, tooltipId }}
    >
      {children}
    </TooltipContext.Provider>
  );
}
