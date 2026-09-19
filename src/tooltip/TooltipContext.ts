import { createContext, useContext } from "react";
import type { MutableRefObject } from "react";

import type { MorphPhase } from "../morph/useMorph";

export interface TooltipContextValue {
  phase: MorphPhase;
  setPhase: (phase: MorphPhase) => void;
  /** Show after the hover delay (canceled by hide). */
  scheduleShow: () => void;
  /** Show immediately (keyboard focus). */
  show: () => void;
  hide: () => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  tooltipId: string;
}

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltipContext(): TooltipContextValue {
  const context = useContext(TooltipContext);

  if (!context) {
    throw new Error("Tooltip parts must be used within <Tooltip>.");
  }

  return context;
}
