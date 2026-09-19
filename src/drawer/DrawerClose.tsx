"use client";

import { cloneElement, isValidElement, useCallback } from "react";
import type { MouseEvent, ReactElement } from "react";

import type { DrawerCloseProps } from "./Drawer.types";
import { useDrawerContext } from "./DrawerContext";

type ChildProps = {
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function DrawerClose({
  asChild,
  children,
  className,
  onClick,
  ...props
}: DrawerCloseProps) {
  const { setOpen } = useDrawerContext();

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
      className: ["vx-drawer-close", child.props.className, className]
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
      className={["vx-drawer-close", className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
