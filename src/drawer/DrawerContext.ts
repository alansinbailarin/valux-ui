"use client";

import { createContext, useContext } from "react";
import type { MutableRefObject } from "react";

import type { MorphPhase } from "../morph/useMorph";

export interface DrawerContextValue {
  open: boolean;
  phase: MorphPhase;
  setOpen: (open: boolean) => void;
  setPhase: (phase: MorphPhase) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  drawerId: string;
}

export const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawerContext(): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) throw new Error("Drawer parts must be used within <Drawer>.");
  return context;
}
