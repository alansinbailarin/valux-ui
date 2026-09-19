import type { HTMLAttributes } from "react";

export type MenuLabelProps = HTMLAttributes<HTMLDivElement>;

/** Presentational section heading inside a menu (not focusable, no role). */
export function MenuLabel({ children, className, ...props }: MenuLabelProps) {
  return (
    <div
      {...props}
      data-vx-menu-label=""
      className={["vx-menu-label", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
