"use client";

import { useLayoutEffect, useRef } from "react";

import type { DrawerContentProps } from "./Drawer.types";
import { useDrawerContext } from "./DrawerContext";
import { useDismiss } from "../a11y/useDismiss";
import { useFocusTrap } from "../a11y/useFocusTrap";
import { useInertBackground } from "../a11y/useInertBackground";
import { usePullDismissSide } from "../a11y/usePullDismissSide";
import { useScrollLock } from "../a11y/useScrollLock";
import { useDialogAria } from "../dialog/useDialogAria";
import { useSheetPhase } from "../sheet/useSheetPhase";

interface SurfaceProps extends DrawerContentProps {
  portalNode: HTMLElement;
}

export function DrawerContentSurface({
  portalNode,
  children,
  dismissable = true,
  side = "right",
  size = "md",
  className,
  ...props
}: SurfaceProps) {
  const { phase, setOpen, setPhase, triggerRef, drawerId } = useDrawerContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const active = phase === "opening" || phase === "open";

  useSheetPhase(panelRef, phase, setPhase); // same slide-phase machine
  useDialogAria(panelRef, drawerId, phase, "Drawer");
  useDismiss({ active, dismissable, panelRef, onDismiss: () => setOpen(false) });
  usePullDismissSide({
    panelRef,
    side,
    active: phase === "open" && dismissable,
    onDismiss: () => setOpen(false),
  });
  useScrollLock(active);
  useInertBackground(portalNode, active);
  useFocusTrap(panelRef, phase === "open");

  // Restore focus to the trigger once the drawer leaves the tree.
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    return () => trigger?.focus();
  }, [triggerRef]);

  return (
    <div
      {...props}
      ref={panelRef}
      id={drawerId}
      role="dialog"
      aria-modal="true"
      data-vx-drawer=""
      data-vx-phase={phase}
      data-vx-side={side}
      data-vx-size={size}
      className={["vx-drawer", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
