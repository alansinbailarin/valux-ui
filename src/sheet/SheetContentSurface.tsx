"use client";

import { useLayoutEffect, useRef } from "react";

import type { SheetContentProps } from "./Sheet.types";
import { useSheetContext } from "./SheetContext";
import { useSheetExpand } from "./useSheetExpand";
import { useSheetPhase } from "./useSheetPhase";
import { useDismiss } from "../a11y/useDismiss";
import { useFocusTrap } from "../a11y/useFocusTrap";
import { useInertBackground } from "../a11y/useInertBackground";
import { usePullDismiss } from "../a11y/usePullDismiss";
import { useScrollLock } from "../a11y/useScrollLock";
import { useDialogAria } from "../dialog/useDialogAria";

interface SurfaceProps extends SheetContentProps {
  portalNode: HTMLElement;
}

export function SheetContentSurface({
  portalNode,
  children,
  dismissable = true,
  height = "auto",
  expandable = false,
  className,
  ...props
}: SurfaceProps) {
  const { phase, setOpen, setPhase, triggerRef, sheetId } = useSheetContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const active = phase === "opening" || phase === "open";

  useSheetPhase(panelRef, phase, setPhase);
  useSheetExpand({ panelRef, active: phase === "open", expandable });
  useDialogAria(panelRef, sheetId, phase, "Sheet");
  useDismiss({ active, dismissable, panelRef, onDismiss: () => setOpen(false) });
  usePullDismiss({
    panelRef,
    active: phase === "open" && dismissable,
    onDismiss: () => setOpen(false),
  });
  useScrollLock(active);
  useInertBackground(portalNode, active);
  useFocusTrap(panelRef, phase === "open");

  // Restore focus to the trigger once the sheet leaves the tree.
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    return () => trigger?.focus();
  }, [triggerRef]);

  return (
    <div
      {...props}
      ref={panelRef}
      id={sheetId}
      role="dialog"
      aria-modal="true"
      data-vx-sheet=""
      data-vx-phase={phase}
      data-vx-height={height}
      className={["vx-sheet", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
