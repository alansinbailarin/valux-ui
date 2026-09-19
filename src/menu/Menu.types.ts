import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import type { MorphPhase } from "../morph/useMorph";

export type { MorphPhase };
export type MenuSide = "top" | "bottom" | "left" | "right" | "auto";
export type MenuAlign = "start" | "center" | "end" | "auto";

export interface MenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface MenuTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge the trigger behavior onto your own single child element
   * (e.g. a library Button) instead of rendering a plain <button>. */
  asChild?: boolean;
}

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: MenuSide;
  align?: MenuAlign;
  /** "auto" follows the theme; "trigger" adopts the trigger's solid colors so
   * the morph keeps perfect color continuity. */
  surface?: "auto" | "trigger";
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  destructive?: boolean;
  /** Trailing hint (e.g. "⌘D"). String shortcuts are FUNCTIONAL while the
   * menu is open: the matching combo activates the item. */
  shortcut?: ReactNode;
  onSelect?: () => void;
}
