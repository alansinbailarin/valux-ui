import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import type { MenuAlign, MenuSide } from "../menu/Menu.types";
import type { MorphPhase } from "../morph/useMorph";

export type { MorphPhase };
export type PopoverSide = MenuSide;
export type PopoverAlign = MenuAlign;

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface PopoverTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge the trigger behavior onto your own single child element. */
  asChild?: boolean;
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: PopoverSide;
  align?: PopoverAlign;
  /** "auto" follows the theme; "trigger" adopts the trigger's solid colors. */
  surface?: "auto" | "trigger";
  dismissable?: boolean;
}

export interface PopoverCloseProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
