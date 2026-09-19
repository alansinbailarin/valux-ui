"use client";

import type { DialogTitleProps } from "./Dialog.types";
import { useDialogContext } from "./DialogContext";

/** Semantic dialog heading. Its deterministic id lets the panel label itself
 * (aria-labelledby) automatically; style or replace freely via props. */
export function DialogTitle({ className, children, ...props }: DialogTitleProps) {
  const { dialogId } = useDialogContext();

  return (
    <h2
      {...props}
      id={`${dialogId}-title`}
      className={["vx-dialog__title", className].filter(Boolean).join(" ")}
    >
      {children}
    </h2>
  );
}
