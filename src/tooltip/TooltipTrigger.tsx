"use client";

import { cloneElement, isValidElement } from "react";
import type { FocusEvent, PointerEvent, ReactElement } from "react";

import type { TooltipTriggerProps } from "./Tooltip.types";
import { useTooltipContext } from "./TooltipContext";

type ChildProps = Record<string, unknown>;

export function TooltipTrigger({
  asChild,
  children,
  className,
  ...props
}: TooltipTriggerProps) {
  const { phase, scheduleShow, show, hide, triggerRef, tooltipId } =
    useTooltipContext();

  const shared = {
    "aria-describedby": phase !== "closed" ? tooltipId : undefined,
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
    onPointerEnter: (event: PointerEvent) => {
      // Touch has no hover; the control's label must stand on its own there.
      if (event.pointerType !== "touch") scheduleShow();
    },
    onPointerLeave: () => hide(),
    onPointerDown: () => hide(),
    onFocus: (event: FocusEvent<HTMLElement>) => {
      // Keyboard focus shows immediately; pointer-initiated focus stays on
      // the hover schedule.
      if (event.currentTarget.matches(":focus-visible")) show();
    },
    onBlur: () => hide(),
  };

  if (asChild && isValidElement<ChildProps>(children)) {
    const child = children as ReactElement<ChildProps>;
    const chain =
      (theirs: unknown, ours: (...args: never[]) => void) =>
      (...args: never[]) => {
        if (typeof theirs === "function") (theirs as typeof ours)(...args);
        ours(...args);
      };
    // cloneElement only STORES the callback ref; React invokes it at commit.
    return cloneElement(
      child,
       
      {
        ...props,
        ...shared,
        onPointerEnter: chain(child.props.onPointerEnter, shared.onPointerEnter),
        onPointerLeave: chain(child.props.onPointerLeave, shared.onPointerLeave),
        onPointerDown: chain(child.props.onPointerDown, shared.onPointerDown),
        onFocus: chain(child.props.onFocus, shared.onFocus),
        onBlur: chain(child.props.onBlur, shared.onBlur),
      },
    );
  }

  return (
    <button
      {...props}
      {...shared}
      type="button"
      className={["vx-tooltip-trigger", className].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}
