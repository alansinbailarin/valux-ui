"use client";

import type { SheetDescriptionProps, SheetTitleProps } from "./Sheet.types";
import { useSheetContext } from "./SheetContext";

/** Semantic sheet heading; deterministic id lets the panel label itself. */
export function SheetTitle({ className, children, ...props }: SheetTitleProps) {
  const { sheetId } = useSheetContext();

  return (
    <h2
      {...props}
      id={`${sheetId}-title`}
      className={["vx-sheet__title", className].filter(Boolean).join(" ")}
    >
      {children}
    </h2>
  );
}

export function SheetDescription({
  className,
  children,
  ...props
}: SheetDescriptionProps) {
  const { sheetId } = useSheetContext();

  return (
    <p
      {...props}
      id={`${sheetId}-description`}
      className={["vx-sheet__description", className].filter(Boolean).join(" ")}
    >
      {children}
    </p>
  );
}
