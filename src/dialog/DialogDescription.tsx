"use client";

import type { DialogDescriptionProps } from "./Dialog.types";
import { useDialogContext } from "./DialogContext";

/** Supporting copy under the title; wires aria-describedby automatically. */
export function DialogDescription({
  className,
  children,
  ...props
}: DialogDescriptionProps) {
  const { dialogId } = useDialogContext();

  return (
    <p
      {...props}
      id={`${dialogId}-description`}
      className={["vx-dialog__description", className].filter(Boolean).join(" ")}
    >
      {children}
    </p>
  );
}
