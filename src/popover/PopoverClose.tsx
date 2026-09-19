"use client";

import { cloneElement, isValidElement, useCallback } from "react";
import type { MouseEvent, ReactElement } from "react";

import type { PopoverCloseProps } from "./Popover.types";
import { usePopoverContext } from "./PopoverContext";

type ChildProps = {
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function PopoverClose({
  asChild,
  children,
  className,
  onClick,
  ...props
}: PopoverCloseProps) {
  const { setOpen } = usePopoverContext();

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
      className: ["vx-popover-close", child.props.className, className]
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
      className={["vx-popover-close", className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
