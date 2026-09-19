"use client";

import type { HTMLAttributes } from "react";

import { scrollBody } from "../dialog/DialogLayout";

function part(className: string) {
  return function Part({
    className: extra,
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement>) {
    return (
      <div {...props} className={[className, extra].filter(Boolean).join(" ")}>
        {children}
      </div>
    );
  };
}

/** Groups Title + Description; pinned while a Body scrolls. */
export const SheetHeader = part("vx-sheet__header");

/** The one scrollable region of a tall sheet (header/footer stay pinned),
 * with the same progressive top fog as the Dialog body. */
export const SheetBody = scrollBody("vx-sheet__body", "vx-sheet__fog");

/** Standardized action row; stacks full-width on narrow screens. */
export const SheetFooter = part("vx-sheet__footer");
