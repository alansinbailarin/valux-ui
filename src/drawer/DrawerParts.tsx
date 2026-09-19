"use client";

import type { HTMLAttributes } from "react";

import type { DrawerDescriptionProps, DrawerTitleProps } from "./Drawer.types";
import { useDrawerContext } from "./DrawerContext";
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
export const DrawerHeader = part("vx-drawer__header");

/** The one scrollable region (header/footer stay pinned), with the same
 * progressive top fog as the Dialog body. */
export const DrawerBody = scrollBody("vx-drawer__body", "vx-drawer__fog");

/** Standardized action row; stacks full-width on narrow screens. */
export const DrawerFooter = part("vx-drawer__footer");

/** Semantic drawer heading; deterministic id lets the panel label itself. */
export function DrawerTitle({ className, children, ...props }: DrawerTitleProps) {
  const { drawerId } = useDrawerContext();
  return (
    <h2
      {...props}
      id={`${drawerId}-title`}
      className={["vx-drawer__title", className].filter(Boolean).join(" ")}
    >
      {children}
    </h2>
  );
}

export function DrawerDescription({
  className,
  children,
  ...props
}: DrawerDescriptionProps) {
  const { drawerId } = useDrawerContext();
  return (
    <p
      {...props}
      id={`${drawerId}-description`}
      className={["vx-drawer__description", className].filter(Boolean).join(" ")}
    >
      {children}
    </p>
  );
}
