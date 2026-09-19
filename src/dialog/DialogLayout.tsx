"use client";

import type { HTMLAttributes, UIEvent } from "react";

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

/** Scrollable region with a progressive top fog: at the very top there is
 * nothing; once scrolled, content slides under a soft blur strip. */
export function scrollBody(className: string, fogClassName: string) {
  return function Body({
    className: extra,
    children,
    onScroll,
    ...props
  }: HTMLAttributes<HTMLDivElement>) {
    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
      onScroll?.(event);
      const el = event.currentTarget;
      el.toggleAttribute("data-vx-scrolled", el.scrollTop > 4);
    };
    return (
      <div
        {...props}
        onScroll={handleScroll}
        className={[className, extra].filter(Boolean).join(" ")}
      >
        <div aria-hidden="true" className={fogClassName} />
        {children}
      </div>
    );
  };
}

/** Groups Icon + Title + Description. With a Body present, the header (and
 * the X) stay PINNED while only the body scrolls. */
export const DialogHeader = part("vx-dialog__header");

/** The one scrollable region of a long dialog — title, X, and footer stay
 * put. Without it, the whole panel scrolls (short dialogs need nothing). */
export const DialogBody = scrollBody("vx-dialog__body", "vx-dialog__fog");

/** Standardized action row: right-aligned with consistent spacing; on narrow
 * screens the actions stack full-width (primary on top). */
export const DialogFooter = part("vx-dialog__footer");
