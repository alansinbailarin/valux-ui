"use client";

import { useLayoutEffect, useRef } from "react";

import type { MenuContentProps } from "./Menu.types";
import { useMenuContext } from "./MenuContext";
import { useMenuKeyboard } from "./useMenuKeyboard";
import { useMenuPosition } from "./useMenuPosition";
import { useDismiss } from "../a11y/useDismiss";
import { useCloseScrub } from "../morph/useCloseScrub";
import { useMorph } from "../morph/useMorph";

export function MenuContentSurface({
  children,
  side = "auto",
  align = "auto",
  surface = "auto",
  className,
  style,
  ...props
}: MenuContentProps) {
  const { phase, setOpen, setPhase, triggerRef, menuId, preset, pointBloom } = useMenuContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const active = phase === "opening" || phase === "open";

  useMenuPosition({ panelRef, ghostRef, triggerRef, phase, side, align, surface });

  useMorph({
    phase,
    panelRef,
    triggerRef,
    ghostRef,
    preset,
    onOpened: () => setPhase("open"),
    onClosed: () => setPhase("closed"),
  });
  useDismiss({
    active,
    dismissable: true,
    panelRef,
    onDismiss: () => setOpen(false),
  });
  useCloseScrub({
    panelRef,
    triggerRef,
    active: phase === "open",
    onDismiss: () => setOpen(false),
  });
  useMenuKeyboard({ ref: panelRef, active, onClose: () => setOpen(false) });

  useLayoutEffect(() => {
    if (phase === "open") {
      panelRef.current
        ?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')
        ?.focus();
    }
  }, [phase]);

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    return () => {
      trigger?.focus?.();
    };
  }, [triggerRef]);

  return (
    <div
      {...props}
      ref={panelRef}
      id={menuId}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby={`${menuId}-trigger`}
      data-vx-menu=""
      data-vx-phase={phase}
      data-vx-point-bloom={pointBloom ? "" : undefined}
      className={["vx-menu", className].filter(Boolean).join(" ")}
      style={{ position: "fixed", ...style }}
    >
      {children}
      {phase === "closing" ? (
        <div aria-hidden="true" className="vx-menu-ghost">
          <span ref={ghostRef} className="vx-menu-ghost__inner" />
        </div>
      ) : null}
    </div>
  );
}
