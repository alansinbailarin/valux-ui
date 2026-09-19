"use client";

import { useRef } from "react";
import type { HTMLAttributes, PointerEvent as ReactPointerEvent } from "react";

import { useContextMenuPoint } from "./ContextMenu";
import { useMenuContext } from "../menu/MenuContext";

const LONG_PRESS_MS = 500;
const CANCEL_DISTANCE = 10;

/** The right-clickable area: contextmenu on desktop, LONG-PRESS on touch
 * (iOS never fires contextmenu). The iOS callout is suppressed via CSS. */
export function ContextMenuTrigger({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { setOpen } = useMenuContext();
  const setPoint = useContextMenuPoint();
  const press = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);

  const openAt = (x: number, y: number) => {
    setPoint({ x, y });
    setOpen(true);
  };

  const clearPress = () => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;
    const { clientX, clientY } = event;
    clearPress();
    press.current = {
      x: clientX,
      y: clientY,
      timer: setTimeout(() => {
        press.current = null;
        openAt(clientX, clientY);
      }, LONG_PRESS_MS),
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!press.current) return;
    if (
      Math.abs(event.clientX - press.current.x) > CANCEL_DISTANCE ||
      Math.abs(event.clientY - press.current.y) > CANCEL_DISTANCE
    ) {
      clearPress();
    }
  };

  return (
    <div
      {...props}
      data-vx-context-trigger=""
      className={["vx-context-trigger", className].filter(Boolean).join(" ")}
      onContextMenu={(event) => {
        event.preventDefault();
        openAt(event.clientX, event.clientY);
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
    >
      {children}
    </div>
  );
}
