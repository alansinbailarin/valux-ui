"use client";

import { useEffect, useId, useRef, useState } from "react";

import { SelectContext } from "./SelectContext";
import type { MorphPhase, SelectProps } from "./Select.types";
import { useDialogState } from "../dialog/useDialogState";

/** Single-value picker: an Input-look trigger whose panel MORPHS out of
 * it (the Menu choreography), options as data, native form submit. */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  children,
}: SelectProps) {
  const [isOpen, setOpen] = useDialogState({});
  const [phase, setPhase] = useState<MorphPhase>("closed");
  const [inner, setInner] = useState(defaultValue);
  const triggerRef = useRef<HTMLElement | null>(null);
  const selectId = useId();
  const controlled = value !== undefined;
  const current = controlled ? value : inner;

  useEffect(() => {
    // Same self-healing phase reconciliation as Menu/Dialog/Popover.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase((phase) => {
      if (isOpen && (phase === "closed" || phase === "closing")) return "opening";
      if (!isOpen && (phase === "open" || phase === "opening")) return "closing";
      return phase;
    });
  }, [isOpen, phase]);

  return (
    <SelectContext.Provider
      value={{
        options,
        value: current,
        select: (next) => {
          if (!controlled) setInner(next);
          onValueChange?.(next);
          setOpen(false);
        },
        open: isOpen,
        phase,
        setOpen: (next) => {
          if (!disabled) setOpen(next);
        },
        setPhase,
        triggerRef,
        selectId,
        disabled,
      }}
    >
      {children}
      {name ? <input type="hidden" name={name} value={current ?? ""} /> : null}
    </SelectContext.Provider>
  );
}
