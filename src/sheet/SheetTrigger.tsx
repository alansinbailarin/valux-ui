"use client";

import { cloneElement, isValidElement, useCallback } from "react";
import type { MouseEvent, ReactElement } from "react";

import type { SheetTriggerProps } from "./Sheet.types";
import { useSheetContext } from "./SheetContext";

type ChildProps = {
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

/** The sheet's trigger stays put — no morph choreography: the panel slides up
 * from the bottom edge on its own. */
export function SheetTrigger({
  asChild,
  children,
  className,
  onClick,
  ...props
}: SheetTriggerProps) {
  const { open, phase, setOpen, triggerRef, sheetId } = useSheetContext();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(!open);
    },
    [onClick, setOpen, open],
  );

  const shared = {
    id: `${sheetId}-trigger`,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
    "aria-controls": phase !== "closed" ? sheetId : undefined,
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
  };

  if (asChild && isValidElement<ChildProps>(children)) {
    const child = children as ReactElement<ChildProps>;
    // cloneElement only STORES the callback ref; React invokes it at commit.
    // eslint-disable-next-line react-hooks/refs
    return cloneElement(child, {
      ...props,
      ...shared,
      className: ["vx-sheet-trigger", child.props.className, className]
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
      {...shared}
      type="button"
      className={["vx-sheet-trigger", className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
