"use client";

import { cloneElement, isValidElement, useCallback } from "react";
import type { MouseEvent, ReactElement } from "react";

import type { DrawerTriggerProps } from "./Drawer.types";
import { useDrawerContext } from "./DrawerContext";

type ChildProps = {
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

/** No morph choreography: the panel slides in from its edge on its own. */
export function DrawerTrigger({
  asChild,
  children,
  className,
  onClick,
  ...props
}: DrawerTriggerProps) {
  const { open, phase, setOpen, triggerRef, drawerId } = useDrawerContext();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(!open);
    },
    [onClick, setOpen, open],
  );

  const shared = {
    id: `${drawerId}-trigger`,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
    "aria-controls": phase !== "closed" ? drawerId : undefined,
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
      className: ["vx-drawer-trigger", child.props.className, className]
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
      className={["vx-drawer-trigger", className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
