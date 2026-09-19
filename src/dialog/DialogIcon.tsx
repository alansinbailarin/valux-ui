"use client";

import type { HTMLAttributes } from "react";

export type DialogIconTone =
  | "primary"
  | "danger"
  | "success"
  | "warning"
  | "info"
  | "neutral";

export interface DialogIconProps extends HTMLAttributes<HTMLDivElement> {
  /** Semantic tint for the badge; pairs with the message ("danger" for a
   * destructive confirm, "success" for a done state...). */
  tone?: DialogIconTone;
}

/** A tinted icon badge above the title. Bring any icon (svg) — the badge
 * sizes and colors it from the theme; no icon library is bundled. */
export function DialogIcon({
  tone = "primary",
  className,
  children,
  ...props
}: DialogIconProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      data-vx-tone={tone}
      className={["vx-dialog__icon", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
