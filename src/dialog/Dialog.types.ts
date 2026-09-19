import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  RefObject,
} from "react";

import type { MorphPhase } from "../morph/useMorph";

export type { MorphPhase };
export type DialogPlacement = "trigger" | "center";
export type DialogSide = "top" | "bottom" | "left" | "right" | "auto";
export type DialogAlign = "start" | "center" | "end" | "auto";
export type DialogSize = "sm" | "md" | "lg" | "full";

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface DialogTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge the trigger behavior onto your own single child element
   * (e.g. a library Button) instead of rendering a plain <button>. */
  asChild?: boolean;
}

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Where the dialog lands. Default "trigger": anchored next to its trigger
   * (collision-aware, like the Menu). "center" travels to the middle. */
  placement?: DialogPlacement;
  side?: DialogSide;
  align?: DialogAlign;
  dismissable?: boolean;
  /** "auto" follows the theme; "trigger" adopts the trigger's solid colors. */
  surface?: "auto" | "trigger";
  /** Panel width step; "full" takes over the whole viewport. */
  size?: DialogSize;
  /** Accessible label for the built-in top-right close button. */
  closeLabel?: string;
  /** Announce as role="alertdialog" (destructive/urgent confirmations). */
  alert?: boolean;
  /** Focus this element on open instead of the first tabbable. */
  initialFocus?: RefObject<HTMLElement | null>;
}

export type DialogTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type DialogDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export interface DialogCloseProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
