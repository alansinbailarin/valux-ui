import type { HTMLAttributes } from "react";

export type MenuSeparatorProps = HTMLAttributes<HTMLDivElement>;

export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return (
    <div
      {...props}
      role="separator"
      aria-orientation="horizontal"
      data-vx-menu-separator=""
      className={["vx-menu-separator", className].filter(Boolean).join(" ")}
    />
  );
}
