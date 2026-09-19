"use client";

import type { HTMLAttributes } from "react";

/** Bold first line for rich, multi-line tooltips. */
export function TooltipTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p {...props} className={["vx-tooltip__title", className].filter(Boolean).join(" ")}>
      {children}
    </p>
  );
}

/** Supporting copy under the title. */
export function TooltipDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={["vx-tooltip__description", className].filter(Boolean).join(" ")}
    >
      {children}
    </p>
  );
}
