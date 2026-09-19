import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import type { MorphPhase } from "../morph/useMorph";

export type { MorphPhase };

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface SheetTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge the trigger behavior onto your own single child element. */
  asChild?: boolean;
}

export type SheetHeight = "auto" | "half" | "full";

export interface SheetContentProps extends HTMLAttributes<HTMLDivElement> {
  dismissable?: boolean;
  /** Accessible label for the built-in top-right close button. */
  closeLabel?: string;
  /** "auto" hugs the content (up to 85dvh); "half" and "full" are fixed
   * detents. Content scrolls internally past the detent. */
  height?: SheetHeight;
  /** Allow pulling the sheet UP to expand it to (almost) full height. */
  expandable?: boolean;
}

export interface SheetCloseProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export type SheetTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type SheetDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
