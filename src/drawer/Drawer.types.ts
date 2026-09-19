import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import type { MorphPhase } from "../morph/useMorph";

export type { MorphPhase };

export type DrawerSide = "left" | "right";
export type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface DrawerTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge the trigger behavior onto your own single child element. */
  asChild?: boolean;
}

export interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Which edge the drawer slides from. Default "right". */
  side?: DrawerSide;
  /** Panel width: sm 18rem · md 22rem · lg 28rem. Default "md". */
  size?: DrawerSize;
  dismissable?: boolean;
  /** Accessible label for the built-in top-right close button. */
  closeLabel?: string;
}

export interface DrawerCloseProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export type DrawerTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type DrawerDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
