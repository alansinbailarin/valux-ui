import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import type { MenuAlign, MenuSide } from "../menu/Menu.types";
import type { MorphPhase } from "../morph/useMorph";

export type { MorphPhase };
export type TooltipSide = MenuSide;
export type TooltipAlign = MenuAlign;

export interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hover delay before showing (ms). Focus shows immediately. */
  delay?: number;
  children: ReactNode;
}

export interface TooltipTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge the trigger behavior onto your own single child element. */
  asChild?: boolean;
}

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: TooltipSide;
  align?: TooltipAlign;
}
