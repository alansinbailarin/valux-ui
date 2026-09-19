"use client";

import { cloneElement, isValidElement, useCallback } from "react";
import type { MouseEvent, ReactElement } from "react";

import type { SheetCloseProps } from "./Sheet.types";
import { useSheetContext } from "./SheetContext";

type ChildProps = {
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function SheetClose({
  asChild,
  children,
  className,
  onClick,
  ...props
}: SheetCloseProps) {
  const { setOpen } = useSheetContext();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(false);
    },
    [onClick, setOpen],
  );

  if (asChild && isValidElement<ChildProps>(children)) {
    const child = children as ReactElement<ChildProps>;
    return cloneElement(child, {
      ...props,
      className: ["vx-sheet-close", child.props.className, className]
        .filter(Boolean)
        .join(" "),
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        child.props.onClick?.(event);
        handleClick(event);
      },
    });
  }

  return (
    <button
      {...props}
      type="button"
      className={["vx-sheet-close", className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
