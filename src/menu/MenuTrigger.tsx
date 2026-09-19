"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { MouseEvent, ReactElement } from "react";

import type { MenuTriggerProps } from "./Menu.types";
import { useMenuContext } from "./MenuContext";

type ChildProps = {
  className?: string;
  children?: React.ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function MenuTrigger({
  asChild,
  children,
  className,
  onClick,
  ...props
}: MenuTriggerProps) {
  const { open, phase, setOpen, triggerRef, menuId } = useMenuContext();
  const hidden = phase !== "closed";
  // "landed" marks the instant the panel unmounts after a close, so icons can
  // play their re-entrance exactly when they become visible.
  const [landed, setLanded] = useState(false);
  const previousPhase = useRef(phase);
  useEffect(() => {
    if (previousPhase.current === "closing" && phase === "closed") {
       
      setLanded(true);
      const timer = setTimeout(() => setLanded(false), 500);
      previousPhase.current = phase;
      return () => clearTimeout(timer);
    }
    previousPhase.current = phase;
  }, [phase]);
  const origin =
    phase === "closing"
      ? "closing"
      : hidden
        ? "hidden"
        : landed
          ? "landed"
          : undefined;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(!open);
    },
    [onClick, setOpen, open],
  );

  const shared = {
    id: `${menuId}-trigger`,
    "aria-haspopup": "menu" as const,
    "aria-expanded": open,
    "aria-controls": hidden ? menuId : undefined,
    "data-vx-menu-origin": origin,
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
  };

  if (asChild && isValidElement<ChildProps>(children)) {
    const child = children as ReactElement<ChildProps>;
    // cloneElement only STORES the callback ref on the element; React invokes
    // it at commit, not during render — the standard asChild merge pattern.
    return cloneElement(
      child,
      // eslint-disable-next-line react-hooks/refs
      {
        ...props,
        ...shared,
        className: ["vx-menu-trigger", child.props.className, className]
          .filter(Boolean)
          .join(" "),
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          child.props.onClick?.(event);
          handleClick(event);
        },
      },
      <span className="vx-menu-trigger__content">{child.props.children}</span>,
    );
  }

  return (
    <button
      {...props}
      {...shared}
      type="button"
      className={["vx-menu-trigger", className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      <span className="vx-menu-trigger__content">{children}</span>
    </button>
  );
}
