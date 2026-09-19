"use client";

import { createContext, useContext } from "react";
import type { RefObject } from "react";

import type { MorphPhase, SelectOption } from "./Select.types";

export interface SelectContextValue {
  options: SelectOption[];
  value: string | undefined;
  select: (value: string) => void;
  open: boolean;
  phase: MorphPhase;
  setOpen: (open: boolean) => void;
  setPhase: (phase: MorphPhase) => void;
  triggerRef: RefObject<HTMLElement | null>;
  selectId: string;
  disabled: boolean;
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelectContext(): SelectContextValue {
  const context = useContext(SelectContext);
  if (!context) throw new Error("Select parts must live inside <Select>");
  return context;
}
