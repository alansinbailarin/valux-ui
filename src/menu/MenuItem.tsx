"use client";

import { useCallback } from "react";
import type { MouseEvent } from "react";

import type { MenuItemProps } from "./Menu.types";
import { useMenuContext } from "./MenuContext";

export function MenuItem({
  children,
  className,
  icon,
  destructive,
  shortcut,
  disabled,
  onSelect,
  onClick,
  ...props
}: MenuItemProps) {
  const { setOpen } = useMenuContext();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) return;
      onSelect?.();
      setOpen(false);
    },
    [onClick, disabled, onSelect, setOpen],
  );

  return (
    <button
      {...props}
      type="button"
      role="menuitem"
      disabled={disabled}
      aria-disabled={disabled || undefined}
      data-vx-menu-item=""
      data-vx-shortcut={typeof shortcut === "string" ? shortcut : undefined}
      data-vx-destructive={destructive ? "" : undefined}
      className={["vx-menu-item", className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      {icon ? (
        <span aria-hidden="true" className="vx-menu-item__icon">
          {icon}
        </span>
      ) : null}
      <span className="vx-menu-item__label">{children}</span>
      {shortcut ? (
        <span aria-hidden="true" className="vx-menu-item__shortcut">
          {shortcut}
        </span>
      ) : null}
    </button>
  );
}
